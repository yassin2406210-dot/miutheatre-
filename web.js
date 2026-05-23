// =============================================
//   MIU Theatre Club - web.js (CLEAN VERSION)
// =============================================

var currentPage = "home";

function showPage(pageName) {
    closeMobileMenu();
    var protectedPages = ["auditions", "scripts", "exit", "rehearsals", "admin"];
    var session = getSession();

    for (var p = 0; p < protectedPages.length; p++) {
        if (pageName === protectedPages[p] && session === null) {
            localStorage.setItem("miu_redirect", pageName);
            showPage("login");
            showToast("Please sign in to access this page.", "er");
            return;
        }
    }

    if (pageName === "admin") {
        if (session === null || session.role !== "admin") {
            showPage("login");
            return;
        }
    }

    if (session !== null && session.role === "admin") {
        var adminOnlyPages = ["admin", "login"];
        var allowed = false;
        for (var a = 0; a < adminOnlyPages.length; a++) {
            if (pageName === adminOnlyPages[a]) { allowed = true; }
        }
        if (!allowed) { showPage("admin"); return; }
    }

    var allPages = document.querySelectorAll(".page");
    for (var i = 0; i < allPages.length; i++) {
        allPages[i].classList.remove("active");
    }

    var selectedPage = document.getElementById("page-" + pageName);
    if (selectedPage === null) { console.log("Page not found: " + pageName); return; }
    selectedPage.classList.add("active");
    window.scrollTo(0, 0);
    currentPage = pageName;

    if (pageName === "home") { renderHomeDeadlines(); renderHomeWorkshops(); loadSocialLinks(); }
    if (pageName === "workshops") { renderWorkshops(); }
    if (pageName === "rehearsals") { renderRehearsals(); }
    if (pageName === "admin") { initAdminPage(); renderAdminPanel("dashboard"); }
    if (pageName === "login") { clearLoginForm(); }
    if (pageName === "contact") { autoFillContactEmail(); }
    if (pageName === "auditions") { resetForm("auditionForm", "auditionSuccess"); autoFillForms(); renderAuditionDeadline(); }
    if (pageName === "scripts") { resetForm("scriptForm", "scriptSuccess"); autoFillForms(); renderScriptDeadline(); }
    if (pageName === "exit") { resetForm("exitForm", "exitSuccess"); autoFillForms(); }
}

function resetForm(formId, successId) {
    var form = document.getElementById(formId);
    var success = document.getElementById(successId);
    if (form !== null) {
        form.style.display = "";
        var inputs = form.querySelectorAll("input, textarea, select");
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type === "checkbox") { inputs[i].checked = false; }
            else { inputs[i].value = ""; }
        }
    }
    if (success !== null) { success.style.display = "none"; }
}

function clearLoginForm() {
    var emailInput = document.getElementById("signinEmail");
    var pwInput    = document.getElementById("signinPw");
    if (emailInput !== null) { emailInput.value = ""; emailInput.style.borderColor = ""; }
    if (pwInput !== null) { pwInput.value = ""; pwInput.style.borderColor = ""; }
    var suName  = document.getElementById("signupName");
    var suEmail = document.getElementById("signupEmail");
    var suPw    = document.getElementById("signupPw");
    var suPw2   = document.getElementById("signupPw2");
    if (suName  !== null) { suName.value  = ""; suName.style.borderColor  = ""; }
    if (suEmail !== null) { suEmail.value = ""; suEmail.style.borderColor = ""; }
    if (suPw    !== null) { suPw.value    = ""; suPw.style.borderColor    = ""; }
    if (suPw2   !== null) { suPw2.value   = ""; suPw2.style.borderColor   = ""; }
    hideAlert("signinAlert"); hideAlert("signupAlert");
    hideErrorMsg("signinEmailError"); hideErrorMsg("signinPwError");
    hideErrorMsg("signupNameError"); hideErrorMsg("signupEmailError");
    hideErrorMsg("signupPwError"); hideErrorMsg("signupPw2Error");
}

function autoFillForms() {
    var session = getSession();
    if (session === null) return;
    var nameInputs  = ["audName", "scrName", "exitName"];
    var emailInputs = ["audEmail", "scrEmail", "exitEmail"];
    for (var i = 0; i < nameInputs.length; i++) {
        var n = document.getElementById(nameInputs[i]);
        if (n !== null) { n.value = session.name; n.readOnly = true; }
    }
    for (var j = 0; j < emailInputs.length; j++) {
        var e = document.getElementById(emailInputs[j]);
        if (e !== null) { e.value = session.email; e.readOnly = true; }
    }
}

function autoFillContactEmail() {
    var session    = getSession();
    var emailInput = document.getElementById("ctEmail");
    if (emailInput === null) return;
    if (session !== null) { emailInput.value = session.email; emailInput.readOnly = true; }
    else { emailInput.value = ""; emailInput.readOnly = false; }
}

function updateNav() {
    var session        = getSession();
    var loginBtn       = document.getElementById("loginBtn");
    var logoutBtn      = document.getElementById("logoutBtn");
    var mobileLoginBtn = document.getElementById("mobileLoginBtn");
    var mobileLogoutBtn= document.getElementById("mobileLogoutBtn");
    var navLinks       = document.getElementById("navLinks");

    if (session !== null) { document.body.classList.add("logged-in"); }
    else { document.body.classList.remove("logged-in"); }

    if (session !== null) {
        loginBtn.style.display = "none"; logoutBtn.style.display = "";
        mobileLoginBtn.style.display = "none"; mobileLogoutBtn.style.display = "";
        if (session.role === "admin") {
            logoutBtn.textContent = "⚙️ " + session.name + " — Sign Out";
            mobileLogoutBtn.textContent = "⚙️ " + session.name + " — Sign Out";
            var allNavBtns = navLinks.querySelectorAll("button:not(#loginBtn):not(#logoutBtn):not(#darkModeBtn), .dropdown");
            for (var i = 0; i < allNavBtns.length; i++) { allNavBtns[i].style.display = "none"; }
            if (!document.getElementById("adminPanelBtn")) {
                var adminBtn = document.createElement("button");
                adminBtn.id = "adminPanelBtn"; adminBtn.textContent = "⚙️ Admin Panel";
                adminBtn.onclick = function() { showPage("admin"); };
                navLinks.insertBefore(adminBtn, logoutBtn);
            }
        } else {
            logoutBtn.textContent = "👤 " + session.name + " — Sign Out";
            mobileLogoutBtn.textContent = "👤 " + session.name + " — Sign Out";
        }
    } else {
        loginBtn.style.display = ""; logoutBtn.style.display = "none";
        mobileLoginBtn.style.display = ""; mobileLogoutBtn.style.display = "none";
        var allNavBtns2 = navLinks.querySelectorAll("button, .dropdown");
        for (var k = 0; k < allNavBtns2.length; k++) { allNavBtns2[k].style.display = ""; }
        var adminBtn2 = document.getElementById("adminPanelBtn");
        if (adminBtn2 !== null) { adminBtn2.parentNode.removeChild(adminBtn2); }
    }
}

window.addEventListener("scroll", function() {
    var navbar = document.getElementById("navbar");
    if (window.scrollY > 20) { navbar.classList.add("scrolled"); }
    else { navbar.classList.remove("scrolled"); }
});

function toggleMobileMenu() { document.getElementById("mobileMenu").classList.toggle("open"); }
function closeMobileMenu() { document.getElementById("mobileMenu").classList.remove("open"); }

