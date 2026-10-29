// ==========================================================================
// Contractor & Developer Progress Reporting Logic
// ==========================================================================

let contractorLatestBreakdownList = [];

function initContractorProjectView() {
  if (userAuthorizedProjectsList.length === 1) {
    selectContractorActiveProject(userAuthorizedProjectsList[0]);
  } else {
    showContractorProjectSelector();
  }
}

function showContractorProjectSelector() {
  document.getElementById('contractorUnlockedArea').style.display = 'none';
  const selector = document.getElementById('contractorProjectSelector');
  const grid = document.getElementById('contractorProjectButtonsGrid');

  grid.innerHTML = userAuthorizedProjectsList.map(prjId => {
    const prjName = getProjectNameById(prjId);
    return `
      <button type="button" class="btn-nav" style="padding: 14px; text-align: left; height: auto;" onclick="selectContractorActiveProject('${prjId}')">
        <strong>${prjId}</strong><br><small>${prjName}</small>
      </button>
    `;
  }).join('');

  selector.style.display = 'block';
}

function selectContractorActiveProject(prjId) {
  activeSelectedProjectCode = prjId;
  activeSelectedProjectName = getProjectNameById(prjId);

  document.getElementById('contractorProjectSelector').style.display = 'none';
  document.getElementById('contractorUnlockedArea').style.display = 'block';
  document.getElementById('authenticatedProjectTitle').innerText = activeSelectedProjectCode + " - " + activeSelectedProjectName;

  document.getElementById('pPrj').value = activeSelectedProjectCode;
  document.getElementById('sPrj').value = activeSelectedProjectCode;

  if (userAuthorizedProjectsList.length > 1) {
    document.getElementById('btnContractorSwitchPrj').style.display = 'inline-block';
  } else {
    document.getElementById('btnContractorSwitchPrj').style.display = 'none';
  }

  fetchProjectMetadataAndHistory();
}

function toggleEntryMode() {
  const mode = document.getElementById('formTypeSelect').value;
  document.getElementById('formProgressUpdate').style.display = mode === 'PROGRESS' ? 'block' : 'none';
  document.getElementById('formScheduleSetup').style.display = mode === 'PROGRESS' ? 'none' : 'block';
}

function handleCadenceChangeProgress() {
  const cadence = document.getElementById('pCadence').value;
  const container = document.getElementById('segmentContainer');
  const scopeFields = document.querySelectorAll('.p-scope-field');

  if (cadence === 'Monthly Summary') {
    scopeFields.forEach(el => el.style.display = 'none');
    container.innerHTML = `<label for="pSegment">Segment Period <span class="req-star">*</span></label><input type="text" id="pSegment" value="By Month" readonly style="background: #f1f3f8;">`;
  } else {
    scopeFields.forEach(el => el.style.display = 'flex');
    if (cadence === 'Daily') {
      container.innerHTML = `<label for="pSegment">Select Exact Date <span class="req-star">*</span></label><input type="date" id="pSegment" required>`;
    } else {
      container.innerHTML = `<label for="pSegment">Segment Period <span class="req-star">*</span></label><select id="pSegment" required><option value="Week 2 (1st - 14th)" selected>Week 2 (1st - 14th)</option><option value="Week 4 (15th - End)">Week 4 (15th - End)</option></select>`;
    }
  }
}

// Toggle Scope Setup Action (Add vs Edit)
function toggleScopeSetupAction() {
  const isEdit = document.getElementById('sSetupAction').value === 'EDIT';
  const editContainer = document.getElementById('sEditTargetContainer');
  if (editContainer) {
    editContainer.style.display = isEdit ? 'block' : 'none';
  }

  if (isEdit) {
    populateEditTargetScopeDropdowns();
  } else {
    document.getElementById('sScopeCode').value = '';
    document.getElementById('sScopeCat').value = '';
    document.getElementById('sTrade').value = '';
    document.getElementById('sDuration').value = '';
    document.getElementById('sStartDate').value = '';
    document.getElementById('sFinishDate').value = '';
  }
}

function populateEditTargetScopeDropdowns() {
  const mainSel = document.getElementById('sTargetScopeCode');
  const subSel = document.getElementById('sTargetScopeCat');
  const tradeSel = document.getElementById('sExistingTradeSelect');

  if (!mainSel || !subSel || !tradeSel) return;

  const uniqueMainScopes = [...new Set(currentMetadataList.map(d => {
    const val = (d['Main Scope'] || d['Scope Code'] || '').trim();
    return val ? val : 'N/A';
  }))];

  mainSel.innerHTML = '<option value="">Select Main Scope...</option>' + 
    uniqueMainScopes.map(m => `<option value="${m}">${m}</option>`).join('');

  subSel.innerHTML = '<option value="">Select Subscope...</option>';
  tradeSel.innerHTML = '<option value="">Select Trade...</option>';
}

