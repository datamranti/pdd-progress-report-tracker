// ==========================================================================
// Baseline Financials, Milestones, and Trajectory Data
// ==========================================================================

let baselineOverallData = [
  { id: "PRJ-001", name: "Infrastructure P1", cat: "CAPEX", grantType: "-", budget: 75000000.00, cost: 68500000.00, paid: 38000000.00, claim: 4200000.00, balance: 6500000.00, milestone: "Bridge Cutover Phase 2", status: "In Progress", health: "Ahead" },
  { id: "PRJ-002", name: "Infrastructure P2A", cat: "CAPEX", grantType: "-", budget: 76000000.00, cost: 47377700.00, paid: 0.00, claim: 0.00, balance: 28622300.00, milestone: "Site Clearing 80%", status: "In Progress", health: "On Track" },
  { id: "PRJ-003", name: "Slope Remedial", cat: "Government Grant", grantType: "Development Grant", budget: 6000000.00, cost: 2936510.00, paid: 2009510.00, claim: 0.00, balance: 3063490.00, milestone: "Retaining Wall Built", status: "Completed", health: "Ahead" },
  { id: "PRJ-004", name: "Area 57", cat: "Government Grant", grantType: "Special Development Project", budget: 18000000.00, cost: 17100000.00, paid: 0.00, claim: 0.00, balance: 900000.00, milestone: "Tender Awarded", status: "On Hold", health: "Ahead" },
  { id: "PRJ-005", name: "AI Customer Support Bot", cat: "CAPEX", grantType: "-", budget: 0.00, cost: 0.00, paid: 0.00, claim: 0.00, balance: 0.00, milestone: "Vendor Evaluation", status: "Planning", health: "Planned" },
  { id: "PRJ-006", name: "Data Lakehouse & BI Hub", cat: "Government Grant", grantType: "-", budget: 0.00, cost: 0.00, paid: 0.00, claim: 0.00, balance: 0.00, milestone: "Architecture Review", status: "Planning", health: "Planned" },
  { id: "PRJ-007", name: "Supply Chain Automation", cat: "CAPEX", grantType: "-", budget: 0.00, cost: 0.00, paid: 0.00, claim: 0.00, balance: 0.00, milestone: "FRD Approval", status: "Planning", health: "Planned" },
  { id: "PRJ-008", name: "Cyber Security Zero-Trust", cat: "Government Grant", grantType: "-", budget: 0.00, cost: 0.00, paid: 0.00, claim: 0.00, balance: 0.00, milestone: "Policy Framework", status: "Planning", health: "Planned" }
];