function showToast(message, type) {
    var toast = document.getElementById("toast");
    toast.textContent = message; toast.className = "show";
    if (type === "ok") { toast.classList.add("ok"); }
    else if (type === "er") { toast.classList.add("er"); }
    setTimeout(function() { toast.className = ""; }, 3200);
}

function isValidMIUEmail(email) {
    return /^[^ ]+@miuegypt\.edu\.eg$/.test(email.trim().toLowerCase());
}
function isValidURL(url) {
    return /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url.trim());
}
function showAlert(alertId, message, type) {
    var alertBox = document.getElementById(alertId);
    alertBox.style.display = ""; alertBox.className = "alert " + type;
    alertBox.innerHTML = (type === "error" ? "⚠️ " : "✅ ") + message;
}
function hideAlert(alertId) { var a = document.getElementById(alertId); a.style.display = "none"; a.className = "alert"; }
function showErrorMsg(id) { document.getElementById(id).style.display = "block"; }
function hideErrorMsg(id) { document.getElementById(id).style.display = "none"; }
function markError(id)   { document.getElementById(id).style.borderColor = "#e24b4a"; }
function clearError(id)  { document.getElementById(id).style.borderColor = ""; }

function togglePassword(inputId, buttonId) {
    var input = document.getElementById(inputId);
    var button = document.getElementById(buttonId);
    if (input.type === "password") { input.type = "text"; button.textContent = "🙈"; }
    else { input.type = "password"; button.textContent = "👁"; }
}

function switchLoginTab(tab) {
    var formSignIn = document.getElementById("formSignIn");
    var formSignUp = document.getElementById("formSignUp");
    var tabSignIn  = document.getElementById("tabSignIn");
    var tabSignUp  = document.getElementById("tabSignUp");
    if (tab === "signin") {
        formSignIn.style.display = ""; formSignUp.style.display = "none";
        tabSignIn.classList.add("active"); tabSignUp.classList.remove("active");
    } else {
        formSignIn.style.display = "none"; formSignUp.style.display = "";
        tabSignIn.classList.remove("active"); tabSignUp.classList.add("active");
    }
    hideAlert("signinAlert"); hideAlert("signupAlert");
}

function doLogin() {
    var email    = document.getElementById("signinEmail").value.trim().toLowerCase();
    var password = document.getElementById("signinPw").value;
    hideAlert("signinAlert"); hideErrorMsg("signinEmailError"); hideErrorMsg("signinPwError");
    clearError("signinEmail"); clearError("signinPw");
    var valid = true;
    if (email === "" || !isValidMIUEmail(email)) { showErrorMsg("signinEmailError"); markError("signinEmail"); valid = false; }
    if (password.length < 6) { showErrorMsg("signinPwError"); markError("signinPw"); valid = false; }
    if (!valid) return;
    var users = getData("miu_users");
    var user = null;
    for (var i = 0; i < users.length; i++) { if (users[i].email === email) { user = users[i]; break; } }
    if (user === null) { showAlert("signinAlert", "Incorrect email or password.", "error"); return; }
    if (user.blocked === true) { showAlert("signinAlert", "Your account has been blocked. Please contact the admin.", "error"); return; }
    if (user.password !== password) { showAlert("signinAlert", "Incorrect email or password.", "error"); return; }
    saveSession(user); updateNav(); localStorage.removeItem("miu_redirect");
    if (user.role === "admin") { showPage("admin"); }
    else {
        var redirect = localStorage.getItem("miu_redirect");
        localStorage.removeItem("miu_redirect");
        showPage(redirect !== null ? redirect : "home");
        showToast("Welcome back, " + user.name + " 🎭", "ok");
    }
}

function doSignup() {
    var name      = document.getElementById("signupName").value.trim();
    var email     = document.getElementById("signupEmail").value.trim().toLowerCase();
    var password  = document.getElementById("signupPw").value;
    var password2 = document.getElementById("signupPw2").value;
    hideAlert("signupAlert");
    hideErrorMsg("signupNameError"); hideErrorMsg("signupEmailError");
    hideErrorMsg("signupPwError"); hideErrorMsg("signupPw2Error");
    clearError("signupName"); clearError("signupEmail"); clearError("signupPw"); clearError("signupPw2");
    var valid = true;
    if (name === "") { showErrorMsg("signupNameError"); markError("signupName"); valid = false; }
    if (email === "" || !isValidMIUEmail(email)) { showErrorMsg("signupEmailError"); markError("signupEmail"); valid = false; }
    if (password.length < 6) { showErrorMsg("signupPwError"); markError("signupPw"); valid = false; }
    if (password !== password2) { showErrorMsg("signupPw2Error"); markError("signupPw2"); valid = false; }
    if (!valid) return;
    var users = getData("miu_users");
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) { showAlert("signupAlert", "This email is already registered. Please sign in.", "error"); return; }
    }
    users.push({ name: name, email: email, password: password, role: "user", blocked: false });
    saveData("miu_users", users);
    saveSession({ name: name, email: email, role: "user" });
    updateNav();
    var redirect = localStorage.getItem("miu_redirect");
    localStorage.removeItem("miu_redirect");
    showPage(redirect !== null ? redirect : "home");
    showToast("Account created! Welcome, " + name + " 🎭", "ok");
}

function doLogout() { clearSession(); updateNav(); showPage("home"); showToast("Signed out successfully.", "ok"); }

function submitContact() {
    var firstName = document.getElementById("ctFirstName").value.trim();
    var lastName  = document.getElementById("ctLastName").value.trim();
    var email     = document.getElementById("ctEmail").value.trim();
    var subject   = document.getElementById("ctSubject").value;
    var message   = document.getElementById("ctMessage").value.trim();
    hideAlert("contactAlert");
    if (firstName === "" || lastName === "" || email === "" || subject === "" || message === "") {
        showAlert("contactAlert", "Please fill in ALL fields to send your message.", "error"); return;
    }
    var session = getSession();
    if (session === null && !isValidMIUEmail(email)) {
        showAlert("contactAlert", "Please use your MIU email (@miuegypt.edu.eg).", "error"); return;
    }
    var messages = getData("contact_messages");
    messages.push({ firstName, lastName, email, subject, message, date: new Date().toLocaleDateString() });
    saveData("contact_messages", messages);
    showAlert("contactAlert", "Your message has been sent! We will get back to you within 1–2 business days.", "success");
    document.getElementById("ctFirstName").value = "";
    document.getElementById("ctLastName").value = "";
    document.getElementById("ctSubject").value = "";
    document.getElementById("ctMessage").value = "";
    if (session === null) { document.getElementById("ctEmail").value = ""; }
}

// ── Deadlines ────────────────────────────────────────────────

function getDeadline(type) {
    var deadlines = getData("deadlines");
    for (var i = 0; i < deadlines.length; i++) {
        if (deadlines[i].type === type) return deadlines[i];
    }
    return null;
}
function isDeadlinePassed(deadlineDate) {
    if (!deadlineDate) return false;
    var today = new Date(); today.setHours(0,0,0,0);
    return today > new Date(deadlineDate);
}
function getDaysLeft(dateString) {
    var days = Math.ceil((new Date(dateString) - new Date()) / (1000*60*60*24));
    return days < 0 ? 0 : days;
}
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" });
}

