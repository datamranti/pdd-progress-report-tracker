// ==========================================================================
// PDD Authority Portal Approval & Rejection Logic
// ==========================================================================

let authorityLatestBreakdownList = [];

function loadAuthorityPageData() {
  showSkeletonRows('authorityTableBody', 12, 3);
  showSkeletonRows('authorityScopeTableBody', 8, 2);

  fetch(GOOGLE_SCRIPT_URL + "?action=getPendingApprovals")
    .then(res => res.json())
    .then(res => { if (res.status === 'success') { pendingApprovalsList = res.data; renderAuthorityTable(); } });

  fetch(GOOGLE_SCRIPT_URL + "?action=getPendingScopeApprovals")
    .then(res => res.json())
    .then(res => { if (res.status === 'success') { pendingScopeApprovalsList = res.data; renderAuthorityScopeTable(); } });

  loadAuthorityBreakdownData();
}

function loadAuthorityBreakdownData() {
  const breakdownPrj = document.getElementById('authorityBreakdownPrjFilter').value;
  showSkeletonRows('authorityBreakdownTableBody', 8, 3);

  fetch(GOOGLE_SCRIPT_URL + "?action=getProjectHistory&projectId=" + breakdownPrj)
    .then(res => res.json())
    .then(res => { 
      if (res.status === 'success') {
        authorityLatestBreakdownList = res.data;
        populateAuthorityBreakdownTradeFilter(res.data);
        renderLatestBreakdownTable('authorityBreakdownTableBody', res.data);
      }
    });
}

function populateAuthorityBreakdownTradeFilter(data) {
  const sel = document.getElementById('authorityBreakdownTradeFilter');
  if (!sel) return;
  const uniqueTrades = [...new Set(data.map(d => (d['Trade'] || '').trim()).filter(Boolean))];
  sel.innerHTML = '<option value="ALL">All Trades</option>' + 
    uniqueTrades.map(t => `<option value="${t}">${t}</option>`).join('');
}

function filterAuthorityBreakdownTable() {
  const selTrade = document.getElementById('authorityBreakdownTradeFilter').value;
  if (selTrade === 'ALL') {
    renderLatestBreakdownTable('authorityBreakdownTableBody', authorityLatestBreakdownList);
  } else {
    const filtered = authorityLatestBreakdownList.filter(d => (d['Trade'] || '').trim().toLowerCase() === selTrade.trim().toLowerCase());
    renderLatestBreakdownTable('authorityBreakdownTableBody', filtered);
  }
}

function renderAuthorityTable() {
  const tbody = document.getElementById('authorityTableBody');
  const filter = document.getElementById('authorityPrjFilter').value;

  let filtered = pendingApprovalsList;
  if (filter !== 'ALL') filtered = filtered.filter(h => h.sheetName === filter);

  if (!filtered || filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="12" style="text-align: center; color: var(--muted);">No verified progress reports awaiting approval.</td></tr>';
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
            <button class="btn-action btn-approve" onclick="verifyRecord('${h.sheetName}', ${h.rowNumber}, 'approveProgress')">Approve</button>
            <button class="btn-action btn-reject" onclick="promptRejectRecord('${h.sheetName}', ${h.rowNumber})">Reject</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAuthorityScopeTable() {
  const tbody = document.getElementById('authorityScopeTableBody');
  if (!pendingScopeApprovalsList || pendingScopeApprovalsList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--muted);">No scope setup changes awaiting approval.</td></tr>';
    return;
  }

  tbody.innerHTML = pendingScopeApprovalsList.map(h => `
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
          <button class="btn-action btn-approve" onclick="verifyRecord('${h.sheetName}', ${h.rowNumber}, 'approveScope')">Approve</button>
          <button class="btn-action btn-reject" onclick="promptRejectRecord('${h.sheetName}', ${h.rowNumber})">Reject</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function verifyRecord(sheetName, rowNumber, actionType) {
  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: actionType, 
      sheetName: sheetName, 
      rowNumber: rowNumber,
      userEmail: window.currentUserEmail || "Anonymous"
    })
  }).then(() => {
    alert('Action processed successfully!');
    if (activeConsultantProjectCode) loadConsultantPageData();
    loadAuthorityPageData();
  });
}

function promptRejectRecord(sheetName, rowNumber) {
  pendingRejectTarget = { sheetName: sheetName, rowNumber: rowNumber };
  document.getElementById('rejectReasonInput').value = '';
  document.getElementById('rejectModalBackdrop').style.display = 'flex';
}

function closeRejectModal() {
  pendingRejectTarget = null;
  document.getElementById('rejectModalBackdrop').style.display = 'none';
}

function submitRejection() {
  if (!pendingRejectTarget) return;
  const reason = document.getElementById('rejectReasonInput').value.trim();
  if (!reason) { alert("Please enter a reason for rejection."); return; }

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: "rejectRecord",
      sheetName: pendingRejectTarget.sheetName,
      rowNumber: pendingRejectTarget.rowNumber,
      reason: reason,
      userEmail: window.currentUserEmail || "Anonymous"
    })
  }).then(() => {
    alert('Record marked as REJECTED with reason recorded.');
    closeRejectModal();
    if (activeConsultantProjectCode) loadConsultantPageData();
    loadAuthorityPageData();
  });
}
