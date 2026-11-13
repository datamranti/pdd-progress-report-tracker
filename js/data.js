// Project names are populated from Google Sheets at login.
let baselineOverallData = [];

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