function renderAuditionDeadline() {
    var container  = document.getElementById("auditionDeadlineBanner");
    var form       = document.getElementById("auditionForm");
    var closedMsg  = document.getElementById("auditionClosed");
    var notOpenMsg = document.getElementById("auditionNotOpen");
    if (!container || !form || !closedMsg || !notOpenMsg) return;
    var deadline = getDeadline("auditions");
    if (!deadline) {
        container.innerHTML = ""; container.style.display = "none";
        form.style.display = "none"; closedMsg.style.display = "none"; notOpenMsg.style.display = "block"; return;
    }
    if (isDeadlinePassed(deadline.date)) {
        container.innerHTML = ""; container.style.display = "none";
        form.style.display = "none"; closedMsg.style.display = "block"; notOpenMsg.style.display = "none"; return;
    }
    var daysLeft = getDaysLeft(deadline.date);
    var html = '<div class="deadline-banner active"><div class="deadline-icon">⏰</div><div class="deadline-info">';
    html += '<h4>Application Deadline</h4><p>' + formatDate(deadline.date);
    html += daysLeft === 0 ? ' <span class="deadline-status urgent">(Today!)</span>' : ' <span class="deadline-status">(' + daysLeft + ' days left)</span>';
    html += '</p></div></div>';
    container.innerHTML = html; container.style.display = "block";
    form.style.display = "block"; closedMsg.style.display = "none"; notOpenMsg.style.display = "none";
}

function renderScriptDeadline() {
    var container  = document.getElementById("scriptDeadlineBanner");
    var form       = document.getElementById("scriptForm");
    var closedMsg  = document.getElementById("scriptClosed");
    var notOpenMsg = document.getElementById("scriptNotOpen");
    if (!container || !form || !closedMsg || !notOpenMsg) return;
    var deadline = getDeadline("scripts");
    if (!deadline) {
        container.innerHTML = ""; container.style.display = "none";
        form.style.display = "none"; closedMsg.style.display = "none"; notOpenMsg.style.display = "block"; return;
    }
    if (isDeadlinePassed(deadline.date)) {
        container.innerHTML = ""; container.style.display = "none";
        form.style.display = "none"; closedMsg.style.display = "block"; notOpenMsg.style.display = "none"; return;
    }
    var daysLeft = getDaysLeft(deadline.date);
    var html = '<div class="deadline-banner active"><div class="deadline-icon">⏰</div><div class="deadline-info">';
    html += '<h4>Submission Deadline</h4><p>' + formatDate(deadline.date);
    html += daysLeft === 0 ? ' <span class="deadline-status urgent">(Today!)</span>' : ' <span class="deadline-status">(' + daysLeft + ' days left)</span>';
    html += '</p></div></div>';
    container.innerHTML = html; container.style.display = "block";
    form.style.display = "block"; closedMsg.style.display = "none"; notOpenMsg.style.display = "none";
}

// ── Form Submissions ─────────────────────────────────────────

function submitAudition() {
    var name       = document.getElementById("audName").value.trim();
    var email      = document.getElementById("audEmail").value.trim().toLowerCase();
    var studentId  = document.getElementById("audId").value.trim();
    var faculty    = document.getElementById("audFaculty").value.trim();
    var experience = document.getElementById("audExperience").value.trim();
    var why        = document.getElementById("audWhy").value.trim();
    var check1     = document.getElementById("audCheck1").checked;
    var check2     = document.getElementById("audCheck2").checked;
    hideAlert("auditionAlert");
    var deadline = getDeadline("auditions");
    if (deadline && isDeadlinePassed(deadline.date)) {
        showAlert("auditionAlert", "Applications are now closed. The deadline has passed.", "error"); return;
    }
    if (!name || !email || !studentId || !faculty || !experience || !why) {
        showAlert("auditionAlert", "Please fill in ALL fields to complete your application.", "error"); return;
    }
    if (!isValidMIUEmail(email)) { showAlert("auditionAlert", "Please use your MIU email.", "error"); return; }
    if (!check1 || !check2) { showAlert("auditionAlert", "Please confirm both commitment checkboxes.", "error"); return; }
    var applications = getData("auditions");
    applications.push({ name, email, studentId, faculty, experience, why, status: "pending", date: new Date().toLocaleDateString() });
    saveData("auditions", applications);
    document.getElementById("auditionForm").style.display = "none";
    document.getElementById("auditionSuccess").style.display = "block";
}

function submitScript() {
    var name        = document.getElementById("scrName").value.trim();
    var email       = document.getElementById("scrEmail").value.trim().toLowerCase();
    var title       = document.getElementById("scrTitle").value.trim();
    var genre       = document.getElementById("scrGenre").value;
    var language    = document.getElementById("scrLanguage").value;
    var description = document.getElementById("scrDescription").value.trim();
    var cast        = document.getElementById("scrCast").value.trim();
    var link        = document.getElementById("scrLink").value.trim();
    var check1      = document.getElementById("scrCheck1").checked;
    hideAlert("scriptAlert");
    var deadline = getDeadline("scripts");
    if (deadline && isDeadlinePassed(deadline.date)) {
        showAlert("scriptAlert", "Submissions are now closed. The deadline has passed.", "error"); return;
    }
    if (!name || !email || !title || !genre || !language || !description || !cast || !link) {
        showAlert("scriptAlert", "Please fill in ALL fields to complete your submission.", "error"); return;
    }
    if (!isValidMIUEmail(email)) { showAlert("scriptAlert", "Please use your MIU email.", "error"); return; }
    if (!isValidURL(link)) { showAlert("scriptAlert", "Please enter a valid URL for the script link.", "error"); return; }
    if (!check1) { showAlert("scriptAlert", "Please confirm the ownership checkbox.", "error"); return; }
    var submissions = getData("scripts");
    submissions.push({ name, email, title, genre, language, description, castSize: cast, link, status: "pending", date: new Date().toLocaleDateString() });
    saveData("scripts", submissions);
    document.getElementById("scriptForm").style.display = "none";
    document.getElementById("scriptSuccess").style.display = "block";
}

function submitExit() {
    var name     = document.getElementById("exitName").value.trim();
    var email    = document.getElementById("exitEmail").value.trim().toLowerCase();
    var duration = document.getElementById("exitDuration").value.trim();
    var reason   = document.getElementById("exitReason").value;
    var comments = document.getElementById("exitComments").value.trim();
    var check1   = document.getElementById("exitCheck1").checked;
    hideAlert("exitAlert");
    if (!name || !email || !reason) {
        showAlert("exitAlert", "Please fill in all required fields to complete your exit request.", "error"); return;
    }
    if (!isValidMIUEmail(email)) { showAlert("exitAlert", "Please use your MIU email.", "error"); return; }
    if (!check1) { showAlert("exitAlert", "Please confirm the checkbox.", "error"); return; }
    var exits = getData("exit_interviews");
    exits.push({ name, email, duration, reason, comments, status: "pending", date: new Date().toLocaleDateString() });
    saveData("exit_interviews", exits);
    document.getElementById("exitForm").style.display = "none";
    document.getElementById("exitSuccess").style.display = "block";
}

// ── Social Links ─────────────────────────────────────────────

function getSocialLinks() {
    var links = getData("social_links");
    return links.length === 0 ? { ig: "#", tt: "#" } : links[0];
}
function loadSocialLinks() {
    var social = getSocialLinks();
    var ig = document.getElementById("igLink"); if (ig) ig.href = social.ig;
    var tt = document.getElementById("ttLink"); if (tt) tt.href = social.tt;
}
function saveSocialLinks() {
    var ig = document.getElementById("socialIG").value.trim();
    var tt = document.getElementById("socialTT").value.trim();
    if (ig !== "" && !isValidURL(ig)) { showToast("Please enter a valid Instagram URL", "er"); return; }
    if (tt !== "" && !isValidURL(tt)) { showToast("Please enter a valid TikTok URL", "er"); return; }
    saveData("social_links", [{ ig, tt }]);
    loadSocialLinks();
    showToast("Social links saved!", "ok");
}

