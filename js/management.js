// ==========================================================================
// MRANTI Higher Management Portfolio & Scorecard Views
// ==========================================================================

function loadPage2Data() {
  showSkeletonRows('overallTableBody', 11, 4);
  fetch(GOOGLE_SCRIPT_URL + "?action=getOverallDashboard")
    .then(res => res.json())
    .then(res => {
      if (res.status === 'success' && res.data.length > 0) renderOverallTable(res.data);
      else renderOverallTable(baselineOverallData);
    }).catch(() => renderOverallTable(baselineOverallData));
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