function onTargetScopeCodeChange() {
  const selMain = document.getElementById('sTargetScopeCode').value;
  const subSel = document.getElementById('sTargetScopeCat');
  const tradeSel = document.getElementById('sExistingTradeSelect');

  if (!subSel || !tradeSel) return;

  subSel.innerHTML = '<option value="">Select Subscope...</option>';
  tradeSel.innerHTML = '<option value="">Select Trade...</option>';

  if (!selMain) return;

  const matchedSubscopes = [...new Set(currentMetadataList
    .filter(d => {
      const mainVal = (d['Main Scope'] || d['Scope Code'] || 'N/A').trim() || 'N/A';
      return mainVal.toLowerCase() === selMain.toLowerCase();
    })
    .map(d => {
      const subVal = (d['Subscope'] || d['Scope Category'] || '').trim();
      return subVal ? subVal : 'N/A';
    })
  )];

  subSel.innerHTML = '<option value="">Select Subscope...</option>' + 
    matchedSubscopes.map(s => `<option value="${s}">${s}</option>`).join('');
}

function onTargetScopeCatChange() {
  const selMain = document.getElementById('sTargetScopeCode').value;
  const selSub = document.getElementById('sTargetScopeCat').value;
  const tradeSel = document.getElementById('sExistingTradeSelect');

  if (!tradeSel) return;

  tradeSel.innerHTML = '<option value="">Select Trade...</option>';

  if (!selMain || !selSub) return;

  const matchedTrades = currentMetadataList.filter(d => {
    const mainVal = (d['Main Scope'] || d['Scope Code'] || 'N/A').trim() || 'N/A';
    const subVal = (d['Subscope'] || d['Scope Category'] || 'N/A').trim() || 'N/A';
    return mainVal.toLowerCase() === selMain.toLowerCase() && 
           subVal.toLowerCase() === selSub.toLowerCase();
  });

  tradeSel.innerHTML = '<option value="">Select Trade...</option>' + 
    matchedTrades.map(d => {
      const entryId = d['Entry ID'] || '';
      const tradeName = d['Trade'] || '';
      return `<option value="${tradeName}" data-entry-id="${entryId}">${tradeName} (ID: ${entryId})</option>`;
    }).join('');
}

function populateScopeFormForEdit() {
  const selMain = document.getElementById('sTargetScopeCode').value;
  const selSub = document.getElementById('sTargetScopeCat').value;
  const selTrade = document.getElementById('sExistingTradeSelect').value;

  const tradeSelectEl = document.getElementById('sExistingTradeSelect');
  const selectedOption = tradeSelectEl ? tradeSelectEl.options[tradeSelectEl.selectedIndex] : null;
  const targetEntryId = selectedOption ? selectedOption.getAttribute('data-entry-id') : null;

  const match = currentMetadataList.find(d => {
    if (targetEntryId && d['Entry ID'] && String(d['Entry ID']) === String(targetEntryId)) {
      return true;
    }
    const mainVal = (d['Main Scope'] || d['Scope Code'] || 'N/A').trim() || 'N/A';
    const subVal = (d['Subscope'] || d['Scope Category'] || 'N/A').trim() || 'N/A';
    const tradeVal = (d['Trade'] || '').trim();

    return mainVal.toLowerCase() === selMain.toLowerCase() &&
           subVal.toLowerCase() === selSub.toLowerCase() &&
           tradeVal.toLowerCase() === selTrade.toLowerCase();
  });

  if (match) {
    document.getElementById('sScopeCode').value = match['Main Scope'] || match['Scope Code'] || 'N/A';
    document.getElementById('sScopeCat').value = match['Subscope'] || match['Scope Category'] || 'N/A';
    document.getElementById('sTrade').value = match['Trade'] || '';
    document.getElementById('sDuration').value = match['Duration'] || '';
    document.getElementById('sStartDate').value = match['Start Date'] ? match['Start Date'].split('T')[0] : '';
    document.getElementById('sFinishDate').value = match['Finish Date'] ? match['Finish Date'].split('T')[0] : '';
  }
}

