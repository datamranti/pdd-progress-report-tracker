// ==========================================================================
// S-Curve & Trajectory Graph Visualization
// ==========================================================================

function loadMonthlyTrackingGraph() {
  const prjId = document.getElementById('chartProjectSelect').value;
  const year = document.getElementById('chartYearSelect').value;
  const container = document.getElementById('scurveContainer');

  var projectMap = fullMonthlyTrackingMap[prjId] || fullMonthlyTrackingMap["PRJ-001"];
  var monthData = projectMap[year] || projectMap["2026"];

  container.innerHTML = monthData.map((d, idx) => {
    var prevPlan = idx > 0 ? monthData[idx - 1].plan : 0;
    var prevAct = (idx > 0 && monthData[idx - 1].act !== null) ? monthData[idx - 1].act : 0;
    
    var incPlan = (d.plan - prevPlan).toFixed(1);
    var incAct = d.act !== null ? (d.act - prevAct).toFixed(1) : null;

    const planH = (d.plan / 100) * 100;
    const actH = d.act !== null ? (d.act / 100) * 100 : 0;
    return `
      <div class="chart-col" title="${d.m} - Cumulative Plan: ${d.plan}%, Act: ${d.act !== null ? d.act + '%' : 'N/A'}">
        <div class="bar-wrapper">
          <div class="scurve-plan" style="height: ${planH}%;">
            <div class="pct-tag">
              <span style="display:block; font-size: 7px; color: var(--muted);">(+${incPlan}%)</span>
              ${d.plan}%
            </div>
          </div>
          ${d.act !== null ? `
            <div class="scurve-act" style="height: ${actH}%;">
              <div class="pct-tag" style="color: var(--blue);">
                <span style="display:block; font-size: 7px; color: var(--blue);">(+${incAct}%)</span>
                ${d.act}%
              </div>
            </div>
          ` : ''}
        </div>
        <div class="col-label">${d.m}</div>
      </div>
    `;
  }).join('');
}

function renderConsultantScurve() {
  if (!activeConsultantProjectCode) return;
  const year = document.getElementById('consultantChartYearSelect').value;
  const container = document.getElementById('consultantScurveContainer');

  var projectMap = fullMonthlyTrackingMap[activeConsultantProjectCode] || fullMonthlyTrackingMap["PRJ-001"];
  var monthData = projectMap[year] || projectMap["2026"];

  container.innerHTML = monthData.map((d, idx) => {
    var prevPlan = idx > 0 ? monthData[idx - 1].plan : 0;
    var prevAct = (idx > 0 && monthData[idx - 1].act !== null) ? monthData[idx - 1].act : 0;
    
    var incPlan = (d.plan - prevPlan).toFixed(1);
    var incAct = d.act !== null ? (d.act - prevAct).toFixed(1) : null;

    const planH = (d.plan / 100) * 100;
    const actH = d.act !== null ? (d.act / 100) * 100 : 0;
    return `
      <div class="chart-col" title="${d.m} - Cumulative Plan: ${d.plan}%, Act: ${d.act !== null ? d.act + '%' : 'N/A'}">
        <div class="bar-wrapper">
          <div class="scurve-plan" style="height: ${planH}%;">
            <div class="pct-tag">
              <span style="display:block; font-size: 7px; color: var(--muted);">(+${incPlan}%)</span>
              ${d.plan}%
            </div>
          </div>
          ${d.act !== null ? `
            <div class="scurve-act" style="height: ${actH}%;">
              <div class="pct-tag" style="color: var(--blue);">
                <span style="display:block; font-size: 7px; color: var(--blue);">(+${incAct}%)</span>
                ${d.act}%
              </div>
            </div>
          ` : ''}
        </div>
        <div class="col-label">${d.m}</div>
      </div>
    `;
  }).join('');
}