// =============================================
//   WORKSHOPS
// =============================================

function getWorkshops() {
    var data = localStorage.getItem("miu_workshops_v2");
    if (data === null) {
        var oldData = getData("workshops");
        if (oldData.length > 0) {
            var migrated = oldData.map(function(w) {
                return { id: Date.now() + Math.random().toString(36).substr(2,9), title: w.title, date: w.date,
                         time: w.time||"", location: w.location||"", description: w.desc||"",
                         instructor: w.instructor||"TBA", image: w.image||"",
                         maxSpots: w.maxSpots||20, joinedUsers: w.joinedUsers||[], featured: w.featured||false };
            });
            localStorage.setItem("miu_workshops_v2", JSON.stringify(migrated));
            return migrated;
        }
        return [];
    }
    return JSON.parse(data);
}
function saveWorkshops(workshops) { localStorage.setItem("miu_workshops_v2", JSON.stringify(workshops)); }

function getUserJoinedWorkshops() {
    var session = getSession();
    if (!session) return [];
    var data = localStorage.getItem("miu_joined_workshops_" + session.email);
    return data === null ? [] : JSON.parse(data);
}
function saveUserJoinedWorkshops(email, joined) {
    localStorage.setItem("miu_joined_workshops_" + email, JSON.stringify(joined));
}
function getSpotsLeft(workshop) {
    return Math.max(0, workshop.maxSpots - (workshop.joinedUsers ? workshop.joinedUsers.length : 0));
}
function hasUserJoined(workshopId) {
    var session = getSession();
    if (!session) return false;
    return getUserJoinedWorkshops().indexOf(workshopId) !== -1;
}

function openJoinForm(workshopId) {
    var session = getSession();
    if (!session) { showToast("Please sign in to join workshops", "er"); showPage("login"); return; }
    var workshops = getWorkshops();
    var workshop = null;
    for (var i = 0; i < workshops.length; i++) { if (workshops[i].id === workshopId) { workshop = workshops[i]; break; } }
    if (!workshop) { showToast("Workshop not found", "er"); return; }
    if (getSpotsLeft(workshop) <= 0) { showToast("This workshop is full!", "er"); return; }
    var html = '<div id="joinModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;">';
    html += '<div style="background:linear-gradient(135deg,#1e1e1e,#2a0a0b);border:2px solid #C0141C;border-radius:20px;padding:35px;max-width:420px;width:100%;box-shadow:0 25px 80px rgba(0,0,0,0.6);">';
    html += '<div style="text-align:center;margin-bottom:25px;"><div style="font-size:48px;margin-bottom:10px;">🎭</div><h3 style="color:#ff6b6b;margin-bottom:5px;font-size:22px;">Join Workshop</h3><p style="color:#aaa;font-size:14px;">' + workshop.title + '</p></div>';
    html += '<div class="form-group" style="margin-bottom:18px;"><label style="color:#e0e0e0;font-size:13px;display:block;margin-bottom:6px;">Full Name *</label><input type="text" id="joinName" value="' + (session.name||'') + '" style="width:100%;padding:14px;border-radius:12px;border:1px solid rgba(192,20,28,0.4);background:rgba(30,30,30,0.9);color:#fff;font-size:14px;"/></div>';
    html += '<div class="form-group" style="margin-bottom:18px;"><label style="color:#e0e0e0;font-size:13px;display:block;margin-bottom:6px;">Student ID *</label><input type="text" id="joinStudentId" placeholder="e.g. MIU-2022-12345" style="width:100%;padding:14px;border-radius:12px;border:1px solid rgba(192,20,28,0.4);background:rgba(30,30,30,0.9);color:#fff;font-size:14px;"/></div>';
    html += '<div class="form-group" style="margin-bottom:25px;"><label style="color:#e0e0e0;font-size:13px;display:block;margin-bottom:6px;">Faculty</label><input type="text" id="joinFaculty" placeholder="e.g. Business Administration" style="width:100%;padding:14px;border-radius:12px;border:1px solid rgba(192,20,28,0.4);background:rgba(30,30,30,0.9);color:#fff;font-size:14px;"/></div>';
    html += '<div style="display:flex;gap:12px;">';
    html += '<button onclick="submitJoinForm(\'' + workshopId + '\')" style="flex:1;padding:14px;background:linear-gradient(135deg,#C0141C,#e03131);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;">Confirm Join</button>';
    html += '<button onclick="closeJoinModal()" style="flex:1;padding:14px;background:rgba(42,42,42,0.9);color:#ccc;border:none;border-radius:12px;font-weight:600;font-size:15px;cursor:pointer;">Cancel</button>';
    html += '</div></div></div>';
    var div = document.createElement('div'); div.innerHTML = html;
    document.body.appendChild(div.firstChild);
}

function closeJoinModal() {
    var modal = document.getElementById("joinModal");
    if (modal) { modal.style.opacity = "0"; setTimeout(function() { modal.remove(); }, 300); }
}

function submitJoinForm(workshopId) {
    var name      = document.getElementById("joinName").value.trim();
    var studentId = document.getElementById("joinStudentId").value.trim();
    var faculty   = document.getElementById("joinFaculty").value.trim();
    if (!name || !studentId) { showToast("Name and Student ID are required", "er"); return; }
    var session = getSession();
    var workshops = getWorkshops();
    var idx = -1;
    for (var i = 0; i < workshops.length; i++) { if (workshops[i].id === workshopId) { idx = i; break; } }
    if (idx === -1) return;
    if (!workshops[idx].joinedUsers) workshops[idx].joinedUsers = [];
    workshops[idx].joinedUsers.push({ email: session.email, name, studentId, faculty, joinedAt: new Date().toISOString() });
    saveWorkshops(workshops);
    var userJoined = getUserJoinedWorkshops(); userJoined.push(workshopId);
    saveUserJoinedWorkshops(session.email, userJoined);
    closeJoinModal();
    showToast("Welcome to " + workshops[idx].title + "!", "ok");
    if (currentPage === "workshops") renderWorkshops();
    if (currentPage === "home") renderHomeWorkshops();
}

function leaveWorkshop(workshopId) {
    var session = getSession(); if (!session) return;
    var workshops = getWorkshops();
    var idx = -1;
    for (var i = 0; i < workshops.length; i++) { if (workshops[i].id === workshopId) { idx = i; break; } }
    if (idx === -1) return;
    if (workshops[idx].joinedUsers) {
        workshops[idx].joinedUsers = workshops[idx].joinedUsers.filter(function(u) { return u.email !== session.email; });
    }
    saveWorkshops(workshops);
    var userJoined = getUserJoinedWorkshops().filter(function(id) { return id !== workshopId; });
    saveUserJoinedWorkshops(session.email, userJoined);
    showToast("You left the workshop", "ok");
    if (currentPage === "workshops") renderWorkshops();
    if (currentPage === "home") renderHomeWorkshops();
}

