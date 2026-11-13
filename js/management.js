// Project details and portfolio summary share the same live response.
let pddOverallRequest = 0;

async function loadPage2Data() {
  const request = ++pddOverallRequest;
  showSkeletonRows('overallTableBody', 11, 4);
  pddSetSummaryUnavailable();
  const status = document.getElementById('overallDataStatus');
  if (status) status.textContent = 'Loading project details…';
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getOverallDashboard', {cache:'no-store'});
    if (!response.ok) throw new Error('Project request failed');
    const result = await response.json();
    if (request !== pddOverallRequest) return;
    if (result.status !== 'success' || !Array.isArray(result.data) || !result.data.length) {
      throw new Error('Project data unavailable');
    }
    renderOverallTable(result.data);
    const complete = pddUpdatePortfolioSummary(result.data);
    if (status) status.textContent = complete ? '' : 'Some summary figures are unavailable. Please review the project data.';
  } catch (error) {
    if (request !== pddOverallRequest) return;
    pddSetSummaryUnavailable();
    document.getElementById('overallTableBody').innerHTML =
      '<tr><td colspan="11" style="text-align:center;">Unable to load project details. Refresh this view to try again.</td></tr>';
    if (status) status.textContent = 'Project data could not be loaded.';
    console.error('Project details:', error);
  }
}

function pddSetSummaryUnavailable() {
  ['kpiBudget','kpiCost','kpiPaid','kpiPending','kpiBalance','kpiProgress'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = '—';
  });
  const note = document.getElementById('kpiProjectCount');
  if (note) note.textContent = 'All 8 Approved Projects';
}

function pddSummaryNumber(value, percent) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return percent ? value * 100 : value;
  }
  let text = String(value).trim();
  const hasPercent = /%$/.test(text);
  text = text.replace(/^RM\s*/i, '').replace(/,/g, '').replace(/%$/, '').trim();
  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
  const number = Number(text);
  return percent && !hasPercent ? number * 100 : number;
}

function pddUpdatePortfolioSummary(rows) {
  const projects = rows.filter(row => String(row['Project ID'] || '').trim());
  if (!projects.length) throw new Error('No project IDs');
  let complete = true;
  const fields = {kpiBudget:'Approved Budget',kpiCost:'Project Cost',kpiPaid:'Paid to Date',
    kpiPending:'Pending Claim',kpiBalance:'Budget Balance'};
  Object.entries(fields).forEach(([id, field]) => {
    const values = projects.map(row => pddSummaryNumber(row[field], false));
    const element = document.getElementById(id);
    if (values.some(value => value === null)) {complete = false; if (element) element.textContent = '—'; return;}
    const sum = values.reduce((a,b) => a+b,0);
    if (element) element.textContent = Math.abs(sum) >= 1000000
      ? 'RM ' + (sum/1000000).toLocaleString('en-MY',{maximumFractionDigits:3}) + 'M'
      : 'RM ' + sum.toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
  });
  const progress = projects.map(row => pddSummaryNumber(row['Overall Actual Progress'], true));
  const valid = progress.every(value => value !== null && value >= 0 && value <= 100);
  const element = document.getElementById('kpiProgress');
  if (element) element.textContent = valid
    ? (progress.reduce((a,b)=>a+b,0)/projects.length).toFixed(2) + '%' : '—';
  if (!valid) complete = false;
  const note = document.getElementById('kpiProjectCount');
  if (note) note.textContent = 'All ' + projects.length + ' Approved Projects';
  return complete;
}


function renderOverallTable(data) {
  const tbody = document.getElementById('overallTableBody');
  tbody.innerHTML = data.map(r => {
    let health = r['Project Health'] || r.health || 'Planned';
    let badgeClass = 'badge-planned';
    if (health === 'Ahead') badgeClass = 'badge-ahead';
    else if (health === 'On Track') badgeClass = 'badge-ontrack';
    else if (health === 'Delayed') badgeClass = 'badge-delayed';

    let grantType = r['Grant Type'] || r['grantType'] || '-';

    return `
      <tr>
        <td style="font-weight: 600;">${r['Project Name'] || r.name}</td>
        <td>${r['Funding Source'] || r.cat}</td>
        <td style="color: var(--muted);">${grantType}</td>
        <td>${formatExactRM(r['Approved Budget'] || r.budget)}</td>
        <td>${formatExactRM(r['Project Cost'] || r.cost)}</td>
        <td>${formatExactRM(r['Paid to Date'] || r.paid)}</td>
        <td style="color: var(--amber); font-weight: 600;">${formatExactRM(r['Pending Claim'] || r.claim)}</td>
        <td>${formatExactRM(r['Budget Balance'] || r.balance)}</td>
        <td>${r['Current Overall Status'] || r.status}</td>
        <td><span class="badge ${badgeClass}">${health}</span></td>
        <td style="font-weight: 600; color: var(--ink);">${r['Project Milestone'] || r['Key Milestone'] || r.milestone || '-'}</td>
      </tr>
    `;
  }).join('');
}