function fetchProjectMetadataAndHistory() {
  const prjId = document.getElementById('pPrj').value || activeSelectedProjectCode;

  showSkeletonRows('metadataTableBody', 10, 3);
  showSkeletonRows('contractorBreakdownTableBody', 8, 3);
  showSkeletonRows('historyTableBody', 14, 4);

  // 1. Fetch Metadata Schedule Setup
  fetch(GOOGLE_SCRIPT_URL + "?action=getMetadata&projectId=" + prjId)
    .then(res => res.json())
    .then(res => {
      if (res.status === 'success' && res.data.length > 0) {
        currentMetadataList = res.data;
        populateMetadataDropdowns(res.data);
        populateMetadataTradeFilterDropdown(res.data);
        renderMetadataTable(res.data);
      } else {
        populateDefaultMetadataDropdowns();
        renderMetadataTable([]);
      }
    });

  // 2. Fetch Project History for Breakdown & Live Records
  fetch(GOOGLE_SCRIPT_URL + "?action=getProjectHistory&projectId=" + prjId)
    .then(res => res.json())
    .then(res => {
      if (res.status === 'success') {
        currentHistoryList = res.data;
        contractorLatestBreakdownList = res.data;
        populateContractorBreakdownTradeFilter(res.data);
        renderLatestBreakdownTable('contractorBreakdownTableBody', res.data);
        renderHistoryTable(res.data);
      }
    });
}

function populateMetadataDropdowns(data) {
  const codeSel = document.getElementById('pScopeCode');
  const catSel = document.getElementById('pScopeCat');
  const tradeSel = document.getElementById('pTrade');

  const verifiedApprovedData = data.filter(d => 
    String(d['Verification']).toUpperCase() === 'YES' && 
    String(d['Approval']).toUpperCase() === 'YES'
  );

  const codes = [...new Set(verifiedApprovedData.map(d => d['Main Scope'] || d['Scope Code']).filter(Boolean))];
  const cats = [...new Set(verifiedApprovedData.map(d => d['Subscope'] || d['Scope Category']).filter(Boolean))];
  const approvedTrades = [...new Set(verifiedApprovedData.map(d => d['Trade']).filter(Boolean))];

  codeSel.innerHTML = '<option value="N/A">N/A</option>' + codes.map(c => `<option value="${c}">${c}</option>`).join('');
  catSel.innerHTML = '<option value="N/A">N/A</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
  
  if (approvedTrades.length > 0) {
    tradeSel.innerHTML = approvedTrades.map(t => `<option value="${t}">${t}</option>`).join('');
  } else {
    tradeSel.innerHTML = '<option value="">No Verified/Approved Trades Available</option>';
  }

  if (document.getElementById('sSetupAction') && document.getElementById('sSetupAction').value === 'EDIT') {
    populateEditTargetScopeDropdowns();
  }
}

function populateDefaultMetadataDropdowns() {
  document.getElementById('pScopeCode').innerHTML = `<option value="N/A">N/A</option>`;
  document.getElementById('pScopeCat').innerHTML = `<option value="N/A">N/A</option>`;
  document.getElementById('pTrade').innerHTML = `<option value="">No Verified/Approved Trades Available</option>`;
}

// Populate Trade Filter on Schedule Setup Metadata Reference
function populateMetadataTradeFilterDropdown(data) {
  const sel = document.getElementById('contractorMetadataTradeFilter');
  if (!sel) return;
  const uniqueTrades = [...new Set(data.map(d => (d['Trade'] || '').trim()).filter(Boolean))];
  sel.innerHTML = '<option value="ALL">All Trades</option>' + 
    uniqueTrades.map(t => `<option value="${t}">${t}</option>`).join('');
}

function filterContractorMetadataTable() {
  const selTrade = document.getElementById('contractorMetadataTradeFilter').value;
  if (selTrade === 'ALL') {
    renderMetadataTable(currentMetadataList);
  } else {
    const filtered = currentMetadataList.filter(d => (d['Trade'] || '').trim().toLowerCase() === selTrade.trim().toLowerCase());
    renderMetadataTable(filtered);
  }
}

// Populate Trade Filter on Latest Breakdown Table in Contractor Portal
function populateContractorBreakdownTradeFilter(data) {
  const sel = document.getElementById('contractorBreakdownTradeFilter');
  if (!sel) return;
  const uniqueTrades = [...new Set(data.map(d => (d['Trade'] || '').trim()).filter(Boolean))];
  sel.innerHTML = '<option value="ALL">All Trades</option>' + 
    uniqueTrades.map(t => `<option value="${t}">${t}</option>`).join('');
}

