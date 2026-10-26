// ==========================================================================
// Firebase Authentication & Authorization Engine
// ==========================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Expose on global window object for HTML onclick handlers
window.firebaseAuth = auth;
window.googleProvider = googleProvider;
window.signInWithPopup = signInWithPopup;
window.signOut = signOut;

// Listen for Auth State Changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    window.currentUserEmail = user.email ? user.email.toLowerCase() : "";
    window.currentUserName = user.displayName || user.email;
    document.getElementById('currentUserDisplay').innerText = "👤 " + window.currentUserName;
    
    if (window.currentUserEmail) {
      await processUserAuthorization(window.currentUserEmail);
    }
  } else {
    window.currentUserEmail = null;
    window.currentUserName = null;
    logoutUI();
  }
});

// Google SSO Sign-in
window.loginWithGoogleSSO = async function() {
  const spinner = document.getElementById('loginStatusSpinner');
  spinner.style.display = 'block';

  try {
    const result = await window.signInWithPopup(window.firebaseAuth, window.googleProvider);
    const user = result.user;
    await processUserAuthorization(user.email.toLowerCase());
  } catch (err) {
    spinner.style.display = 'none';
    console.error("Google SSO Error:", err);
    alert("Authentication failed: " + err.message);
  }
};

// Check Google Sheet Whitelist
async function processUserAuthorization(email) {
  const spinner = document.getElementById('loginStatusSpinner');
  spinner.style.display = 'block';

  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkWhitelist&email=${encodeURIComponent(email)}`);
    const data = await res.json();

    spinner.style.display = 'none';

    if (data.status === 'success' && data.authorized) {
      currentUserRole = data.role;
      setupRoleNavigation(currentUserRole, data.assignedProject);
    } else {
      alert(`Access Denied: Your email (${email}) is not registered in the system. Please contact PDD Authority for assistance.`);
      await window.signOut(window.firebaseAuth);
    }
  } catch (err) {
    spinner.style.display = 'none';
    console.error("Authorization Error:", err);
    alert("Unable to verify user authorization. Please try again.");
  }
}

// Setup Role-based Nav
function setupRoleNavigation(role, assignedProject) {
  document.getElementById('appHeader').style.display = 'flex';
  document.getElementById('appRule').style.display = 'block';

  document.getElementById('navDashboard').style.display = 'none';
  document.getElementById('navApproval').style.display = 'none';
  document.getElementById('navScorecard').style.display = 'none';
  document.getElementById('navVerification').style.display = 'none';
  document.getElementById('navInput').style.display = 'none';

  userAuthorizedProjectsList = parseAssignedProjects(assignedProject);

  if (role === 'Admin') {
    document.getElementById('navDashboard').style.display = 'inline-block';
    document.getElementById('navApproval').style.display = 'inline-block';
    document.getElementById('navScorecard').style.display = 'inline-block';
    document.getElementById('navVerification').style.display = 'inline-block';
    document.getElementById('navInput').style.display = 'inline-block';
    switchPage('page2');
  } else if (role === 'HigherManagement' || role === 'MRANTIManagement') {
    document.getElementById('navDashboard').style.display = 'inline-block';
    switchPage('page2');
  } else if (role === 'PDDAuthority') {
    document.getElementById('navDashboard').style.display = 'inline-block';
    document.getElementById('navApproval').style.display = 'inline-block';
    document.getElementById('navScorecard').style.display = 'inline-block';
    switchPage('page3Authority');
  } else if (role === 'Consultant') {
    document.getElementById('navVerification').style.display = 'inline-block';
    switchPage('page3Consultant');
    initConsultantProjectView();
  } else if (role === 'Contractor') {
    document.getElementById('navInput').style.display = 'inline-block';
    switchPage('page4');
    initContractorProjectView();
  }
}

// Page Switcher
window.switchPage = function(pageId) {
  document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  document.querySelectorAll('.btn-nav').forEach(b => b.classList.remove('active'));
  if (pageId === 'page2') document.getElementById('navDashboard').classList.add('active');
  if (pageId === 'page3Authority') document.getElementById('navApproval').classList.add('active');
  if (pageId === 'pageScorecard') document.getElementById('navScorecard').classList.add('active');
  if (pageId === 'page3Consultant') document.getElementById('navVerification').classList.add('active');
  if (pageId === 'page4') document.getElementById('navInput').classList.add('active');

  if (pageId === 'page2') { loadPage2Data(); loadMonthlyTrackingGraph(); loadHigherMgmtScorecards(); }
  if (pageId === 'page3Consultant') { if (activeConsultantProjectCode) loadConsultantPageData(); else initConsultantProjectView(); }
  if (pageId === 'pageScorecard') loadScorecardPageData();
  if (pageId === 'page3Authority') loadAuthorityPageData();
  if (pageId === 'page4') { if (activeSelectedProjectCode) fetchProjectMetadataAndHistory(); else initContractorProjectView(); }
};

window.logout = function() {
  if (window.firebaseAuth) {
    window.signOut(window.firebaseAuth).then(() => logoutUI());
  } else {
    logoutUI();
  }
};

function logoutUI() {
  activeSelectedProjectCode = "";
  activeSelectedProjectName = "";
  activeConsultantProjectCode = "";
  activeConsultantProjectName = "";
  currentUserRole = "";
  userAuthorizedProjectsList = [];

  document.getElementById('appHeader').style.display = 'none';
  document.getElementById('appRule').style.display = 'none';
  switchPage('page1');
}