function setMgmtScorecardTable(type) {
  currentMgmtScorecardTable = type;
  document.getElementById('btnMgmtScorecardConsultant').classList.toggle('active', type === 'Consultant');
  document.getElementById('btnMgmtScorecardContractor').classList.toggle('active', type === 'Contractor');
  
  document.getElementById('wrapMgmtConsultantScorecard').style.display = type === 'Consultant' ? 'block' : 'none';
  document.getElementById('wrapMgmtContractorScorecard').style.display = type === 'Contractor' ? 'block' : 'none';
}

function loadHigherMgmtScorecards() {
  const filterPrj = document.getElementById('mgmtScorecardPrjFilter').value;
  const filterYear = document.getElementById('mgmtScorecardYearFilter').value;
  const filterMonth = document.getElementById('mgmtScorecardMonthFilter').value;

  showSkeletonRows('mgmtConsultantScorecardBody', 10, 3);
  showSkeletonRows('mgmtContractorScorecardBody', 10, 3);

  fetch(GOOGLE_SCRIPT_URL + "?action=getScorecardData&type=Consultant")
    .then(res => res.json())
    .then(res => { 
      if (res.status === 'success') {
        consultantScorecardFullList = res.data;
        let filtered = res.data;
        if (filterPrj !== 'ALL') filtered = filtered.filter(d => String(d['Project Name']).trim().toLowerCase() === filterPrj.trim().toLowerCase());
        if (filterYear !== 'ALL') filtered = filtered.filter(d => String(d['Month']).indexOf(filterYear) !== -1);
        if (filterMonth !== 'ALL') filtered = filtered.filter(d => String(d['Month']).toLowerCase().indexOf(filterMonth.toLowerCase()) !== -1);
        
        renderScorecardTable('mgmtConsultantScorecardBody', filtered);
        calculateScorecardKPICards();
      } 
    });

  fetch(GOOGLE_SCRIPT_URL + "?action=getScorecardData&type=Contractor")
    .then(res => res.json())
    .then(res => { 
      if (res.status === 'success') {
        contractorScorecardFullList = res.data;
        let filtered = res.data;
        if (filterPrj !== 'ALL') filtered = filtered.filter(d => String(d['Project Name']).trim().toLowerCase() === filterPrj.trim().toLowerCase());
        if (filterYear !== 'ALL') filtered = filtered.filter(d => String(d['Month']).indexOf(filterYear) !== -1);
        if (filterMonth !== 'ALL') filtered = filtered.filter(d => String(d['Month']).toLowerCase().indexOf(filterMonth.toLowerCase()) !== -1);

        renderScorecardTable('mgmtContractorScorecardBody', filtered);
        calculateScorecardKPICards();
      } 
    });
}

function calculateScorecardKPICards() {
  const targetPrj = document.getElementById('mgmtScorecardKPIPrjFilter').value;
  const prjShortName = targetPrj.split(':')[1] ? targetPrj.split(':')[1].trim().toLowerCase() : targetPrj.trim().toLowerCase();

  var cValidCount = 0, cSumAvg = 0;
  consultantScorecardFullList.forEach(d => {
    var pName = String(d['Project Name']).trim().toLowerCase();
    if (pName === prjShortName || pName === targetPrj.trim().toLowerCase() || targetPrj.toLowerCase().indexOf(pName) !== -1) {
      var p = parseFloat(d['Progress'] || 0), q = parseFloat(d['Quality'] || 0), h = parseFloat(d['HSE'] || 0), r = parseFloat(d['Reporting Compliance'] || 0), res = parseFloat(d['Responsiveness'] || 0), rec = parseFloat(d['Recovery Actions'] || 0);
      var avg = (p + q + h + r + res + rec) / 6.0;
      if (avg > 0) { cValidCount++; cSumAvg += avg; }
    }
  });
  document.getElementById('kpiConsultantAvg').innerText = (cValidCount > 0 ? (cSumAvg / cValidCount).toFixed(2) : '0.00') + " / 10";
  document.getElementById('kpiConsultantNote').innerText = targetPrj.split(':')[0] + " Active Avg";

  var kValidCount = 0, kSumAvg = 0;
  contractorScorecardFullList.forEach(d => {
    var pName = String(d['Project Name']).trim().toLowerCase();
    if (pName === prjShortName || pName === targetPrj.trim().toLowerCase() || targetPrj.toLowerCase().indexOf(pName) !== -1) {
      var p = parseFloat(d['Progress'] || 0), q = parseFloat(d['Quality'] || 0), h = parseFloat(d['HSE'] || 0), r = parseFloat(d['Reporting Compliance'] || 0), res = parseFloat(d['Responsiveness'] || 0), rec = parseFloat(d['Recovery Actions'] || 0);
      var avg = (p + q + h + r + res + rec) / 6.0;
      if (avg > 0) { kValidCount++; kSumAvg += avg; }
    }
  });
  document.getElementById('kpiContractorAvg').innerText = (kValidCount > 0 ? (kSumAvg / kValidCount).toFixed(2) : '0.00') + " / 10";
  document.getElementById('kpiContractorNote').innerText = targetPrj.split(':')[0] + " Active Avg";
}