function renderWorkshops() {
    var container = document.getElementById("workshopsOutput"); if (!container) return;
    var workshops = getWorkshops();
    if (workshops.length === 0) { container.innerHTML = '<div class="empty-state"><span>🛠</span><p>No workshops scheduled yet. Check back soon.</p></div>'; return; }
    workshops.sort(function(a,b) { if (a.featured && !b.featured) return -1; if (!a.featured && b.featured) return 1; return new Date(a.date)-new Date(b.date); });
    var html = '<div class="workshops-grid">';
    for (var i = 0; i < workshops.length; i++) {
        var w = workshops[i]; var spotsLeft = getSpotsLeft(w); var isFull = spotsLeft===0;
        var userJoined = hasUserJoined(w.id); var percentFilled = Math.round(((w.maxSpots-spotsLeft)/w.maxSpots)*100);
        html += '<div class="content-card ' + (w.featured?'workshop-spotlight':'') + '" style="position:relative;">';
        if (w.featured) html += '<div class="workshop-featured-label">⭐ Featured</div>';
        if (w.image) { html += '<img src="'+w.image+'" alt="'+w.title+'" class="workshop-image" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';"/>'; html += '<div class="workshop-image-placeholder" style="display:none;"><span>🛠</span></div>'; }
        else html += '<div class="workshop-image-placeholder"><span>🛠</span></div>';
        html += '<div class="workshop-content">';
        html += '<div class="instructor-section"><div class="instructor-avatar">👤</div><div class="instructor-info"><span class="instructor-label">Instructor</span><span class="instructor-name">'+(w.instructor||"TBA")+'</span></div></div>';
        html += '<div class="content-card-date">'+(w.date?formatDate(w.date):"Date TBA")+'</div>';
        html += '<h3>'+w.title+'</h3><p>'+(w.description||"")+'</p>';
        html += '<div class="content-card-meta">';
        if (w.time) html += '<span>🕐 '+w.time+'</span>';
        if (w.location) html += '<span>📍 '+w.location+'</span>';
        html += '</div>';
        html += '<div class="spots-counter"><div class="spots-number" id="spots-'+w.id+'">'+spotsLeft+'</div><div class="spots-label"><strong>'+(isFull?'Workshop Full!':'Spots Remaining')+'</strong>out of '+w.maxSpots+' total spots<div class="spots-progress"><div class="spots-progress-fill" style="width:'+percentFilled+'%"></div></div></div></div>';
        if (userJoined) html += '<button class="join-btn joined" data-action="leave" data-id="'+w.id+'">✅ Joined — Click to Leave</button>';
        else if (isFull) html += '<button class="join-btn" disabled>❌ Workshop Full</button>';
        else html += '<button class="join-btn" data-action="join" data-id="'+w.id+'">🎭 Join Workshop</button>';
        html += '</div></div>';
    }
    html += '</div>';
    container.innerHTML = html;
    setTimeout(function() {
        for (var j=0; j<workshops.length; j++) {
            var el = document.getElementById('spots-'+workshops[j].id);
            if (el) { el.classList.add('animate'); setTimeout(function(e){return function(){e.classList.remove('animate');};}(el),400); }
        }
    }, 100);
}

function renderHomeWorkshops() {
    var container = document.getElementById("homeWorkshopsPreview"); if (!container) return;
    var workshops = getWorkshops();
    var featured = workshops.filter(function(w){return w.featured;});
    if (featured.length===0 && workshops.length>0) featured = [workshops[0]];
    if (featured.length===0) { container.innerHTML=''; return; }
    var html = '<div class="section"><div class="container"><span class="section-tag">Main Feature</span><h2 class="section-title">Upcoming <em>Workshops</em></h2><div class="workshops-grid">';
    for (var i=0; i<Math.min(featured.length,2); i++) {
        var w=featured[i]; var spotsLeft=getSpotsLeft(w); var isFull=spotsLeft===0; var userJoined=hasUserJoined(w.id);
        html += '<div class="content-card workshop-spotlight" style="position:relative;"><div class="workshop-featured-label">⭐ Featured</div>';
        if (w.image) { html+='<img src="'+w.image+'" alt="'+w.title+'" class="workshop-image" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';"/>'; html+='<div class="workshop-image-placeholder" style="display:none;"><span>🛠</span></div>'; }
        else html+='<div class="workshop-image-placeholder"><span>🛠</span></div>';
        html+='<div class="workshop-content"><div class="instructor-section"><div class="instructor-avatar">👤</div><div class="instructor-info"><span class="instructor-label">Instructor</span><span class="instructor-name">'+(w.instructor||"TBA")+'</span></div></div>';
        html+='<div class="content-card-date">'+(w.date?formatDate(w.date):"Date TBA")+'</div><h3>'+w.title+'</h3><p>'+(w.description||"")+'</p>';
        html+='<div class="spots-counter"><div class="spots-number">'+spotsLeft+'</div><div class="spots-label"><strong>'+(isFull?'Workshop Full!':'Spots Left')+'</strong>out of '+w.maxSpots+' spots</div></div>';
        if (userJoined) html+='<button class="join-btn joined" data-action="leave" data-id="'+w.id+'">✅ Joined</button>';
        else if (!isFull) html+='<button class="join-btn" data-action="join" data-id="'+w.id+'">🎭 Join Now</button>';
        else html+='<button class="join-btn" disabled>❌ Full</button>';
        html+='</div></div>';
    }
    html+='</div><div style="text-align:center;margin-top:30px;"><button class="btn-red" onclick="showPage(\'workshops\')">View All Workshops →</button></div></div></div>';
    container.innerHTML = html;
}

function renderRehearsals() {
    var container = document.getElementById("rehearsalsOutput"); if (!container) return;
    var videos = getData("rehearsals");
    if (videos.length===0) { container.innerHTML='<div class="empty-state"><span>🎥</span><p>No rehearsal videos added yet.</p></div>'; return; }
    var html = '<div class="content-grid">';
    for (var i=0; i<videos.length; i++) {
        html+='<div class="content-card"><h3>'+videos[i].title+'</h3><div class="content-card-date">📅 '+videos[i].date+'</div><a href="'+videos[i].link+'" target="_blank" class="watch-btn">▶ Watch Recording</a></div>';
    }
    html+='</div>'; container.innerHTML=html;
}

// =============================================
//   ADMIN
// =============================================

function initAdminPage() {
    var session = getSession(); if (!session || session.role!=="admin") return;
    var badge = document.getElementById("adminEmailBadge"); if (badge) badge.textContent = session.email;
    var social = getSocialLinks();
    var ig = document.getElementById("socialIG"); if (ig) ig.value = social.ig||"";
    var tt = document.getElementById("socialTT"); if (tt) tt.value = social.tt||"";
    loadDeadlineInputs(); updateAdminBadges(); renderDashboard();
}

var adminPanelTitles = {
    dashboard:"Dashboard", auditions:"Audition Applications", scripts:"Script Submissions",
    exit:"Exit Interview Requests", workshops:"Workshops", rehearsals:"Rehearsal Videos",
    social:"Social Links", messages:"Contact Messages", users:"Registered Users", deadlines:"Application Deadlines"
};

function adminGoTo(panelName, button) {
    document.querySelectorAll(".admin-panel").forEach(function(p){p.classList.remove("active");});
    document.querySelectorAll(".sidebar-btn").forEach(function(b){b.classList.remove("active");});
    var panel = document.getElementById("adminPanel-"+panelName); if (panel) panel.classList.add("active");
    if (button) button.classList.add("active");
    var titleEl = document.getElementById("adminPanelTitle"); if (titleEl) titleEl.textContent = adminPanelTitles[panelName]||panelName;
    renderAdminPanel(panelName);
}

function renderAdminPanel(panelName) {
    if (panelName==="dashboard")  { renderDashboard(); }
    if (panelName==="auditions")  { renderAdminTable("auditions","tableAud","countAud",["Name","Email","Faculty","Date","Status","Actions"]); }
    if (panelName==="exit")       { renderAdminTable("exit_interviews","tableExit","countExit",["Name","Email","Reason","Date","Status","Actions"]); }
    if (panelName==="scripts")    { renderAdminScripts(); }
    if (panelName==="workshops")  { renderAdminWorkshops(); }
    if (panelName==="rehearsals") { renderAdminRehearsals(); }
    if (panelName==="messages")   { renderAdminMessages(); }
    if (panelName==="users")      { renderAdminUsers(); }
    if (panelName==="deadlines")  { renderAdminDeadlines(); }
}

function updateAdminBadges() {
    var audBadge  = document.getElementById("badgeAud");
    var scrBadge  = document.getElementById("badgeScr");
    var exitBadge = document.getElementById("badgeExit");
    var msgBadge  = document.getElementById("badgeMsg");
    if (audBadge)  audBadge.textContent  = getData("auditions").filter(function(x){return x.status==="pending";}).length;
    if (scrBadge)  scrBadge.textContent  = getData("scripts").filter(function(x){return x.status==="pending";}).length;
    if (exitBadge) exitBadge.textContent = getData("exit_interviews").filter(function(x){return x.status==="pending";}).length;
    if (msgBadge)  msgBadge.textContent  = getData("contact_messages").length;
}

function renderDashboard() {
    var workshops = getWorkshops();
    var totalJoined = 0;
    for (var i=0; i<workshops.length; i++) totalJoined += workshops[i].joinedUsers ? workshops[i].joinedUsers.length : 0;
    var container = document.getElementById("dashboardStats"); if (!container) return;
    container.innerHTML =
        '<div class="stat-card red"><div class="stat-label">Pending Auditions</div><div class="stat-number">'+getData("auditions").filter(function(x){return x.status==="pending";}).length+'</div></div>' +
        '<div class="stat-card red"><div class="stat-label">Pending Scripts</div><div class="stat-number">'+getData("scripts").filter(function(x){return x.status==="pending";}).length+'</div></div>' +
        '<div class="stat-card red"><div class="stat-label">Exit Requests</div><div class="stat-number">'+getData("exit_interviews").filter(function(x){return x.status==="pending";}).length+'</div></div>' +
        '<div class="stat-card"><div class="stat-label">Contact Messages</div><div class="stat-number">'+getData("contact_messages").length+'</div></div>' +
        '<div class="stat-card"><div class="stat-label">Workshops</div><div class="stat-number">'+workshops.length+'</div></div>' +
        '<div class="stat-card"><div class="stat-label">Total Joined</div><div class="stat-number">'+totalJoined+'</div></div>' +
        '<div class="stat-card"><div class="stat-label">Registered Users</div><div class="stat-number">'+getData("miu_users").length+'</div></div>';
}

function renderAdminTable(key, containerId, countId, headers) {
    var data = getData(key);
    document.getElementById(countId).textContent = data.filter(function(x){return x.status==="pending";}).length + " pending";
    var container = document.getElementById(containerId); if (!container) return;
    if (data.length===0) { container.innerHTML='<div class="admin-empty"><span>📋</span><p>No submissions yet.</p></div>'; return; }
    var html = '<table><thead><tr>'+headers.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr></thead><tbody>';
    for (var i=0; i<data.length; i++) {
        var item=data[i]; var statusBadge='<span class="status-badge '+item.status+'">'+item.status+'</span>';
        var actions = item.status==="pending"
            ? '<div class="action-buttons"><button class="btn-approve" onclick="adminAction(\''+key+'\','+i+',\'approved\')">Approve</button><button class="btn-reject" onclick="adminAction(\''+key+'\','+i+',\'rejected\')">Reject</button></div>'
            : '<button class="btn-delete" onclick="adminDelete(\''+key+'\','+i+')">Delete</button>';
        html += '<tr>';
        if (key==="auditions") html+='<td>'+item.name+'</td><td>'+item.email+'</td><td>'+(item.faculty||"-")+'</td><td>'+(item.date||"-")+'</td><td>'+statusBadge+'</td><td>'+actions+'</td>';
        if (key==="exit_interviews") html+='<td>'+item.name+'</td><td>'+item.email+'</td><td>'+(item.reason||"-")+'</td><td>'+(item.date||"-")+'</td><td>'+statusBadge+'</td><td>'+actions+'</td>';
        html += '</tr>';
    }
    html += '</tbody></table>'; container.innerHTML = html;
}

function renderAdminScripts() {
    var data = getData("scripts");
    document.getElementById("countScr").textContent = data.filter(function(x){return x.status==="pending";}).length + " pending";
    var container = document.getElementById("tableScr"); if (!container) return;
    if (data.length===0) { container.innerHTML='<div class="admin-empty"><span>📜</span><p>No scripts yet.</p></div>'; return; }
    var html = '<table><thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>Language</th><th>Link</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    for (var i=0; i<data.length; i++) {
        var item=data[i]; var statusBadge='<span class="status-badge '+item.status+'">'+item.status+'</span>';
        var linkHtml=item.link?'<a href="'+item.link+'" target="_blank" style="color:var(--red);font-size:12px;">View ↗</a>':'-';
        var actions=item.status==="pending"
            ?'<div class="action-buttons"><button class="btn-approve" onclick="adminAction(\'scripts\','+i+',\'approved\')">Approve → OOA</button><button class="btn-reject" onclick="adminAction(\'scripts\','+i+',\'rejected\')">Reject</button></div>'
            :'<button class="btn-delete" onclick="adminDelete(\'scripts\','+i+')">Delete</button>';
        html+='<tr><td><strong>'+item.title+'</strong></td><td>'+item.name+'</td><td>'+(item.genre||"-")+'</td><td>'+(item.language||"-")+'</td><td>'+linkHtml+'</td><td>'+statusBadge+'</td><td>'+actions+'</td></tr>';
    }
    html += '</tbody></table>'; container.innerHTML = html;
}

function adminAction(key, index, status) {
    var data = getData(key); data[index].status = status; saveData(key, data);
    showToast(status==="approved"?"Approved!":"Rejected", status==="approved"?"ok":"er");
    renderAdminPanel(document.querySelector('.admin-panel.active').id.replace('adminPanel-',''));
    updateAdminBadges(); renderDashboard();
}

function adminDelete(key, index) {
    if (key==="workshops") { var ws=getWorkshops(); ws.splice(index,1); saveWorkshops(ws); renderAdminWorkshops(); renderDashboard(); showToast("Deleted","er"); return; }
    var data=getData(key); data.splice(index,1); saveData(key,data);
    if (key==="auditions") renderAdminTable("auditions","tableAud","countAud",["Name","Email","Faculty","Date","Status","Actions"]);
    if (key==="exit_interviews") renderAdminTable("exit_interviews","tableExit","countExit",["Name","Email","Reason","Date","Status","Actions"]);
    if (key==="scripts") renderAdminScripts();
    if (key==="rehearsals") renderAdminRehearsals();
    updateAdminBadges(); showToast("Deleted","er");
}

// ── Admin Workshop Management ────────────────────────────────

var editingWorkshopId = null;

function addWorkshop() {
    var title    = document.getElementById("wsTitle").value.trim();
    var date     = document.getElementById("wsDate").value;
    var time     = document.getElementById("wsTime").value.trim();
    var location = document.getElementById("wsLocation").value.trim();
    var desc     = document.getElementById("wsDesc").value.trim();
    var instructor = document.getElementById("wsInstructor").value.trim();
    var image    = document.getElementById("wsImage").value.trim();
    var maxSpots = parseInt(document.getElementById("wsMaxSpots").value)||20;
    var featured = document.getElementById("wsFeatured").checked;
    if (!title || !date) { showToast("Title and date are required","er"); return; }
    var today = new Date(); today.setHours(0,0,0,0);
    if (new Date(date) < today) { showToast("Please select a future date","er"); return; }
    var workshops = getWorkshops();
    workshops.push({ id: Date.now().toString(36)+Math.random().toString(36).substr(2,5), title, date, time, location, description: desc, instructor: instructor||"TBA", image: image||"", maxSpots, joinedUsers: [], featured });
    saveWorkshops(workshops);
    ["wsTitle","wsDate","wsTime","wsLocation","wsDesc","wsInstructor","wsImage"].forEach(function(id){document.getElementById(id).value="";});
    document.getElementById("wsMaxSpots").value="20"; document.getElementById("wsFeatured").checked=false;
    renderAdminWorkshops(); renderDashboard(); showToast("Workshop added!","ok");
}

function editWorkshop(id) {
    var workshops = getWorkshops(); var workshop = null;
    for (var i=0; i<workshops.length; i++) { if (workshops[i].id===id) { workshop=workshops[i]; break; } }
    if (!workshop) return;
    editingWorkshopId = id;
    document.getElementById("editWsTitle").value     = workshop.title;
    document.getElementById("editWsDate").value      = workshop.date;
    document.getElementById("editWsTime").value      = workshop.time||"";
    document.getElementById("editWsLocation").value  = workshop.location||"";
    document.getElementById("editWsDesc").value      = workshop.description||"";
    document.getElementById("editWsInstructor").value= workshop.instructor||"";
    document.getElementById("editWsImage").value     = workshop.image||"";
    document.getElementById("editWsMaxSpots").value  = workshop.maxSpots||20;
    document.getElementById("editWsFeatured").checked= workshop.featured||false;
    document.getElementById("addWorkshopForm").style.display  = "none";
    document.getElementById("editWorkshopForm").style.display = "block";
    showToast("Editing: "+workshop.title,"ok");
}

function saveEditWorkshop() {
    if (!editingWorkshopId) return;
    var workshops = getWorkshops(); var index = -1;
    for (var i=0; i<workshops.length; i++) { if (workshops[i].id===editingWorkshopId) { index=i; break; } }
    if (index===-1) return;
    var title = document.getElementById("editWsTitle").value.trim();
    var date  = document.getElementById("editWsDate").value;
    if (!title || !date) { showToast("Title and date are required","er"); return; }
    workshops[index].title       = title;
    workshops[index].date        = date;
    workshops[index].time        = document.getElementById("editWsTime").value.trim();
    workshops[index].location    = document.getElementById("editWsLocation").value.trim();
    workshops[index].description = document.getElementById("editWsDesc").value.trim();
    workshops[index].instructor  = document.getElementById("editWsInstructor").value.trim()||"TBA";
    workshops[index].image       = document.getElementById("editWsImage").value.trim();
    workshops[index].maxSpots    = parseInt(document.getElementById("editWsMaxSpots").value)||20;
    workshops[index].featured    = document.getElementById("editWsFeatured").checked;
    saveWorkshops(workshops);
    editingWorkshopId = null;
    document.getElementById("addWorkshopForm").style.display  = "block";
    document.getElementById("editWorkshopForm").style.display = "none";
    renderAdminWorkshops(); renderDashboard(); showToast("Workshop updated!","ok");
}

function cancelEditWorkshop() {
    editingWorkshopId = null;
    document.getElementById("addWorkshopForm").style.display  = "block";
    document.getElementById("editWorkshopForm").style.display = "none";
}

function renderAdminWorkshops() {
    var data = getWorkshops(); var container = document.getElementById("tableWs"); if (!container) return;
    if (data.length===0) { container.innerHTML='<div class="admin-empty"><span>🛠</span><p>No workshops yet.</p></div>'; return; }
    var html = '<table><thead><tr><th>Title</th><th>Instructor</th><th>Date</th><th>Spots</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    for (var i=0; i<data.length; i++) {
        var w=data[i]; var spotsLeft=getSpotsLeft(w);
        var statusBadge = w.featured ? '<span class="status-badge approved">⭐ Featured</span>' : '<span class="status-badge pending">Standard</span>';
        html+='<tr><td><strong>'+w.title+'</strong></td><td>'+(w.instructor||"-")+'</td><td>'+(w.date?formatDate(w.date):"-")+'</td><td>'+spotsLeft+'/'+w.maxSpots+'</td><td>'+statusBadge+'</td>';
        html+='<td><div class="action-buttons"><button class="btn-approve" data-action="edit" data-id="'+w.id+'">✏️ Edit</button><button class="btn-delete" data-action="delete" data-id="'+w.id+'">🗑 Delete</button></div></td></tr>';
    }
    html += '</tbody></table>'; container.innerHTML = html;
}