const fullMonthlyTrackingMap = {
  "PRJ-001": {
    "2026": [{m:"Jan 26",plan:3.5,act:3.5},{m:"Feb 26",plan:8,act:7},{m:"Mar 26",plan:13,act:12},{m:"Apr 26",plan:19,act:18},{m:"May 26",plan:26,act:24},{m:"Jun 26",plan:33,act:31},{m:"Jul 26",plan:41,act:38},{m:"Aug 26",plan:49,act:46},{m:"Sep 26",plan:58.62,act:59.73},{m:"Oct 26",plan:68,act:null},{m:"Nov 26",plan:78,act:null},{m:"Dec 26",plan:88,act:null}],
    "2027": [{m:"Jan 27",plan:95,act:null},{m:"Feb 27",plan:100,act:null},{m:"Mar 27",plan:100,act:null},{m:"Apr 27",plan:100,act:null},{m:"May 27",plan:100,act:null},{m:"Jun 27",plan:100,act:null},{m:"Jul 27",plan:100,act:null},{m:"Aug 27",plan:100,act:null},{m:"Sep 27",plan:100,act:null},{m:"Oct 27",plan:100,act:null},{m:"Nov 27",plan:100,act:null},{m:"Dec 27",plan:100,act:null}]
  },
  "PRJ-002": {
    "2026": [{m:"Jan 26",plan:0,act:0},{m:"Feb 26",plan:0,act:0},{m:"Mar 26",plan:5,act:5},{m:"Apr 26",plan:15,act:14},{m:"May 26",plan:28,act:25},{m:"Jun 26",plan:42,act:38},{m:"Jul 26",plan:55,act:50},{m:"Aug 26",plan:65,act:60},{m:"Sep 26",plan:70,act:65},{m:"Oct 26",plan:82,act:null},{m:"Nov 26",plan:100,act:null},{m:"Dec 26",plan:100,act:null}],
    "2027": [{m:"Jan 27",plan:100,act:null},{m:"Feb 27",plan:100,act:null},{m:"Mar 27",plan:100,act:null},{m:"Apr 27",plan:100,act:null},{m:"May 27",plan:100,act:null},{m:"Jun 27",plan:100,act:null},{m:"Jul 27",plan:100,act:null},{m:"Aug 27",plan:100,act:null},{m:"Sep 27",plan:100,act:null},{m:"Oct 27",plan:100,act:null},{m:"Nov 27",plan:100,act:null},{m:"Dec 27",plan:100,act:null}]
  },
  "PRJ-003": {
    "2026": [{m:"Jan 26",plan:8,act:8},{m:"Feb 26",plan:18,act:16},{m:"Mar 26",plan:30,act:28},{m:"Apr 26",plan:45,act:40},{m:"May 26",plan:60,act:52},{m:"Jun 26",plan:72,act:62},{m:"Jul 26",plan:82,act:70},{m:"Aug 26",plan:90,act:76},{m:"Sep 26",plan:95,act:80},{m:"Oct 26",plan:100,act:null},{m:"Nov 26",plan:100,act:null},{m:"Dec 26",plan:100,act:null}],
    "2027": [{m:"Jan 27",plan:100,act:null},{m:"Feb 27",plan:100,act:null},{m:"Mar 27",plan:100,act:null},{m:"Apr 27",plan:100,act:null},{m:"May 27",plan:100,act:null},{m:"Jun 27",plan:100,act:null},{m:"Jul 27",plan:100,act:null},{m:"Aug 27",plan:100,act:null},{m:"Sep 27",plan:100,act:null},{m:"Oct 27",plan:100,act:null},{m:"Nov 27",plan:100,act:null},{m:"Dec 27",plan:100,act:null}]
  },
  "PRJ-004": {
    "2026": [{m:"Jan 26",plan:0,act:0},{m:"Feb 26",plan:0,act:0},{m:"Mar 26",plan:0,act:0},{m:"Apr 26",plan:0,act:0},{m:"May 26",plan:8,act:7},{m:"Jun 26",plan:18,act:15},{m:"Jul 26",plan:28,act:24},{m:"Aug 26",plan:38,act:34},{m:"Sep 26",plan:50,act:45},{m:"Oct 26",plan:65,act:null},{m:"Nov 26",plan:85,act:null},{m:"Dec 26",plan:100,act:null}],
    "2027": [{m:"Jan 27",plan:100,act:null},{m:"Feb 27",plan:100,act:null},{m:"Mar 27",plan:100,act:null},{m:"Apr 27",plan:100,act:null},{m:"May 27",plan:100,act:null},{m:"Jun 27",plan:100,act:null},{m:"Jul 27",plan:100,act:null},{m:"Aug 27",plan:100,act:null},{m:"Sep 27",plan:100,act:null},{m:"Oct 27",plan:100,act:null},{m:"Nov 27",plan:100,act:null},{m:"Dec 27",plan:100,act:null}]
  },
  "PRJ-005": {
    "2026": [{m:"Jan 26",plan:0,act:0},{m:"Feb 26",plan:0,act:0},{m:"Mar 26",plan:0,act:0},{m:"Apr 26",plan:0,act:0},{m:"May 26",plan:0,act:0},{m:"Jun 26",plan:0,act:0},{m:"Jul 26",plan:0,act:0},{m:"Aug 26",plan:0,act:0},{m:"Sep 26",plan:0,act:0},{m:"Oct 26",plan:0,act:null},{m:"Nov 26",plan:0,act:null},{m:"Dec 26",plan:5,act:null}],
    "2027": [{m:"Jan 27",plan:18,act:null},{m:"Feb 27",plan:35,act:null},{m:"Mar 27",plan:55,act:null},{m:"Apr 27",plan:75,act:null},{m:"May 27",plan:90,act:null},{m:"Jun 27",plan:100,act:null},{m:"Jul 27",plan:100,act:null},{m:"Aug 27",plan:100,act:null},{m:"Sep 27",plan:100,act:null},{m:"Oct 27",plan:100,act:null},{m:"Nov 27",plan:100,act:null},{m:"Dec 27",plan:100,act:null}]
  },
  "PRJ-006": {
    "2026": [{m:"Jan 26",plan:0,act:0},{m:"Feb 26",plan:0,act:0},{m:"Mar 26",plan:0,act:0},{m:"Apr 26",plan:0,act:0},{m:"May 26",plan:0,act:0},{m:"Jun 26",plan:0,act:0},{m:"Jul 26",plan:0,act:0},{m:"Aug 26",plan:0,act:0},{m:"Sep 26",plan:0,act:0},{m:"Oct 26",plan:0,act:null},{m:"Nov 26",plan:0,act:null},{m:"Dec 26",plan:0,act:null}],
    "2027": [{m:"Jan 27",plan:0,act:null},{m:"Feb 27",plan:8,act:null},{m:"Mar 27",plan:20,act:null},{m:"Apr 27",plan:35,act:null},{m:"May 27",plan:50,act:null},{m:"Jun 27",plan:65,act:null},{m:"Jul 27",plan:78,act:null},{m:"Aug 27",plan:88,act:null},{m:"Sep 27",plan:95,act:null},{m:"Oct 27",plan:100,act:null},{m:"Nov 27",plan:100,act:null},{m:"Dec 27",plan:100,act:null}]
  },
  "PRJ-007": {
    "2026": [{m:"Jan 26",plan:0,act:0},{m:"Feb 26",plan:0,act:0},{m:"Mar 26",plan:0,act:0},{m:"Apr 26",plan:0,act:0},{m:"May 26",plan:0,act:0},{m:"Jun 26",plan:0,act:0},{m:"Jul 26",plan:0,act:0},{m:"Aug 26",plan:0,act:0},{m:"Sep 26",plan:0,act:0},{m:"Oct 26",plan:0,act:null},{m:"Nov 26",plan:0,act:null},{m:"Dec 26",plan:0,act:null}],
    "2027": [{m:"Jan 27",plan:0,act:null},{m:"Feb 27",plan:0,act:null},{m:"Mar 27",plan:10,act:null},{m:"Apr 27",plan:22,act:null},{m:"May 27",plan:36,act:null},{m:"Jun 27",plan:52,act:null},{m:"Jul 27",plan:66,act:null},{m:"Aug 27",plan:80,act:null},{m:"Sep 27",plan:90,act:null},{m:"Oct 27",plan:96,act:null},{m:"Nov 27",plan:100,act:null},{m:"Dec 27",plan:100,act:null}]
  },
  "PRJ-008": {
    "2026": [{m:"Jan 26",plan:0,act:0},{m:"Feb 26",plan:0,act:0},{m:"Mar 26",plan:0,act:0},{m:"Apr 26",plan:0,act:0},{m:"May 26",plan:0,act:0},{m:"Jun 26",plan:0,act:0},{m:"Jul 26",plan:0,act:0},{m:"Aug 26",plan:0,act:0},{m:"Sep 26",plan:0,act:0},{m:"Oct 26",plan:0,act:null},{m:"Nov 26",plan:0,act:null},{m:"Dec 26",plan:0,act:null}],
    "2027": [{m:"Jan 27",plan:0,act:null},{m:"Feb 27",plan:0,act:null},{m:"Mar 27",plan:0,act:null},{m:"Apr 27",plan:8,act:null},{m:"May 27",plan:20,act:null},{m:"Jun 27",plan:35,act:null},{m:"Jul 27",plan:50,act:null},{m:"Aug 27",plan:65,act:null},{m:"Sep 27",plan:80,act:null},{m:"Oct 27",plan:90,act:null},{m:"Nov 27",plan:96,act:null},{m:"Dec 27",plan:100,act:null}]
  }
};

// Global App State Variables
let activeSelectedProjectCode = "";
let activeSelectedProjectName = "";
let activeConsultantProjectCode = "";
let activeConsultantProjectName = "";

let currentUserRole = "";
let userAuthorizedProjectsList = [];

let currentMetadataList = [];
let currentHistoryList = [];
let pendingVerificationsList = [];
let pendingScopeVerificationsList = [];
let pendingApprovalsList = [];
let pendingScopeApprovalsList = [];

let currentScorecardType = "Consultant";
let currentMgmtScorecardTable = "Consultant";
let activeScorecardData = [];
let consultantScorecardFullList = [];
let contractorScorecardFullList = [];
let pendingRejectTarget = null;
