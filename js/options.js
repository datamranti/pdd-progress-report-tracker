// Option labels and values use the spreadsheet master; native select styling is unchanged.
let pddPortalOptions = null;
let pddOptionsLoading = null;
const pddMonthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

async function loadPddPortalOptions() {
  if (pddOptionsLoading) return pddOptionsLoading;
  pddOptionsLoading = (async () => {
    const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getPortalOptions', {cache:'no-store'});
    if (!response.ok) throw new Error('Unable to load project and reporting options.');
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || 'Options unavailable.');
    const data = result.data;
    if (!data || !Array.isArray(data.projects) || !data.projects.length || !data.projectMonths ||
        !Array.isArray(data.months) || !Array.isArray(data.scorecardMonths)) throw new Error('Invalid options response.');
    const seen = new Set();
    data.projects.forEach(p => {
      if (!/^PRJ-\d{3}$/.test(p.id) || typeof p.name !== 'string' || !p.name.trim() || seen.has(p.id)) throw new Error('Invalid project master.');
      seen.add(p.id);
    });
    const periods = [...data.months,...data.scorecardMonths,...Object.values(data.projectMonths).flat()];
    if (periods.some(m => typeof m !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(m))) throw new Error('Invalid reporting period.');
    pddPortalOptions = data;
    // Legacy submission/name lookups remain compatible, but no financial or chart fixtures remain.
    baselineOverallData = data.projects.map(p => ({id:p.id,name:p.name}));
    pddPopulatePortalSelects();
    return data;
  })();
  try { return await pddOptionsLoading; }
  finally { pddOptionsLoading = null; }
}

function pddSetOptions(id, options, preferred) {
  const select = document.getElementById(id);
  if (!select) return;
  const previous = select.value;
  const nodes = options.map(item => {
    const option = document.createElement('option');
    option.value = item.value; option.textContent = item.label;
    return option;
  });
  select.replaceChildren(...nodes);
  const values = new Set(options.map(o => o.value));
  select.value = values.has(previous) ? previous : values.has(preferred) ? preferred : options[0]?.value || '';
}

function pddPeriodLabel(key) {
  return pddMonthNames[Number(key.slice(5))-1] + ' ' + key.slice(0,4);
}

function pddCurrentPeriod() {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit'}).formatToParts(new Date())
    .filter(p => p.type === 'year' || p.type === 'month').reduce((out,p) => ({...out,[p.type]:p.value}),{});
}

function pddPopulatePortalSelects() {
  const data = pddPortalOptions;
  const idOptions = data.projects.map(p => ({value:p.id,label:p.id}));
  const labels = data.projects.map(p => ({value:p.id,label:p.id + ': ' + p.name}));
  const names = data.projects.map(p => ({value:p.name,label:p.id + ': ' + p.name}));
  const all = {value:'ALL',label:'All Projects'};
  pddSetOptions('chartProjectSelect',labels);
  pddSetOptions('mgmtScorecardKPIPrjFilter',data.projects.map(p => ({value:p.id + ': ' + p.name,label:p.id + ': ' + p.name})));
  pddSetOptions('mgmtScorecardPrjFilter',[all,...names],'ALL');
  pddSetOptions('scorePrjSelect',names);
  pddSetOptions('pddAuthorityPrjFilter',[all,...data.projects.map(p => ({value:p.name,label:p.id}))],'ALL');
  pddSetOptions('authorityBreakdownPrjFilter',idOptions);
  pddSetOptions('authorityPrjFilter',[all,...idOptions],'ALL');
  pddSetOptions('pPrj',idOptions);
  pddSetOptions('sPrj',idOptions);
  const years = [...new Set(data.scorecardMonths.map(m => m.slice(0,4)))].sort();
  const filterYears = [{value:'ALL',label:'All Years'},...years.map(y => ({value:y,label:y}))];
  pddSetOptions('mgmtScorecardYearFilter',filterYears,'ALL');
  pddSetOptions('pddAuthorityYearFilter',filterYears,'ALL');
  const monthNumbers = [...new Set(data.scorecardMonths.map(m => Number(m.slice(5))))].sort((a,b)=>a-b);
  const filterMonths = [{value:'ALL',label:'All Months'},...monthNumbers.map(m => ({value:pddMonthNames[m-1],label:pddMonthNames[m-1]}))];
  pddSetOptions('mgmtScorecardMonthFilter',filterMonths,'ALL');
  pddSetOptions('pddAuthorityMonthFilter',filterMonths,'ALL');
  const now = pddCurrentPeriod();
  const preferred = pddPeriodLabel(now.year + '-' + now.month);
  pddSetOptions('scoreMonthSelect',data.scorecardMonths.map(m => ({value:pddPeriodLabel(m),label:pddPeriodLabel(m)})),preferred);
  pddSetChartYears();
  pddSetConsultantYears(activeConsultantProjectCode || data.projects[0].id);
  pddSetReportingMonths(activeSelectedProjectCode || data.projects[0].id);
}

function pddYearsForProject(id) {
  return [...new Set((pddPortalOptions.projectMonths[id] || []).map(m=>m.slice(0,4)))].sort();
}
function pddSetChartYears() {
  const select=document.getElementById('chartProjectSelect');
  if (!pddPortalOptions || !select) return;
  pddSetOptions('chartYearSelect',pddYearsForProject(select.value).map(y=>({value:y,label:y})),pddCurrentPeriod().year);
}
function pddSetConsultantYears(id) {
  if (!pddPortalOptions) return;
  pddSetOptions('consultantChartYearSelect',pddYearsForProject(id).map(y=>({value:y,label:y})),pddCurrentPeriod().year);
}
function pddSetReportingMonths(id) {
  if (!pddPortalOptions) return;
  const now=pddCurrentPeriod();
  pddSetOptions('pMonth',(pddPortalOptions.projectMonths[id] || []).map(m=>({value:m,label:pddPeriodLabel(m)})),now.year+'-'+now.month);
}