function adminDeleteWorkshop(id) {
    var workshops = getWorkshops().filter(function(w){return w.id!==id;});
    saveWorkshops(workshops); renderAdminWorkshops(); renderDashboard(); showToast("Workshop deleted","er");
}

function renderAdminRehearsals() {
    var data = getData("rehearsals"); var container = document.getElementById("tableReh"); if (!container) return;
    if (data.length===0) { container.innerHTML='<div class="admin-empty"><span>🎥</span><p>No videos yet.</p></div>'; return; }
    var html = '<table><thead><tr><th>Title</th><th>Date</th><th>Link</th><th>Actions</th></tr></thead><tbody>';
    for (var i=0; i<data.length; i++) {
        html+='<tr><td><strong>'+data[i].title+'</strong></td><td>'+(data[i].date||"-")+'</td><td><a href="'+data[i].link+'" target="_blank" style="color:var(--red);font-size:12px;">Open ↗</a></td><td><button class="btn-delete" onclick="adminDelete(\'rehearsals\','+i+')">Delete</button></td></tr>';
    }
    html += '</tbody></table>'; container.innerHTML = html;
}

function renderAdminMessages() {
    var data = getData("contact_messages"); var container = document.getElementById("tableMsg"); if (!container) return;
    document.getElementById("countMsg").textContent = data.length + " messages";
    if (data.length===0) { container.innerHTML='<div class="admin-empty"><span>✉️</span><p>No contact messages yet.</p></div>'; return; }
    var html = '<table><thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
    for (var i=0; i<data.length; i++) {
        var item=data[i];
        html+='<tr><td>'+(item.firstName+" "+(item.lastName||""))+'</td><td>'+item.email+'</td><td>'+(item.subject||"-")+'</td><td style="max-width:220px;font-size:11.5px;">'+item.message+'</td><td>'+(item.date||"-")+'</td><td><button class="btn-delete" onclick="deleteMessage('+i+')">Delete</button></td></tr>';
    }
    html += '</tbody></table>'; container.innerHTML = html;
}

