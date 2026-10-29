// ==========================================================================
// Formatting & UI Utility Helpers
// ==========================================================================

function parseAssignedProjects(assignedStr) {
  if (!assignedStr || assignedStr.trim().toUpperCase() === "ALL") {
    return ["PRJ-001", "PRJ-002", "PRJ-003", "PRJ-004", "PRJ-005", "PRJ-006", "PRJ-007", "PRJ-008"];
  }
  return assignedStr.split(",").map(p => p.trim().toUpperCase()).filter(Boolean);
}

function getProjectNameById(prjId) {
  const match = baselineOverallData.find(p => p.id === prjId);
  return match ? match.name : prjId;
}

function parsePercentageVal(val) {
  if (val === null || val === undefined || val === '') return 0.0;
  if (typeof val === 'number') return val <= 1.0 && val > 0 ? val * 100.0 : val;
  var str = String(val).replace('%', '').trim();
  var num = parseFloat(str);
  if (isNaN(num)) return 0.0;
  return (num <= 1.0 && num > 0 && String(val).indexOf('%') === -1) ? num * 100.0 : num;
}

function formatMonthText(val) {
  if (!val || val === '-') return '-';
  var str = String(val).trim();
  if (/^[A-Za-z]+\s+\d{4}$/.test(str)) return str;
  if (/^\d{4}-\d{2}$/.test(str)) {
    var parts = str.split('-');
    var monthIndex = parseInt(parts[1], 10) - 1;
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[monthIndex] + " " + parts[0];
  }
  var d = new Date(str);
  if (!isNaN(d.getTime())) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var localDate = new Date(d.getTime() + (8 * 60 * 60 * 1000));
    return months[localDate.getUTCMonth()] + " " + localDate.getUTCFullYear();
  }
  return str;
}

function formatDateShort(val) {
  if (!val || val === '-') return '-';
  var str = String(val).trim();
  if (str.indexOf('Week') !== -1 || str.indexOf('By Month') !== -1) return str;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    var parts = str.split('-');
    return parseInt(parts[2], 10) + "/" + parseInt(parts[1], 10) + "/" + parts[0];
  }
  var d = new Date(str);
  if (!isNaN(d.getTime())) {
    var localDate = new Date(d.getTime() + (8 * 60 * 60 * 1000));
    return localDate.getUTCDate() + "/" + (localDate.getUTCMonth() + 1) + "/" + localDate.getUTCFullYear();
  }
  return str;
}

function formatExactRM(val) {
  if (val === null || val === undefined || val === '') return "RM 0.00";
  var str = String(val).replace(/[^0-9.-]+/g, "");
  var num = parseFloat(str);
  if (isNaN(num)) return "RM 0.00";
  return "RM " + num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showSkeletonRows(tbodyId, columns, rows) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  var colCount = columns || 8;
  var rowCount = rows || 3;
  var html = '';
  for (var r = 0; r < rowCount; r++) {
    html += '<tr>';
    for (var c = 0; c < colCount; c++) {
      html += '<td><span class="skeleton-box"></span></td>';
    }
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

// Document Modal Handlers
function openDocumentModal(url) {
  const modal = document.getElementById('docModalBackdrop');
  const body = document.getElementById('docModalBody');
  let previewUrl = url.includes('drive.google.com') && !url.endsWith('/preview') ? url.replace(/\/view(\?.*)?$/, '/preview') : url;

  if (url.match(/\.(jpeg|jpg|gif|png)$/i) || url.startsWith('data:image')) {
    body.innerHTML = `<img src="${url}" alt="Attachment Preview" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
  } else {
    body.innerHTML = `<iframe src="${previewUrl}" style="width: 100%; height: 100%; border: none;"></iframe>`;
  }
  modal.style.display = 'flex';
}

function closeDocumentModal(e) {
  if (e && e.target && e.target.closest('.doc-modal-card')) return;
  document.getElementById('docModalBackdrop').style.display = 'none';
  document.getElementById('docModalBody').innerHTML = '';
}

function renderLatestBreakdownTable(targetId, data) {
  const tbody = document.getElementById(targetId);
  if (!tbody) return;
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--muted);">No progress records available.</td></tr>';
    return;
  }

  const latestMap = {};
  data.forEach(item => {
    const key = (item['Main Scope'] || item['Scope Code'] || '') + '_' + (item['Trade'] || '');
    latestMap[key] = item;
  });

  tbody.innerHTML = Object.values(latestMap).map(h => {
    var planNum = parsePercentageVal(h['Planned']);
    var actNum = parsePercentageVal(h['Actual']);
    var varNum = (actNum - planNum).toFixed(2);
    var status = h['Status'] || h['Overall Project Status'] || 'On Track';
    var badgeClass = status === 'Ahead' ? 'badge-ahead' : (status === 'Delayed' ? 'badge-delayed' : 'badge-ontrack');

    return `
      <tr>
        <td style="font-weight: 600; color: var(--blue);">${h['Main Scope'] || h['Scope Code'] || 'N/A'}</td>
        <td>${h['Subscope'] || h['Scope Category'] || 'N/A'}</td>
        <td style="font-weight: 600;">${h['Trade'] || 'N/A'}</td>
        <td>${formatMonthText(h['Reporting Month'])}</td>
        <td>${planNum.toFixed(2)}%</td>
        <td><strong>${actNum.toFixed(2)}%</strong></td>
        <td style="color: ${varNum >= 0 ? 'var(--green)' : 'var(--red)'}; font-weight: 600;">${(varNum >= 0 ? '+' : '') + varNum}%</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
      </tr>
    `;
  }).join('');
}
