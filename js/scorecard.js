// ==========================================================================
// Consultant & Contractor Scorecard Management
// ==========================================================================

function setScorecardType(type) {
  currentScorecardType = type;
  document.getElementById('btnScorecardConsultant').classList.toggle('active', type === 'Consultant');
  document.getElementById('btnScorecardContractor').classList.toggle('active', type === 'Contractor');
  document.getElementById('scorecardFormTitle').innerText = "Input Ratings: " + type + " Scorecard";
  document.getElementById('scorecardTableLabel').innerText = "CURRENT " + type.toUpperCase() + " SCORECARD DATA";
  loadScorecardPageData();
}

function calcAverageScorecard() {
  const p = parseFloat(document.getElementById('scoreProgress').value) || 0;
  const q = parseFloat(document.getElementById('scoreQuality').value) || 0;
  const h = parseFloat(document.getElementById('scoreHSE').value) || 0;
  const r = parseFloat(document.getElementById('scoreReporting').value) || 0;
  const res = parseFloat(document.getElementById('scoreResponsiveness').value) || 0;
  const rec = parseFloat(document.getElementById('scoreRecovery').value) || 0;
  const total = p + q + h + r + res + rec;
  document.getElementById('scoreTotal').value = total.toFixed(2);
  document.getElementById('scoreAverage').value = (total / 6.0).toFixed(2);
}

function loadScorecardPageData() {
  showSkeletonRows('pddAuthorityScorecardTableBody', 10, 3);
  fetch(GOOGLE_SCRIPT_URL + "?action=getScorecardData&type=" + currentScorecardType)
    .then(res => res.json())
    .then(res => {
      if (res.status === 'success') {
        activeScorecardData = res.data;
        filterAuthorityScorecardTable();
        loadExistingProjectScoreData();
      }
    });
}

function filterAuthorityScorecardTable() {
  const filterPrj = document.getElementById('pddAuthorityPrjFilter').value;
  const filterYear = document.getElementById('pddAuthorityYearFilter').value;
  const filterMonth = document.getElementById('pddAuthorityMonthFilter').value;

  let filtered = activeScorecardData;
  if (filterPrj !== 'ALL') filtered = filtered.filter(d => String(d['Project Name']).trim().toLowerCase() === filterPrj.trim().toLowerCase());
  if (filterYear !== 'ALL') filtered = filtered.filter(d => String(d['Month']).indexOf(filterYear) !== -1);
  if (filterMonth !== 'ALL') filtered = filtered.filter(d => String(d['Month']).toLowerCase().indexOf(filterMonth.toLowerCase()) !== -1);

  renderScorecardTable('pddAuthorityScorecardTableBody', filtered);
}

function loadExistingProjectScoreData() {
  const selectedPrj = document.getElementById('scorePrjSelect').value;
  const selectedMonth = document.getElementById('scoreMonthSelect').value;

  const match = activeScorecardData.find(d => 
    String(d['Project Name']).trim().toLowerCase() === selectedPrj.trim().toLowerCase() &&
    String(d['Month']).trim().toLowerCase() === selectedMonth.trim().toLowerCase()
  );

  if (match) {
    document.getElementById('scoreProgress').value = match['Progress'] || '';
    document.getElementById('scoreQuality').value = match['Quality'] || '';
    document.getElementById('scoreHSE').value = match['HSE'] || '';
    document.getElementById('scoreReporting').value = match['Reporting Compliance'] || '';
    document.getElementById('scoreResponsiveness').value = match['Responsiveness'] || '';
    document.getElementById('scoreRecovery').value = match['Recovery Actions'] || '';
  } else {
    document.getElementById('scoreProgress').value = '';
    document.getElementById('scoreQuality').value = '';
    document.getElementById('scoreHSE').value = '';
    document.getElementById('scoreReporting').value = '';
    document.getElementById('scoreResponsiveness').value = '';
    document.getElementById('scoreRecovery').value = '';
  }
  calcAverageScorecard();
}

function renderScorecardTable(targetTbodyId, data) {
  const tbody = document.getElementById(targetTbodyId);
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--muted);">No scorecard records found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(d => {
    var p = parseFloat(d['Progress'] || 0), q = parseFloat(d['Quality'] || 0), h = parseFloat(d['HSE'] || 0), r = parseFloat(d['Reporting Compliance'] || 0), res = parseFloat(d['Responsiveness'] || 0), rec = parseFloat(d['Recovery Actions'] || 0);
    var tot = p + q + h + r + res + rec;
    return `
      <tr>
        <td style="font-weight: 600;">${d['Project Name']}</td>
        <td>${d['Month'] || '-'}</td>
        <td>${p.toFixed(1)}</td><td>${q.toFixed(1)}</td><td>${h.toFixed(1)}</td>
        <td>${r.toFixed(1)}</td><td>${res.toFixed(1)}</td><td>${rec.toFixed(1)}</td>
        <td><strong>${tot.toFixed(2)}</strong></td>
        <td style="font-weight: 700; color: var(--blue);">${(tot / 6.0).toFixed(2)}</td>
      </tr>
    `;
  }).join('');
}

function handleScorecardSubmit(e) {
  e.preventDefault();
  const payload = {
    action: "submitScorecard",
    scorecardType: currentScorecardType,
    projectName: document.getElementById('scorePrjSelect').value,
    month: document.getElementById('scoreMonthSelect').value,
    progress: parseFloat(document.getElementById('scoreProgress').value),
    quality: parseFloat(document.getElementById('scoreQuality').value),
    hse: parseFloat(document.getElementById('scoreHSE').value),
    reporting: parseFloat(document.getElementById('scoreReporting').value),
    responsiveness: parseFloat(document.getElementById('scoreResponsiveness').value),
    recovery: parseFloat(document.getElementById('scoreRecovery').value),
    userEmail: window.currentUserEmail || "Anonymous"
  };

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(() => {
    alert(currentScorecardType + ' Scorecard updated successfully!');
    loadScorecardPageData();
  });
}