function filterContractorBreakdownTable() {
  const selTrade = document.getElementById('contractorBreakdownTradeFilter').value;
  if (selTrade === 'ALL') {
    renderLatestBreakdownTable('contractorBreakdownTableBody', contractorLatestBreakdownList);
  } else {
    const filtered = contractorLatestBreakdownList.filter(d => (d['Trade'] || '').trim().toLowerCase() === selTrade.trim().toLowerCase());
    renderLatestBreakdownTable('contractorBreakdownTableBody', filtered);
  }
}

function onScopeCodeSelectChange() {
  const selCode = document.getElementById('pScopeCode').value;
  const match = currentMetadataList.find(d => (d['Main Scope'] || d['Scope Code']) === selCode);
  if (match) {
    if (match['Subscope'] || match['Scope Category']) document.getElementById('pScopeCat').value = match['Subscope'] || match['Scope Category'];
    if (match['Trade']) document.getElementById('pTrade').value = match['Trade'];
  }
  filterHistoryByFormSelection();
}

function filterHistoryByFormSelection() {
  const selCat = document.getElementById('pScopeCat').value;
  const selTrade = document.getElementById('pTrade').value;

  let filtered = currentHistoryList;
  if (selCat && selCat !== 'N/A') filtered = filtered.filter(d => (d['Subscope'] || d['Scope Category']) === selCat);
  if (selTrade) filtered = filtered.filter(d => d['Trade'] === selTrade);

  renderHistoryTable(filtered);
}