function deleteMessage(index) {
    var data = getData("contact_messages"); data.splice(index,1); saveData("contact_messages",data);
    renderAdminMessages(); updateAdminBadges(); renderDashboard(); showToast("Message deleted","er");
}

function loadDeadlineInputs() {
    var deadlines = getData("deadlines");
    var audDate = document.getElementById("deadlineAudDate");
    var scrDate = document.getElementById("deadlineScrDate");
    for (var i=0; i<deadlines.length; i++) {
        if (deadlines[i].type==="auditions" && audDate) audDate.value = deadlines[i].date;
        if (deadlines[i].type==="scripts"   && scrDate) scrDate.value = deadlines[i].date;
    }
}

function saveDeadline(type) {
    var dateInput = document.getElementById(type==="auditions"?"deadlineAudDate":"deadlineScrDate");
    var title     = type==="auditions"?"Audition Applications":"Script Submissions";
    if (!dateInput || !dateInput.value) { showToast("Please select a date","er"); return; }
    var deadlines = getData("deadlines"); var found=false;
    for (var i=0; i<deadlines.length; i++) { if (deadlines[i].type===type) { deadlines[i].date=dateInput.value; deadlines[i].title=title; found=true; break; } }
    if (!found) deadlines.push({ type, title, date: dateInput.value });
    saveData("deadlines",deadlines); renderAdminDeadlines(); renderDashboard(); showToast("Deadline saved!","ok");
}

