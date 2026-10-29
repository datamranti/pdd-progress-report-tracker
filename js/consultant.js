// ==========================================================================
// Consultant Portal Workflow & Verification
// ==========================================================================

let consultantLatestBreakdownList = [];

function initConsultantProjectView() {
  if (userAuthorizedProjectsList.length === 1) {
    selectConsultantActiveProject(userAuthorizedProjectsList[0]);
  } else {
    showConsultantProjectSelector();
  }
}

function showConsultantProjectSelector() {
  document.getElementById('consultantUnlockedArea').style.display = 'none';
  const selector = document.getElementById('consultantProjectSelector');
  const grid = document.getElementById('consultantProjectButtonsGrid');
  
  grid.innerHTML = userAuthorizedProjectsList.map(prjId => {
    const prjName = getProjectNameById(prjId);
    return `
      <button type="button" class="btn-nav" style="padding: 14px; text-align: left; height: auto;" onclick="selectConsultantActiveProject('${prjId}')">
        <strong>${prjId}</strong><br><small>${prjName}</small>
      </button>
    `;
  }).join('');
  
  selector.style.display = 'block';
}

function selectConsultantActiveProject(prjId) {
  activeConsultantProjectCode = prjId;
  activeConsultantProjectName = getProjectNameById(prjId);

  document.getElementById('consultantProjectSelector').style.display = 'none';
  document.getElementById('consultantUnlockedArea').style.display = 'block';
  document.getElementById('consultantAuthenticatedProjectTitle').innerText = activeConsultantProjectCode + " - " + activeConsultantProjectName;
  document.getElementById('consultantScurveTitle').innerText = "S-Curve Analysis: " + activeConsultantProjectCode;

  if (userAuthorizedProjectsList.length > 1) {
    document.getElementById('btnConsultantSwitchPrj').style.display = 'inline-block';
  } else {
    document.getElementById('btnConsultantSwitchPrj').style.display = 'none';
  }

  loadConsultantPageData();
}

function loadConsultantPageData() {
  renderConsultantScurve();
  showSkeletonRows('consultantTableBody', 12, 3);
  showSkeletonRows('consultantScopeTableBody', 8, 2);
  showSkeletonRows('latestBreakdownTableBody', 8, 3);

  fetch(GOOGLE_SCRIPT_URL + "?action=getPendingVerifications")
    .then(res => res.json())
    .then(res => { if (res.status === 'success') { pendingVerificationsList = res.data; renderConsultantTable(); } });

  fetch(GOOGLE_SCRIPT_URL + "?action=getPendingScopeVerifications")
    .then(res => res.json())
    .then(res => { if (res.status === 'success') { pendingScopeVerificationsList = res.data; renderConsultantScopeTable(); } });

  fetch(GOOGLE_SCRIPT_URL + "?action=getProjectHistory&projectId=" + activeConsultantProjectCode)
    .then(res => res.json())
    .then(res => { 
      if (res.status === 'success') {
        consultantLatestBreakdownList = res.data;
        populateConsultantBreakdownTradeFilter(res.data);
        renderLatestBreakdownTable('latestBreakdownTableBody', res.data);
      }
    });
}

function populateConsultantBreakdownTradeFilter(data) {
  const sel = document.getElementById('consultantBreakdownTradeFilter');
  if (!sel) return;
  const uniqueTrades = [...new Set(data.map(d => (d['Trade'] || '').trim()).filter(Boolean))];
  sel.innerHTML = '<option value="ALL">All Trades</option>' + 
    uniqueTrades.map(t => `<option value="${t}">${t}</option>`).join('');
}

function filterConsultantBreakdownTable() {
  const selTrade = document.getElementById('consultantBreakdownTradeFilter').value;
  if (selTrade === 'ALL') {
    renderLatestBreakdownTable('latestBreakdownTableBody', consultantLatestBreakdownList);
  } else {
    const filtered = consultantLatestBreakdownList.filter(d => (d['Trade'] || '').trim().toLowerCase() === selTrade.trim().toLowerCase());
    renderLatestBreakdownTable('latestBreakdownTableBody', filtered);
  }
}

function renderConsultantTable() {
  const tbody = document.getElementById('consultantTableBody');

  let filtered = pendingVerificationsList;
  if (activeConsultantProjectCode) filtered = filtered.filter(h => h.sheetName === activeConsultantProjectCode);

  if (!filtered || filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="12" style="text-align: center; color: var(--muted);">No pending progress reports requiring verification.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(h => {
    var planNum = parsePercentageVal(h['Planned']);
    var actNum = parsePercentageVal(h['Actual']);
    var varNum = (actNum - planNum).toFixed(2);
    var docCell = (h['Supporting Document'] && h['Supporting Document'] !== '-') ? `<button class="btn-doc" onclick="openDocumentModal('${h['Supporting Document']}')">📎 View File</button>` : '-';

    return `
      <tr>
        <td style="font-weight: 600;">${h['Project Name']}</td>
        <td>${h['Subscope'] || h['Scope Category'] || 'N/A'}<br><small style="color: var(--muted);">${h['Trade'] || 'N/A'}</small></td>
        <td>${h['Reporting Cadence'] || 'Biweekly'}</td>
        <td>${formatMonthText(h['Reporting Month'])}</td>
        <td>${formatDateShort(h['Exact Date'] || h['Reporting Segment Period'])}</td>
        <td>${planNum.toFixed(2)}%</td>
        <td><strong>${actNum.toFixed(2)}%</strong></td>
        <td style="color: ${varNum >= 0 ? 'var(--green)' : 'var(--red)'}; font-weight: 600;">${(varNum >= 0 ? '+' : '') + varNum}%</td>
        <td>${h['Status'] || h['Overall Project Status'] || 'On Track'}</td>
        <td style="max-width: 180px;">${h['Remarks'] || '-'}</td>
        <td>${docCell}</td>
        <td>
          <div style="display: flex; gap: 4px;">
            <button class="btn-action btn-verify" onclick="verifyRecord('${h.sheetName}', ${h.rowNumber}, 'verifyProgress')">Verify</button>
            <button class="btn-action btn-reject" onclick="promptRejectRecord('${h.sheetName}', ${h.rowNumber})">Reject</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderConsultantScopeTable() {
  const tbody = document.getElementById('consultantScopeTableBody');
  let filtered = pendingScopeVerificationsList;
  if (activeConsultantProjectCode) filtered = filtered.filter(h => h.prjId === activeConsultantProjectCode);

  if (!filtered || filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--muted);">No pending schedule setup changes.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(h => `
    <tr>
      <td style="font-weight: 600;">${h['Project Name']}</td>
      <td>${h['Main Scope'] || h['Scope Code'] || 'N/A'}</td>
      <td>${h['Subscope'] || h['Scope Category'] || 'N/A'}</td>
      <td style="font-weight: 600;">${h['Trade']}</td>
      <td>${h['Duration']}</td>
      <td>${formatDateShort(h['Start Date'])}</td>
      <td>${formatDateShort(h['Finish Date'])}</td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button class="btn-action btn-verify" onclick="verifyRecord('${h.sheetName}', ${h.rowNumber}, 'verifyScope')">Verify</button>
          <button class="btn-action btn-reject" onclick="promptRejectRecord('${h.sheetName}', ${h.rowNumber})">Reject</button>
        </div>
      </td>
    </tr>
  `).join('');
}