function renderMetadataTable(data) {
  const tbody = document.getElementById('metadataTableBody');
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--muted);">No metadata schedule entries found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(m => `
    <tr>
      <td style="font-weight: 600; color: var(--blue);">${m['Entry ID']}</td>
      <td style="font-weight: 600;">${m['Project Name']}</td>
      <td>${m['Main Scope'] || m['Scope Code'] || 'N/A'}</td>
      <td>${m['Subscope'] || m['Scope Category'] || 'N/A'}</td>
      <td>${m['Trade']}</td>
      <td>${m['Duration']}</td>
      <td>${formatDateShort(m['Start Date'])}</td>
      <td>${formatDateShort(m['Finish Date'])}</td>
      <td><span class="badge ${(m['Verification'] === 'YES') ? 'badge-ahead' : 'badge-delayed'}">${m['Verification'] || 'NO'}</span></td>
      <td><span class="badge ${(m['Approval'] === 'YES') ? 'badge-ahead' : 'badge-delayed'}">${m['Approval'] || 'NO'}</span></td>
    </tr>
  `).join('');
}

function renderHistoryTable(data) {
  const tbody = document.getElementById('historyTableBody');
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="14" style="text-align: center; color: var(--muted);">No history records found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(h => {
    var planNum = parsePercentageVal(h['Planned']);
    var actNum = parsePercentageVal(h['Actual']);
    var varNum = (actNum - planNum).toFixed(2);
    var docCell = (h['Supporting Document'] && h['Supporting Document'] !== '-') ? `<button class="btn-doc" onclick="openDocumentModal('${h['Supporting Document']}')">📎 View File</button>` : '-';

    return `
      <tr>
        <td style="font-weight: 600; color: var(--blue);">${h['Entry ID']}</td>
        <td style="font-weight: 600;">${h['Project Name']}</td>
        <td>${h['Main Scope'] || h['Scope Code'] || 'N/A'}<br><small style="color: var(--muted);">${h['Subscope'] || h['Scope Category'] || 'N/A'}</small></td>
        <td>${h['Trade'] || 'N/A'}</td>
        <td>${h['Reporting Cadence'] || 'Biweekly'}</td>
        <td>${formatMonthText(h['Reporting Month'])}</td>
        <td>${formatDateShort(h['Exact Date'] || h['Reporting Segment Period'])}</td>
        <td>${planNum.toFixed(2)}%</td>
        <td><strong>${actNum.toFixed(2)}%</strong></td>
        <td style="color: ${varNum >= 0 ? 'var(--green)' : 'var(--red)'}; font-weight: 600;">${(varNum >= 0 ? '+' : '') + varNum}%</td>
        <td style="max-width: 180px;">${h['Remarks'] || '-'}</td>
        <td>${docCell}</td>
        <td><span class="badge ${h['Verification'] === 'YES' ? 'badge-ahead' : 'badge-delayed'}">${h['Verification'] || 'NO'}</span></td>
        <td><span class="badge ${h['Approval'] === 'YES' ? 'badge-ahead' : 'badge-delayed'}">${h['Approval'] || 'NO'}</span></td>
      </tr>
    `;
  }).join('');
}

function handleProgressSubmit(e) {
  e.preventDefault();
  const prjId = activeSelectedProjectCode || document.getElementById('pPrj').value;
  const prjObj = baselineOverallData.find(o => o.id === prjId);
  const cadence = document.getElementById('pCadence').value;

  const processAndSend = function(fileBase64, fileName, fileMime) {
    const payload = {
      action: "submitProgress",
      projectId: prjId,
      projectName: prjObj ? prjObj.name : prjId,
      scopeCode: cadence === 'Monthly Summary' ? 'N/A' : (document.getElementById('pScopeCode').value || 'N/A'),
      scopeCategory: cadence === 'Monthly Summary' ? 'N/A' : (document.getElementById('pScopeCat').value || 'N/A'),
      trade: cadence === 'Monthly Summary' ? 'N/A' : (document.getElementById('pTrade').value || 'N/A'),
      reportingPeriod: cadence,
      reportingMonth: document.getElementById('pMonth').value,
      reportingSegmentPeriod: document.getElementById('pSegment').value || 'By Month',
      planned: parseFloat(document.getElementById('pPlanned').value),
      actual: parseFloat(document.getElementById('pActual').value),
      overallStatus: document.getElementById('pOverallStatus').value,
      remarks: document.getElementById('pRemarks').value,
      fileData: fileBase64 || "",
      fileName: fileName || "",
      fileMime: fileMime || "",
      userEmail: window.currentUserEmail || "Anonymous"
    };

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      alert('Progress report recorded! Sent to Consultant for verification.');
      document.getElementById('formProgressUpdate').reset();
      if (activeSelectedProjectCode) {
        document.getElementById('pPrj').value = activeSelectedProjectCode;
      }
      fetchProjectMetadataAndHistory();
    });
  };

  const fileInput = document.getElementById('pDocFile');
  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(evt) { processAndSend(evt.target.result, file.name, file.type); };
    reader.readAsDataURL(file);
  } else {
    processAndSend("", "", "");
  }
}

function handleMetadataSubmit(e) {
  e.preventDefault();
  const prjId = activeSelectedProjectCode || document.getElementById('sPrj').value;
  const prjObj = baselineOverallData.find(o => o.id === prjId);
  const mode = document.getElementById('sSetupAction').value;

  const tradeSelectEl = document.getElementById('sExistingTradeSelect');
  const selectedOption = tradeSelectEl ? tradeSelectEl.options[tradeSelectEl.selectedIndex] : null;
  const targetEntryId = (mode === 'EDIT' && selectedOption) ? selectedOption.getAttribute('data-entry-id') : null;

  const payload = {
    action: "submitMetadata",
    mode: mode,
    projectId: prjId,
    projectName: prjObj ? prjObj.name : prjId,
    targetEntryId: targetEntryId,
    targetMainScope: mode === 'EDIT' ? (document.getElementById('sTargetScopeCode').value || 'N/A') : '',
    targetSubscope: mode === 'EDIT' ? (document.getElementById('sTargetScopeCat').value || 'N/A') : '',
    targetTrade: mode === 'EDIT' ? document.getElementById('sExistingTradeSelect').value : '',
    scopeCode: document.getElementById('sScopeCode').value || "N/A",
    scopeCategory: document.getElementById('sScopeCat').value || "N/A",
    trade: document.getElementById('sTrade').value,
    duration: document.getElementById('sDuration').value,
    startDate: document.getElementById('sStartDate').value,
    finishDate: document.getElementById('sFinishDate').value,
    userEmail: window.currentUserEmail || "Anonymous"
  };

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(() => {
    alert(mode === 'EDIT' 
      ? 'Schedule setup changes submitted! Pending Consultant verification and PDD approval.' 
      : 'New trade setup submitted! Pending Consultant verification and PDD approval.');
    document.getElementById('formScheduleSetup').reset();
    if (activeSelectedProjectCode) {
      document.getElementById('sPrj').value = activeSelectedProjectCode;
    }
    document.getElementById('sSetupAction').value = 'ADD';
    toggleScopeSetupAction();
    fetchProjectMetadataAndHistory();
  });
}
