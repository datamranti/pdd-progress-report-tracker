// Live monthly data from Google Sheets through Apps Script Version 30+.
const pddChartRequests = {};

function loadMonthlyTrackingGraph() {
  return loadPddLiveChart('scurveContainer', 'scurveStatus',
    document.getElementById('chartProjectSelect').value,
    document.getElementById('chartYearSelect').value);
}

function renderConsultantScurve() {
  if (!activeConsultantProjectCode) return;
  return loadPddLiveChart('consultantScurveContainer', 'consultantScurveStatus',
    activeConsultantProjectCode, document.getElementById('consultantChartYearSelect').value);
}

async function loadPddLiveChart(containerId, statusId, projectId, year) {
  const container = document.getElementById(containerId);
  const status = document.getElementById(statusId);
  if (!container) return;
  const request = (pddChartRequests[containerId] || 0) + 1;
  pddChartRequests[containerId] = request;
  container.innerHTML = '';
  if (status) status.textContent = 'Loading monthly progress…';
  try {
    const url = GOOGLE_SCRIPT_URL + '?action=getMonthlyTracking&projectId=' +
      encodeURIComponent(projectId) + '&year=' + encodeURIComponent(year);
    const response = await fetch(url, {cache:'no-store'});
    if (!response.ok) throw new Error('Monthly request failed');
    const result = await response.json();
    if (pddChartRequests[containerId] !== request) return;
    if (result.status !== 'success' || !Array.isArray(result.data)) throw new Error('Monthly data unavailable');
    if (!result.data.length) {
      if (status) status.textContent = 'No monthly progress available for this project and year.';
      return;
    }
    const months = pddChartMonths(result.data, projectId, Number(year));
    container.innerHTML = pddChartMarkup(months, Number(year));
    if (status) status.textContent = result.warnings && result.warnings.length
      ? 'Some monthly records could not be read. Please ask PDD to review the source data.' : '';
  } catch (error) {
    if (pddChartRequests[containerId] !== request) return;
    container.innerHTML = '';
    if (status) status.textContent = 'Unable to load monthly progress. Refresh this view to try again.';
    console.error('Monthly progress:', error);
  }
}

function pddChartMonths(rows, projectId, year) {
  const months = Array.from({length:12}, (_, i) => ({month:i+1, planned:null, actual:null}));
  const seen = new Set();
  rows.forEach(row => {
    if (row.projectId !== projectId || row.year !== year ||
        !Number.isInteger(row.month) || row.month < 1 || row.month > 12) throw new Error('Unexpected monthly record');
    if (seen.has(row.month)) throw new Error('Duplicate monthly record');
    seen.add(row.month);
    ['planned','actual'].forEach(key => {
      const value = row[key];
      if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100)) {
        throw new Error('Invalid monthly percentage');
      }
    });
    months[row.month-1] = row;
  });
  return months;
}

function pddChartMarkup(months, year) {
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const number = value => Number(value.toFixed(2)).toString();
  return months.map((row, i) => {
    const label = labels[i] + ' ' + String(year).slice(-2);
    const bars = ['planned','actual'].map(key => {
      const value = row[key];
      if (value === null) return '';
      const previous = i ? months[i-1][key] : 0;
      const increment = previous === null ? '' :
        '<span style="display:block;font-size:7px;color:var(--muted);">(' +
        (value-previous >= 0 ? '+' : '') + number(value-previous) + '%)</span>';
      return '<div class="scurve-' + (key === 'planned' ? 'plan' : 'act') + '" style="height:' + value + '%;">' +
        '<div class="pct-tag">' + increment + number(value) + '%</div></div>';
    }).join('');
    const plan = row.planned === null ? 'N/A' : number(row.planned) + '%';
    const actual = row.actual === null ? 'N/A' : number(row.actual) + '%';
    return '<div class="chart-col" title="' + label + ' - Cumulative Plan: ' + plan + ', Act: ' + actual + '">' +
      '<div class="bar-wrapper">' + bars + '</div><div class="col-label">' + label + '</div></div>';
  }).join('');
}