function clearDeadline(type) {
    var deadlines = getData("deadlines").filter(function(d){return d.type!==type;});
    saveData("deadlines",deadlines);
    var dateInput = document.getElementById(type==="auditions"?"deadlineAudDate":"deadlineScrDate");
    if (dateInput) dateInput.value = "";
    renderAdminDeadlines(); renderDashboard(); showToast("Deadline removed","er");
}

function renderAdminDeadlines() {
    var container = document.getElementById("tableDeadlines"); if (!container) return;
    var appDeadlines = getData("deadlines").filter(function(d){return d.type==="auditions"||d.type==="scripts";});
    if (appDeadlines.length===0) { container.innerHTML='<div class="admin-empty"><span>⏰</span><p>No application deadlines set yet.</p></div>'; return; }
    var html = '<table><thead><tr><th>Type</th><th>Deadline Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    for (var j=0; j<appDeadlines.length; j++) {
        var d=appDeadlines[j]; var isExpired=isDeadlinePassed(d.date); var daysLeft=getDaysLeft(d.date);
        var statusBadge = isExpired ? '<span class="status-badge rejected">Expired</span>' : '<span class="status-badge approved">Active ('+daysLeft+' days left)</span>';
        html+='<tr><td><strong>'+(d.type==="auditions"?"🎭 Auditions":"📜 Script Upload")+'</strong></td><td>'+formatDate(d.date)+'</td><td>'+statusBadge+'</td><td><button class="btn-delete" onclick="clearDeadline(\''+d.type+'\')">Remove</button></td></tr>';
    }
    html += '</tbody></table>'; container.innerHTML = html;
}

function renderAdminUsers() {
    var users = getData("miu_users"); var container = document.getElementById("tableUsers"); if (!container) return;
    document.getElementById("countUsers").textContent = users.length + " users";
    if (users.length===0) { container.innerHTML='<div class="admin-empty"><span>👥</span><p>No registered users yet.</p></div>'; return; }
    var html = '<table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    for (var i=0; i<users.length; i++) {
        var user=users[i];
        var statusBadge = user.blocked ? '<span class="status-badge rejected">Blocked</span>' : '<span class="status-badge approved">Active</span>';
        var actions = user.blocked
            ? '<button class="btn-approve" onclick="toggleUserBlock('+i+')">Unblock</button>'
            : '<button class="btn-reject" onclick="toggleUserBlock('+i+')">Block</button>';
        actions += ' <button class="btn-approve" onclick="promoteToAdmin('+i+')">Make Admin</button>';
        html+='<tr><td>'+user.name+'</td><td>'+user.email+'</td><td>'+statusBadge+'</td><td><div class="action-buttons">'+actions+'</div></td></tr>';
    }
    html += '</tbody></table>'; container.innerHTML = html;
}

function toggleUserBlock(index) {
    var users=getData("miu_users"); users[index].blocked=!users[index].blocked; saveData("miu_users",users);
    renderAdminUsers(); renderDashboard(); showToast("User status updated","ok");
}
function promoteToAdmin(index) {
    var users=getData("miu_users"); users[index].role="admin"; saveData("miu_users",users);
    renderAdminUsers(); renderDashboard(); showToast("User promoted to admin!","ok");
}

function addRehearsal() {
    var title = document.getElementById("rehTitle").value.trim();
    var date  = document.getElementById("rehDate").value;
    var link  = document.getElementById("rehLink").value.trim();
    if (!title || !link) { showToast("Title and link are required","er"); return; }
    if (!isValidURL(link)) { showToast("Please enter a valid URL","er"); return; }
    var videos = getData("rehearsals");
    videos.push({ title, date: date||new Date().toLocaleDateString(), link });
    saveData("rehearsals",videos);
    document.getElementById("rehTitle").value=""; document.getElementById("rehDate").value=""; document.getElementById("rehLink").value="";
    renderAdminRehearsals(); renderDashboard(); showToast("Video link added!","ok");
}

function renderHomeDeadlines() {
    var container = document.getElementById("homeDeadlines"); if (!container) return;
    var appDeadlines = getData("deadlines").filter(function(d){return (d.type==="auditions"||d.type==="scripts")&&!isDeadlinePassed(d.date);});
    if (appDeadlines.length===0) { container.innerHTML=""; return; }
    var html = '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;">';
    for (var i=0; i<appDeadlines.length; i++) {
        var d=appDeadlines[i]; var daysLeft=getDaysLeft(d.date); var label=d.type==="auditions"?"🎤 Auditions":"📜 Scripts";
        html+='<div class="deadline-banner active" style="flex:1;min-width:200px;cursor:pointer;" onclick="showPage(\''+d.type+'\')"><div class="deadline-icon">⏰</div><div class="deadline-info"><h4>'+label+'</h4><p>'+formatDate(d.date);
        html += daysLeft===0?' <span class="deadline-status urgent">(Today!)</span>':' <span class="deadline-status">('+daysLeft+' days left)</span>';
        html += '</p></div></div>';
    }
    html += '</div>'; container.innerHTML = html;
}

// ── Storage helpers ───────────────────────────────────────────

function getData(key) { var d=localStorage.getItem("miu_"+key); return d===null?[]:JSON.parse(d); }
function saveData(key,data) { localStorage.setItem("miu_"+key,JSON.stringify(data)); }
function getSession() { var d=localStorage.getItem("miu_session"); return d===null?null:JSON.parse(d); }
function saveSession(s) { localStorage.setItem("miu_session",JSON.stringify(s)); }
function clearSession() { localStorage.removeItem("miu_session"); }

// ── Event Delegation ─────────────────────────────────────────

document.addEventListener("click", function(e) {
    var btn = e.target.closest("[data-action]"); if (!btn) return;
    var action = btn.getAttribute("data-action"); var id = btn.getAttribute("data-id");
    if      (action==="join")   { e.preventDefault(); openJoinForm(id); }
    else if (action==="leave")  { e.preventDefault(); leaveWorkshop(id); }
    else if (action==="edit")   { e.preventDefault(); editWorkshop(id); }
    else if (action==="delete") { e.preventDefault(); if (confirm("Delete this workshop?")) adminDeleteWorkshop(id); }
});

// ── Init ─────────────────────────────────────────────────────

if (getData("miu_users").length===0) {
    saveData("miu_users",[{name:"Theatre Admin",email:"theatreadmin@miuegypt.edu.eg",password:"MIUTheatre2025!",role:"admin",blocked:false}]);
}
if (getData("social_links").length===0) {
    saveData("social_links",[{ig:"https://www.instagram.com/miutheatre",tt:"https://www.tiktok.com/@miu.theatre"}]);
}

updateNav(); loadSocialLinks(); updateAdminBadges(); renderHomeDeadlines(); renderHomeWorkshops(); showPage("home");