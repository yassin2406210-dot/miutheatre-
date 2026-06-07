// â”€â”€ Single Page App Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(function(p) {
        p.classList.remove('active');
    });
    var page = document.getElementById('page-' + pageName);
    if (page) page.classList.add('active');
    window.scrollTo(0, 0);
    closeMobileMenu();

    // Run page-specific logic
    if (pageName === 'workshops')  renderWorkshops();
    if (pageName === 'rehearsals') {
        var session = getSession();
        if (!session) { showPage('login'); return; }
        renderRehearsals();
    }
    if (pageName === 'auditions') {
        var session = getSession();
        if (!session) { localStorage.setItem("miu_redirect", "auditions"); showPage('login'); return; }
        loadDeadlinesFromAPI(function() { renderAuditionDeadline(); });
    }
    if (pageName === 'scripts')    loadDeadlinesFromAPI(function() { renderScriptDeadline(); });
    if (pageName === 'admin') {
        var session = getSession();
        if (!session || session.role !== 'admin') { showPage('login'); return; }
        initAdminPage();
    }
    if (pageName === 'contact') {
        var session = getSession();
        var ctEmail = document.getElementById('ctEmail');
        if (ctEmail && session) { ctEmail.value = session.email; ctEmail.readOnly = true; }
    }
    if (pageName === 'login') {
        var session = getSession();
        if (session) { showPage(session.role === 'admin' ? 'admin' : 'home'); return; }
    }
}
// â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function navigate(path) {
    window.location.href = path;
}
 
function toggleMobileMenu() {
    var menu = document.getElementById("mobileMenu");
    if (menu) menu.classList.toggle("open");
}
function closeMobileMenu() {
    var menu = document.getElementById("mobileMenu");
    if (menu) menu.classList.remove("open");
}
 
// â”€â”€ Navbar scroll effect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.addEventListener("scroll", function() {
    var navbar = document.getElementById("navbar");
    if (!navbar) return;
    if (window.scrollY > 20) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
});
 
// â”€â”€ Session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getSession() {
    var d = localStorage.getItem("miu_session");
    return d === null ? null : JSON.parse(d);
}
function saveSession(s) { localStorage.setItem("miu_session", JSON.stringify(s)); }
function clearSession() { localStorage.removeItem("miu_session"); }
 
// â”€â”€ Auth Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function authHeader() {
    var session = getSession();
    if (!session || !session.token) return {};
    return { "Authorization": "Bearer " + session.token };
}
 function fillSignedInUser(nameId, emailId) {
    var session = getSession();
    if (!session) return;

    var nameInput = document.getElementById(nameId);
    var emailInput = document.getElementById(emailId);

    if (nameInput) nameInput.value = session.name || "";
    if (emailInput) {
        emailInput.value = session.email || "";
        emailInput.readOnly = true;
    }
}
function updateNav() {
    var session     = getSession();
    var loginBtn    = document.getElementById("loginBtn");
    var logoutBtn   = document.getElementById("logoutBtn");
    var mobileLoginBtn  = document.getElementById("mobileLoginBtn");
    var mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
    var navLinks    = document.getElementById("navLinks");

    if (session !== null) {
        document.body.classList.add("logged-in");
    } else {
        document.body.classList.remove("logged-in");
    }

    if (!loginBtn || !logoutBtn) return;

    if (session !== null) {
        loginBtn.style.display  = "none";
        logoutBtn.style.display = "";
        if (mobileLoginBtn)  mobileLoginBtn.style.display  = "none";
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = "";

        if (session.role === "admin") {
            logoutBtn.textContent = "⚙️ " + session.name + " — Sign Out";
            if (mobileLogoutBtn) mobileLogoutBtn.textContent = "⚙️ " + session.name + " — Sign Out";
            if (navLinks) {
                var allNavBtns = navLinks.querySelectorAll("button:not(#loginBtn):not(#logoutBtn), .dropdown");
                for (var i = 0; i < allNavBtns.length; i++) allNavBtns[i].style.display = "none";
                if (!document.getElementById("adminPanelBtn")) {
                    var adminBtn = document.createElement("button");
                    adminBtn.id = "adminPanelBtn";
                    adminBtn.textContent = "⚙️ Admin Panel";
                    adminBtn.onclick = function() { navigate("/admin"); };
                    navLinks.insertBefore(adminBtn, logoutBtn);
                }
            }
        } else {
            logoutBtn.textContent = "👤 " + session.name + " — Sign Out";
            if (mobileLogoutBtn) mobileLogoutBtn.textContent = "👤 " + session.name + " — Sign Out";
        }
    } else {
        loginBtn.style.display  = "";
        logoutBtn.style.display = "none";
        if (mobileLoginBtn)  mobileLoginBtn.style.display  = "";
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = "none";
        if (navLinks) {
            var allNavBtns2 = navLinks.querySelectorAll("button, .dropdown");
            for (var k = 0; k < allNavBtns2.length; k++) allNavBtns2[k].style.display = "";
        }
        var adminBtn2 = document.getElementById("adminPanelBtn");
        if (adminBtn2) adminBtn2.parentNode.removeChild(adminBtn2);
    }
}

 
// â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showToast(message, type) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = "show";
    if (type === "ok") toast.classList.add("ok");
    else if (type === "er") toast.classList.add("er");
    setTimeout(function() { toast.className = ""; }, 3200);
}
 
// â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function isValidMIUEmail(email) {
    return /^[^ ]+@miuegypt\.edu\.eg$/.test(email.trim().toLowerCase());
}
function isValidURL(url) {
    return /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url.trim());
}
 
// â”€â”€ Alerts & Errors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showAlert(alertId, message, type) {
    var alertBox = document.getElementById(alertId);
    if (!alertBox) return;
    alertBox.style.display = "";
    alertBox.className = "alert " + type;
    alertBox.innerHTML = message;
} 
function hideAlert(alertId) {
    var a = document.getElementById(alertId);
    if (a) { a.style.display = "none"; a.className = "alert"; }
}
function showErrorMsg(id) { var el = document.getElementById(id); if (el) el.style.display = "block"; }
function hideErrorMsg(id) { var el = document.getElementById(id); if (el) el.style.display = "none"; }
function markError(id)    { var el = document.getElementById(id); if (el) el.style.borderColor = "#e24b4a"; }
function clearError(id)   { var el = document.getElementById(id); if (el) el.style.borderColor = ""; }

// â”€â”€ Password Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function togglePassword(inputId, buttonId) {
    var input  = document.getElementById(inputId);
    var button = document.getElementById(buttonId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        if (button) button.textContent = "Hide";
    } else {
        input.type = "password";
        if (button) button.textContent = "Show";
    }
}
 
// â”€â”€ Login Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function switchLoginTab(tab) {
    var formSignIn = document.getElementById("formSignIn");
    var formSignUp = document.getElementById("formSignUp");
    var tabSignIn  = document.getElementById("tabSignIn");
    var tabSignUp  = document.getElementById("tabSignUp");
    if (!formSignIn || !formSignUp) return;
    if (tab === "signin") {
        formSignIn.style.display = ""; formSignUp.style.display = "none";
        if (tabSignIn) tabSignIn.classList.add("active");
        if (tabSignUp) tabSignUp.classList.remove("active");
    } else {
        formSignIn.style.display = "none"; formSignUp.style.display = "";
        if (tabSignIn) tabSignIn.classList.remove("active");
        if (tabSignUp) tabSignUp.classList.add("active");
    }
    hideAlert("signinAlert"); hideAlert("signupAlert");
}
 
// â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function doLogin() {
    var email    = document.getElementById("signinEmail").value.trim().toLowerCase();
    var password = document.getElementById("signinPw").value;
    hideAlert("signinAlert");
    hideErrorMsg("signinEmailError"); hideErrorMsg("signinPwError");
    clearError("signinEmail"); clearError("signinPw");
    var valid = true;
    if (!email || !isValidMIUEmail(email)) { showErrorMsg("signinEmailError"); markError("signinEmail"); valid = false; }
    if (password.length < 6)              { showErrorMsg("signinPwError");    markError("signinPw");    valid = false; }
    if (!valid) return;
 
    fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { showAlert("signinAlert", data.error, "error"); return; }
        saveSession({ token: data.token, name: data.name, email: data.email, role: data.role });
        updateNav();
        if (data.role === "admin") { navigate("/admin"); }
        else {
            var redirect = localStorage.getItem("miu_redirect");
            localStorage.removeItem("miu_redirect");
            navigate(redirect ? "/" + redirect : "/");
        }
    })
    .catch(function() { showAlert("signinAlert", "Something went wrong. Try again.", "error"); });
}
 
function doSignup() {
    var name      = document.getElementById("signupName").value.trim();
    var email     = document.getElementById("signupEmail").value.trim().toLowerCase();
    var password  = document.getElementById("signupPw").value;
    var password2 = document.getElementById("signupPw2").value;
    hideAlert("signupAlert");
    hideErrorMsg("signupNameError"); hideErrorMsg("signupEmailError");
    hideErrorMsg("signupPwError");   hideErrorMsg("signupPw2Error");
    clearError("signupName"); clearError("signupEmail"); clearError("signupPw"); clearError("signupPw2");
    var valid = true;
    if (!name)                             { showErrorMsg("signupNameError");  markError("signupName");  valid = false; }
    if (!email || !isValidMIUEmail(email)) { showErrorMsg("signupEmailError"); markError("signupEmail"); valid = false; }
    if (password.length < 6)              { showErrorMsg("signupPwError");    markError("signupPw");    valid = false; }
    if (password !== password2)           { showErrorMsg("signupPw2Error");   markError("signupPw2");   valid = false; }
    if (!valid) return;

    fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email, password: password })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { showAlert("signupAlert", data.error, "error"); return; }
        saveSession({ token: data.token, name: data.name, email: data.email, role: data.role });
        updateNav();
        var redirect = localStorage.getItem("miu_redirect");
        localStorage.removeItem("miu_redirect");
        navigate(redirect ? "/" + redirect : "/");
    })
    .catch(function() { showAlert("signupAlert", "Something went wrong. Try again.", "error"); });
}
 
function doLogout() {
    clearSession();
    window.location.href = '/';
}
 
// ── Contact ───────────────────────────────────────────────────
function submitContact() {
    var firstName = document.getElementById("ctFirstName").value.trim();
    var lastName  = document.getElementById("ctLastName").value.trim();
    var email     = document.getElementById("ctEmail").value.trim();
    var subject   = document.getElementById("ctSubject").value;
    var message   = document.getElementById("ctMessage").value.trim();
    hideAlert("contactAlert");
    if (!firstName || !lastName || !email || !subject || !message) {
        showAlert("contactAlert", "Please fill in ALL fields to send your message.", "error"); return;
    }
    var session = getSession();
    if (!session && !isValidMIUEmail(email)) {
        showAlert("contactAlert", "Please use your MIU email (@miuegypt.edu.eg).", "error"); return;
    }
 
    fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName, lastName: lastName, email: email, subject: subject, message: message })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { showAlert("contactAlert", data.error, "error"); return; }
        showAlert("contactAlert", "Your message has been sent! We will get back to you within 1–2 business days.", "success");
        document.getElementById("ctFirstName").value = "";
        document.getElementById("ctLastName").value  = "";
        document.getElementById("ctSubject").value   = "";
        document.getElementById("ctMessage").value   = "";
        if (!session) document.getElementById("ctEmail").value = "";
    })
    .catch(function() { showAlert("contactAlert", "Something went wrong. Try again.", "error"); });
}
 
// ── Social Links ──────────────────────────────────────────────
function getSocialLinks() {
    var links = getData("social_links");
    return links.length === 0 ? { ig: "#", tt: "#" } : links[0];
}
function loadSocialLinks() {
    var social = getSocialLinks();
    var ig = document.getElementById("igLink"); 
    if (ig && social.ig && social.ig !== "#") ig.href = social.ig;
    var tt = document.getElementById("ttLink"); 
    if (tt && social.tt && social.tt !== "#") tt.href = social.tt;
}
function saveSocialLinks() {
    var ig = document.getElementById("socialIG").value.trim();
    var tt = document.getElementById("socialTT").value.trim();
    if (ig && !isValidURL(ig)) { showToast("Please enter a valid Instagram URL", "er"); return; }
    if (tt && !isValidURL(tt)) { showToast("Please enter a valid TikTok URL", "er"); return; }
    saveData("social_links", [{ ig: ig, tt: tt }]);
    loadSocialLinks();
    showToast("Social links saved!", "ok");
}
 
// ── Deadlines ─────────────────────────────────────────────────
var _deadlinesCache = null;
 
function loadDeadlinesFromAPI(callback) {
    fetch("/api/deadlines")
    .then(function(r) { return r.json(); })
    .then(function(data) { _deadlinesCache = data; if (callback) callback(data); })
    .catch(function() { _deadlinesCache = []; if (callback) callback([]); });
}
 
function getDeadline(type) {
    if (!_deadlinesCache) return null;
    for (var i = 0; i < _deadlinesCache.length; i++) {
        if (_deadlinesCache[i].type === type) return _deadlinesCache[i];
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
        container.style.display = "none"; form.style.display = "none";
        closedMsg.style.display = "none"; notOpenMsg.style.display = "block"; return;
    }
    if (isDeadlinePassed(deadline.date)) {
        container.style.display = "none"; form.style.display = "none";
        closedMsg.style.display = "block"; notOpenMsg.style.display = "none"; return;
    }
    var daysLeft = getDaysLeft(deadline.date);
    container.innerHTML = '<div class="deadline-banner active"><div class="deadline-icon">⏰</div><div class="deadline-info"><h4>Application Deadline</h4><p>' + formatDate(deadline.date) +
        (daysLeft === 0 ? ' <span class="deadline-status urgent">(Today!)</span>' : ' <span class="deadline-status">(' + daysLeft + ' days left)</span>') + '</p></div></div>';
    container.style.display = "block"; form.style.display = "block";
    closedMsg.style.display = "none"; notOpenMsg.style.display = "none";
    var session = getSession();
    if (!session) { localStorage.setItem("miu_redirect", "auditions"); navigate("/login"); return; }
    var audName = document.getElementById("audName");
    var audEmail = document.getElementById("audEmail");
    if (audName) audName.value = session.name || "";
    if (audEmail) {
        audEmail.value = session.email || "";
        audEmail.readOnly = true; } }



function renderScriptDeadline() {
    var container  = document.getElementById("scriptDeadlineBanner");
    var form       = document.getElementById("scriptForm");
    var closedMsg  = document.getElementById("scriptClosed");
    var notOpenMsg = document.getElementById("scriptNotOpen");
    if (!container || !form || !closedMsg || !notOpenMsg) return;
    var deadline = getDeadline("scripts");
    if (!deadline) {
        container.style.display = "none"; form.style.display = "none";
        closedMsg.style.display = "none"; notOpenMsg.style.display = "block"; return;
    }
    if (isDeadlinePassed(deadline.date)) {
        container.style.display = "none"; form.style.display = "none";
        closedMsg.style.display = "block"; notOpenMsg.style.display = "none"; return;
    }
    var daysLeft = getDaysLeft(deadline.date);
    container.innerHTML = '<div class="deadline-banner active"><div class="deadline-icon">⏰</div><div class="deadline-info"><h4>Submission Deadline</h4><p>' + formatDate(deadline.date) +
        (daysLeft === 0 ? ' <span class="deadline-status urgent">(Today!)</span>' : ' <span class="deadline-status">(' + daysLeft + ' days left)</span>') + '</p></div></div>';
    container.style.display = "block"; form.style.display = "block";
    closedMsg.style.display = "none"; notOpenMsg.style.display = "none";
    fillSignedInUser("scrName", "scrEmail");
}
 
// ── Form Submissions ──────────────────────────────────────────
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
    if (deadline && isDeadlinePassed(deadline.date)) { showAlert("auditionAlert", "Applications are now closed. The deadline has passed.", "error"); return; }
    if (!name || !email || !studentId || !faculty || !experience || !why) { showAlert("auditionAlert", "Please fill in ALL fields to complete your application.", "error"); return; }
    if (!isValidMIUEmail(email)) { showAlert("auditionAlert", "Please use your MIU email.", "error"); return; }
    if (!check1 || !check2) { showAlert("auditionAlert", "Please confirm both commitment checkboxes.", "error"); return; }
 
    fetch("/api/auditions", {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, authHeader()),
        body: JSON.stringify({ name: name, email: email, phone: studentId, year: faculty, experience: experience, whyJoin: why })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { showAlert("auditionAlert", data.error, "error"); return; }
        document.getElementById("auditionForm").style.display    = "none";
        document.getElementById("auditionSuccess").style.display = "block";
    })
    .catch(function() { showAlert("auditionAlert", "Something went wrong. Try again.", "error"); });
}
 
function submitScript() {
    var name        = document.getElementById("scrName").value.trim();
    var email       = document.getElementById("scrEmail").value.trim().toLowerCase();
    var title       = document.getElementById("scrTitle").value.trim();
    var genre       = document.getElementById("scrGenre").value;
    var language    = document.getElementById("scrLanguage").value;
    var description = document.getElementById("scrDescription").value.trim();
    var cast        = document.getElementById("scrCast").value.trim();
    var fileInput   = document.getElementById("scrFile");
    var check1      = document.getElementById("scrCheck1").checked;
    hideAlert("scriptAlert");

    var deadline = getDeadline("scripts");
    if (deadline && isDeadlinePassed(deadline.date)) { showAlert("scriptAlert", "Submissions are now closed. The deadline has passed.", "error"); return; }
    if (!name || !email || !title || !genre || !language || !description || !cast) { showAlert("scriptAlert", "Please fill in all required fields.", "error"); return; }
    if (!isValidMIUEmail(email)) { showAlert("scriptAlert", "Please use your MIU email.", "error"); return; }
    if (!check1) { showAlert("scriptAlert", "Please confirm the ownership checkbox.", "error"); return; }

    var formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("title", title);
    formData.append("genre", genre);
    formData.append("language", language);
    formData.append("description", description);
    formData.append("cast", cast);
    if (fileInput && fileInput.files[0]) formData.append("scriptFile", fileInput.files[0]);

    fetch("/api/scripts", {
        method: "POST",
        body: formData
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { showAlert("scriptAlert", data.error, "error"); return; }
        document.getElementById("scriptForm").style.display    = "none";
        document.getElementById("scriptSuccess").style.display = "block";
    })
    .catch(function() { showAlert("scriptAlert", "Something went wrong. Try again.", "error"); });
}


 
function submitExit() {
    var name     = document.getElementById("exitName").value.trim();
    var email    = document.getElementById("exitEmail").value.trim().toLowerCase();
    var duration = document.getElementById("exitDuration").value.trim();
    var reason   = document.getElementById("exitReason").value;
    var comments = document.getElementById("exitComments").value.trim();
    var check1   = document.getElementById("exitCheck1").checked;
    hideAlert("exitAlert");
    if (!name || !email || !duration || !reason) { showAlert("exitAlert", "Please fill in all required fields.", "error"); return; }
    if (!isValidMIUEmail(email)) { showAlert("exitAlert", "Please use your MIU email.", "error"); return; }
    if (!check1) { showAlert("exitAlert", "Please confirm the checkbox.", "error"); return; }
 
    fetch("/api/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email, reason: "Duration: " + duration + " — " + reason + (comments ? " — " + comments : "") })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { showAlert("exitAlert", data.error, "error"); return; }
        document.getElementById("exitForm").style.display    = "none";
        document.getElementById("exitSuccess").style.display = "block";
    })
    .catch(function() { showAlert("exitAlert", "Something went wrong. Try again.", "error"); });
}
 
// ── Workshops ─────────────────────────────────────────────────
function getSpotsLeft(workshop) { return Math.max(0, workshop.maxSpots - (workshop.joinedUsers ? workshop.joinedUsers.length : 0)); }
 
function getUserJoinedWorkshops() {
    return [];
}
function saveUserJoinedWorkshops(email, joined) {
}
function hasUserJoined(workshopId, workshop) {
    var session = getSession(); if (!session || !workshop || !workshop.joinedUsers) return false;
    return workshop.joinedUsers.some(function(user) {
        return user.email === session.email;
    });
}
 
function openJoinForm(workshopId) {
    var session = getSession();
    if (!session) { showToast("Please sign in to join workshops", "er"); navigate("/login"); return; }
 
    fetch("/api/workshops")
    .then(function(r) { return r.json(); })
    .then(function(workshops) {
        var workshop = null;
        for (var i = 0; i < workshops.length; i++) { if (workshops[i]._id === workshopId) { workshop = workshops[i]; break; } }
        if (!workshop) { showToast("Workshop not found", "er"); return; }
        if (getSpotsLeft(workshop) <= 0) { showToast("This workshop is full!", "er"); return; }
        var html = '<div id="joinModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;">';
        html += '<div style="background:linear-gradient(135deg,#1e1e1e,#2a0a0b);border:2px solid #C0141C;border-radius:20px;padding:35px;max-width:420px;width:100%;">';
        html += '<div style="text-align:center;margin-bottom:25px;"><div style="font-size:48px;">🎭</div><h3 style="color:#ff6b6b;">Join Workshop</h3><p style="color:#aaa;">' + workshop.title + '</p></div>';
        html += '<div class="form-group" style="margin-bottom:18px;"><label style="color:#e0e0e0;display:block;margin-bottom:6px;">Full Name *</label><input type="text" id="joinName" value="' + (session.name||'') + '" style="width:100%;padding:14px;border-radius:12px;border:1px solid rgba(192,20,28,0.4);background:rgba(30,30,30,0.9);color:#fff;"/></div>';
        html += '<div class="form-group" style="margin-bottom:18px;"><label style="color:#e0e0e0;display:block;margin-bottom:6px;">Student ID *</label><input type="text" id="joinStudentId" placeholder="e.g. MIU-2022-12345" style="width:100%;padding:14px;border-radius:12px;border:1px solid rgba(192,20,28,0.4);background:rgba(30,30,30,0.9);color:#fff;"/></div>';
        html += '<div class="form-group" style="margin-bottom:25px;"><label style="color:#e0e0e0;display:block;margin-bottom:6px;">Faculty</label><input type="text" id="joinFaculty" placeholder="e.g. Business Administration" style="width:100%;padding:14px;border-radius:12px;border:1px solid rgba(192,20,28,0.4);background:rgba(30,30,30,0.9);color:#fff;"/></div>';
        html += '<div style="display:flex;gap:12px;"><button onclick="submitJoinForm(\'' + workshopId + '\')" style="flex:1;padding:14px;background:linear-gradient(135deg,#C0141C,#e03131);color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;">Confirm Join</button>';
        html += '<button onclick="closeJoinModal()" style="flex:1;padding:14px;background:rgba(42,42,42,0.9);color:#ccc;border:none;border-radius:12px;cursor:pointer;">Cancel</button></div></div></div>';
        var div = document.createElement('div'); div.innerHTML = html;
        document.body.appendChild(div.firstChild);
    });
}
 
function closeJoinModal() {
    var modal = document.getElementById("joinModal");
    if (modal) { modal.style.opacity = "0"; setTimeout(function() { modal.remove(); }, 300); }
}

 
function submitJoinForm(workshopId) {
    var name      = document.getElementById("joinName").value.trim();
    var studentId = document.getElementById("joinStudentId").value.trim();
    var faculty   = document.getElementById("joinFaculty").value.trim();
    var session = getSession();
    if (!session) { showToast("Please sign in to join workshops", "er"); navigate("/login"); return; }
    if (!name || !studentId) { showToast("Name and Student ID are required", "er"); return; }

    fetch("/api/workshops/" + workshopId + "/join", {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, authHeader()),
        body: JSON.stringify({ name: name, email: session.email, studentId: studentId, faculty: faculty })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { showToast(data.error, "er"); return; }
        closeJoinModal();
        showToast("Welcome to the workshop!", "ok");
        renderWorkshops();
        renderHomeWorkshops();
    })
    .catch(function() { showToast("Something went wrong. Try again.", "er"); });
}
 
function leaveWorkshop(workshopId) {
    var session = getSession(); if (!session) return;

    fetch("/api/workshops/" + workshopId + "/leave", {
        method: "POST",
        headers: authHeader()
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { showToast(data.error, "er"); return; }
        showToast("You left the workshop", "ok");
        renderWorkshops();
        renderHomeWorkshops();
    })
    .catch(function() { showToast("Something went wrong. Try again.", "er"); });
}
 
function renderWorkshops() {
    var container = document.getElementById("workshopsOutput"); if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">Loading workshops...</div>';
    fetch("/api/workshops")
    .then(function(r) { return r.json(); })
    .then(function(workshops) {
        if (!workshops.length) { container.innerHTML = '<div class="empty-state"><span>🛠</span><p>No workshops scheduled yet.</p></div>'; return; }
        workshops.sort(function(a,b) { if (a.featured && !b.featured) return -1; if (!a.featured && b.featured) return 1; return new Date(a.date)-new Date(b.date); });
        var html = '<div class="workshops-grid">';
        for (var i = 0; i < workshops.length; i++) {
            var w = workshops[i]; var spotsLeft = getSpotsLeft(w); var isFull = spotsLeft===0;
            var userJoined = hasUserJoined(w._id, w); var pct = Math.round(((w.maxSpots-spotsLeft)/w.maxSpots)*100);
            html += '<div class="content-card'+(w.featured?' workshop-spotlight':'')+'" style="position:relative;">';
            if (w.featured) html += '<div class="workshop-featured-label">⭐ Featured</div>';
            html += w.image ? '<img src="'+w.image+'" class="workshop-image" onerror="this.style.display=\'none\'"/>' : '<div class="workshop-image-placeholder"><span>🛠</span></div>';
            html += '<div class="workshop-content">';
            html += '<div class="instructor-section"><div class="instructor-avatar">👤</div><div class="instructor-info"><span class="instructor-label">Instructor</span><span class="instructor-name">'+(w.instructor||"TBA")+'</span></div></div>';
            html += '<div class="content-card-date">'+(w.date?formatDate(w.date):"Date TBA")+'</div><h3>'+w.title+'</h3><p>'+(w.description||"")+'</p>';
            html += '<div class="content-card-meta">'+(w.time?'<span>🕐 '+w.time+'</span>':'')+(w.location?'<span>📍 '+w.location+'</span>':'')+'</div>';
            html += '<div class="spots-counter"><div class="spots-number">'+spotsLeft+'</div><div class="spots-label"><strong>'+(isFull?'Workshop Full!':'Spots Remaining')+'</strong>out of '+w.maxSpots+' total<div class="spots-progress"><div class="spots-progress-fill" style="width:'+pct+'%"></div></div></div></div>';
            if (userJoined)  html += '<button class="join-btn joined" data-action="leave" data-id="'+w._id+'">✅ Joined — Click to Leave</button>';
            else if (isFull) html += '<button class="join-btn" disabled>❌ Workshop Full</button>';
            else             html += '<button class="join-btn" data-action="join"  data-id="'+w._id+'">🎭 Join Workshop</button>';
            html += '</div></div>';
        }
        html += '</div>'; container.innerHTML = html;
    })
    .catch(function() { container.innerHTML = '<div class="empty-state"><span>🛠</span><p>Could not load workshops.</p></div>'; });
}

 
function renderHomeWorkshops() {
    var container = document.getElementById("homeWorkshopsPreview"); if (!container) return;
    fetch("/api/workshops")
    .then(function(r) { return r.json(); })
    .then(function(workshops) {
        var featured = workshops.filter(function(w){return w.featured;});
        if (!featured.length && workshops.length) featured = [workshops[0]];
        if (!featured.length) { container.innerHTML=''; return; }
        var html = '<div class="section"><div class="container"><span class="section-tag">Main Feature</span><h2 class="section-title">Upcoming <em>Workshops</em></h2><div class="workshops-grid">';
        for (var i = 0; i < Math.min(featured.length,2); i++) {
            var w = featured[i]; var spotsLeft = getSpotsLeft(w); var isFull = spotsLeft===0; var userJoined = hasUserJoined(w._id, w);
            html += '<div class="content-card workshop-spotlight" style="position:relative;"><div class="workshop-featured-label">⭐ Featured</div>';
            html += w.image ? '<img src="'+w.image+'" class="workshop-image"/>' : '<div class="workshop-image-placeholder"><span>🛠</span></div>';
            html += '<div class="workshop-content"><div class="instructor-section"><div class="instructor-avatar">👤</div><div class="instructor-info"><span class="instructor-label">Instructor</span><span class="instructor-name">'+(w.instructor||"TBA")+'</span></div></div>';
            html += '<div class="content-card-date">'+(w.date?formatDate(w.date):"Date TBA")+'</div><h3>'+w.title+'</h3><p>'+(w.description||"")+'</p>';
            html += '<div class="spots-counter"><div class="spots-number">'+spotsLeft+'</div><div class="spots-label"><strong>'+(isFull?'Full!':'Spots Left')+'</strong> of '+w.maxSpots+'</div></div>';
            if (userJoined)  html += '<button class="join-btn joined" data-action="leave" data-id="'+w._id+'">✅ Joined</button>';
            else if (!isFull) html += '<button class="join-btn" data-action="join"  data-id="'+w._id+'">🎭 Join Now</button>';
            else             html += '<button class="join-btn" disabled>❌ Full</button>';
            html += '</div></div>';
        }
        html += '</div><div style="text-align:center;margin-top:30px;"><button class="btn-red" onclick="navigate(\'/workshops\')">View All Workshops →</button></div></div></div>';
        container.innerHTML = html;
    })
    .catch(function() { container.innerHTML = ''; });
}
 
function renderRehearsals() {
    var container = document.getElementById("rehearsalsOutput"); if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">Loading...</div>';
    fetch("/api/rehearsals")
    .then(function(r) { return r.json(); })
    .then(function(videos) {
        if (!videos.length) { container.innerHTML='<div class="empty-state"><span>🎥</span><p>No rehearsal videos added yet.</p></div>'; return; }
        var html = '<div class="content-grid">';
        for (var i = 0; i < videos.length; i++) {
            html += '<div class="content-card"><h3>'+videos[i].title+'</h3><div class="content-card-date">📅 '+(videos[i].date ? formatDate(videos[i].date) : "")+'</div><a href="'+videos[i].link+'" target="_blank" class="watch-btn">▶ Watch Recording</a></div>';
        }
        html += '</div>'; container.innerHTML = html;
    })
    .catch(function() { container.innerHTML = '<div class="empty-state"><span>🎥</span><p>Could not load videos.</p></div>'; });
}
 
function renderHomeDeadlines() {
    var container = document.getElementById("homeDeadlines"); if (!container) return;
    fetch("/api/deadlines")
    .then(function(r) { return r.json(); })
    .then(function(deadlines) {
        _deadlinesCache = deadlines;
        var appDeadlines = deadlines.filter(function(d){return (d.type==="auditions"||d.type==="scripts")&&!isDeadlinePassed(d.date);});
        if (!appDeadlines.length) { container.innerHTML=""; return; }
        var html = '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;">';
        for (var i = 0; i < appDeadlines.length; i++) {
            var d = appDeadlines[i]; var daysLeft = getDaysLeft(d.date); var label = d.type==="auditions"?"🎤 Auditions":"📜 Scripts";
            html += '<div class="deadline-banner active" style="flex:1;min-width:200px;cursor:pointer;" onclick="navigate(\'/'+d.type+'\')">';
            html += '<div class="deadline-icon">⏰</div><div class="deadline-info"><h4>'+label+'</h4><p>'+formatDate(d.date);
            html += daysLeft===0?' <span class="deadline-status urgent">(Today!)</span>':' <span class="deadline-status">('+daysLeft+' days left)</span>';
            html += '</p></div></div>';
        }
        html += '</div>'; container.innerHTML = html;
    })
    .catch(function() { container.innerHTML = ""; });
}
 
// ── Admin ─────────────────────────────────────────────────────
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
    if (panelName==="dashboard")  renderDashboard();
    if (panelName==="auditions")  renderAdminAuditions();
    if (panelName==="exit")       renderAdminExit();
    if (panelName==="scripts")    renderAdminScripts();
    if (panelName==="workshops")  renderAdminWorkshops();
    if (panelName==="rehearsals") renderAdminRehearsals();
    if (panelName==="messages")   renderAdminMessages();
    if (panelName==="deadlines")  renderAdminDeadlines();
    if (panelName==="users")      renderAdminUsers();
}
 
function updateAdminBadges() {
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
 
    fetch("/api/auditions", { headers: headers }).then(function(r){return r.json();}).then(function(data){
        var el = document.getElementById("badgeAud");
        if (el) el.textContent = data.filter(function(x){return x.status==="pending";}).length;
    }).catch(function(){});
 
    fetch("/api/scripts", { headers: headers }).then(function(r){return r.json();}).then(function(data){
        var el = document.getElementById("badgeScr");
        if (el) el.textContent = data.filter(function(x){return x.status==="pending";}).length;
    }).catch(function(){});
 
    fetch("/api/exit", { headers: headers }).then(function(r){return r.json();}).then(function(data){
        var el = document.getElementById("badgeExit");
        if (el) el.textContent = data.filter(function(x){return x.status==="pending";}).length;
    }).catch(function(){});
 
    fetch("/api/contact", { headers: headers }).then(function(r){return r.json();}).then(function(data){
        var el = document.getElementById("badgeMsg");
        if (el) el.textContent = data.length;
    }).catch(function(){});
}
 
function renderDashboard() {
    var container = document.getElementById("dashboardStats"); if (!container) return;
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    var stats = { pendingAud:0, pendingScr:0, pendingExit:0, messages:0, workshops:0 };
    var done = 0;
    function check() { done++; if (done < 4) return;
        container.innerHTML =
            '<div class="stat-card red"><div class="stat-label">Pending Auditions</div><div class="stat-number">'+stats.pendingAud+'</div></div>'+
            '<div class="stat-card red"><div class="stat-label">Pending Scripts</div><div class="stat-number">'+stats.pendingScr+'</div></div>'+
            '<div class="stat-card red"><div class="stat-label">Exit Requests</div><div class="stat-number">'+stats.pendingExit+'</div></div>'+
            '<div class="stat-card"><div class="stat-label">Contact Messages</div><div class="stat-number">'+stats.messages+'</div></div>'+
            '<div class="stat-card"><div class="stat-label">Workshops</div><div class="stat-number">'+stats.workshops+'</div></div>';
    }
    fetch("/api/auditions",{headers:headers}).then(function(r){return r.json();}).then(function(d){stats.pendingAud=d.filter(function(x){return x.status==="pending";}).length;check();}).catch(check);
    fetch("/api/scripts",  {headers:headers}).then(function(r){return r.json();}).then(function(d){stats.pendingScr=d.filter(function(x){return x.status==="pending";}).length;check();}).catch(check);
    fetch("/api/exit",     {headers:headers}).then(function(r){return r.json();}).then(function(d){stats.pendingExit=d.filter(function(x){return x.status==="pending";}).length;check();}).catch(check);
    fetch("/api/contact",  {headers:headers}).then(function(r){return r.json();}).then(function(d){stats.messages=d.length;check();}).catch(check);
    fetch("/api/workshops").then(function(r){return r.json();}).then(function(d){stats.workshops=d.length;}).catch(function(){});
}
 
function renderAdminAuditions() {
    var container = document.getElementById("tableAud"); if (!container) return;
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/auditions", { headers: headers })
    .then(function(r){return r.json();})
    .then(function(data) {
        var countEl = document.getElementById("countAud"); if (countEl) countEl.textContent = data.filter(function(x){return x.status==="pending";}).length + " pending";
        if (!data.length) { container.innerHTML='<div class="admin-empty"><span>📋</span><p>No submissions yet.</p></div>'; return; }
        var html = '<table><thead><tr><th>Name</th><th>Email</th><th>Faculty</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        for (var i=0; i<data.length; i++) {
            var item=data[i]; var sb='<span class="status-badge '+item.status+'">'+item.status+'</span>';
            var actions = item.status==="pending"
                ? '<div class="action-buttons"><button class="btn-approve" onclick="adminAction(\'auditions\',\''+item._id+'\',\'approved\')">Approve</button><button class="btn-reject" onclick="adminAction(\'auditions\',\''+item._id+'\',\'rejected\')">Reject</button></div>'
                : '<button class="btn-delete" onclick="adminDelete(\'auditions\',\''+item._id+'\')">Delete</button>';
            html += '<tr><td>'+item.name+'</td><td>'+item.email+'</td><td>'+(item.year||"-")+'</td><td>'+(item.createdAt?formatDate(item.createdAt):"-")+'</td><td>'+sb+'</td><td>'+actions+'</td></tr>';
        }
        html += '</tbody></table>'; container.innerHTML = html;
    }).catch(function(){ container.innerHTML='<div class="admin-empty"><p>Could not load data.</p></div>'; });
}
 
function renderAdminExit() {
    var container = document.getElementById("tableExit"); if (!container) return;
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/exit", { headers: headers })
    .then(function(r){return r.json();})
    .then(function(data) {
        var countEl = document.getElementById("countExit"); if (countEl) countEl.textContent = data.filter(function(x){return x.status==="pending";}).length + " pending";
        if (!data.length) { container.innerHTML='<div class="admin-empty"><span>🚪</span><p>No exit requests yet.</p></div>'; return; }
        var html = '<table><thead><tr><th>Name</th><th>Email</th><th>Reason</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        for (var i=0; i<data.length; i++) {
            var item=data[i]; var sb='<span class="status-badge '+item.status+'">'+item.status+'</span>';
            var actions = item.status==="pending"
                ? '<div class="action-buttons"><button class="btn-approve" onclick="adminAction(\'exit\',\''+item._id+'\',\'approved\')">Approve</button><button class="btn-reject" onclick="adminAction(\'exit\',\''+item._id+'\',\'rejected\')">Reject</button></div>'
                : '<button class="btn-delete" onclick="adminDelete(\'exit\',\''+item._id+'\')">Delete</button>';
            html += '<tr><td>'+item.name+'</td><td>'+item.email+'</td><td>'+(item.reason||"-")+'</td><td>'+(item.createdAt?formatDate(item.createdAt):"-")+'</td><td>'+sb+'</td><td>'+actions+'</td></tr>';
        }
        html += '</tbody></table>'; container.innerHTML = html;
    }).catch(function(){ container.innerHTML='<div class="admin-empty"><p>Could not load data.</p></div>'; });
}
 
function renderAdminScripts() {
    var container = document.getElementById("tableScr"); if (!container) return;
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/scripts", { headers: headers })
    .then(function(r){return r.json();})
    .then(function(data) {
        var countEl = document.getElementById("countScr"); if (countEl) countEl.textContent = data.filter(function(x){return x.status==="pending";}).length + " pending";
        if (!data.length) { container.innerHTML='<div class="admin-empty"><span>📜</span><p>No scripts yet.</p></div>'; return; }
        var html = '<table><thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        for (var i=0; i<data.length; i++) {
            var item=data[i]; var sb='<span class="status-badge '+item.status+'">'+item.status+'</span>';
            var actions=item.status==="pending"
                ?'<div class="action-buttons"><button class="btn-approve" onclick="adminAction(\'scripts\',\''+item._id+'\',\'approved\')">Approve</button><button class="btn-reject" onclick="adminAction(\'scripts\',\''+item._id+'\',\'rejected\')">Reject</button></div>'
                :'<button class="btn-delete" onclick="adminDelete(\'scripts\',\''+item._id+'\')">Delete</button>';
            html+='<tr><td><strong>'+item.title+'</strong></td><td>'+item.name+'</td><td>'+(item.genre||"-")+'</td><td>'+sb+'</td><td>'+actions+'</td></tr>';
        }
        html += '</tbody></table>'; container.innerHTML = html;
    }).catch(function(){ container.innerHTML='<div class="admin-empty"><p>Could not load data.</p></div>'; });
}

function adminAction(route, id, status) {
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/" + route + "/" + id, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({ status: status })
    })
    .then(function(r){return r.json();})
    .then(function() {
        showToast(status==="approved"?"Approved!":"Rejected", status==="approved"?"ok":"er");
        var activePanel = document.querySelector('.admin-panel.active');
        if (activePanel) renderAdminPanel(activePanel.id.replace('adminPanel-',''));
        updateAdminBadges(); renderDashboard();
    })
    .catch(function(){ showToast("Something went wrong","er"); });
}
 
function adminDelete(route, id) {
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/" + route + "/" + id, { method: "DELETE", headers: headers })
    .then(function(r){return r.json();})
    .then(function() {
        showToast("Deleted","er");
        var activePanel = document.querySelector('.admin-panel.active');
        if (activePanel) renderAdminPanel(activePanel.id.replace('adminPanel-',''));
        updateAdminBadges(); renderDashboard();
    })
    .catch(function(){ showToast("Something went wrong","er"); });
}
 
var editingWorkshopId = null;
 
function addWorkshop() {
    var title=document.getElementById("wsTitle").value.trim(), date=document.getElementById("wsDate").value;
    var time=document.getElementById("wsTime").value.trim(), location=document.getElementById("wsLocation").value.trim();
    var desc=document.getElementById("wsDesc").value.trim(), instructor=document.getElementById("wsInstructor").value.trim();
    var imageFile=document.getElementById("wsImage").files[0], maxSpots=parseInt(document.getElementById("wsMaxSpots").value)||20;
    var featured=document.getElementById("wsFeatured").checked;
    if (!title||!date) { showToast("Title and date are required","er"); return; }
    var today=new Date(); today.setHours(0,0,0,0);
    if (new Date(date)<today) { showToast("Please select a future date","er"); return; }
    var formData = new FormData();
formData.append("title", title);
formData.append("date", date);
formData.append("time", time);
formData.append("location", location);
formData.append("description", desc);
formData.append("instructor", instructor||"TBA");
formData.append("maxSpots", maxSpots);
formData.append("featured", featured);
if (imageFile) formData.append("image", imageFile);
fetch("/api/workshops", {
    method: "POST", headers: authHeader(),
    body: formData
})
    .then(function(r){return r.json();})
    .then(function(data) {
        if (data.error) { showToast(data.error,"er"); return; }
        ["wsTitle","wsDate","wsTime","wsLocation","wsDesc","wsInstructor"].forEach(function(id){document.getElementById(id).value="";});
document.getElementById("wsImage").value="";
        document.getElementById("wsMaxSpots").value="20"; document.getElementById("wsFeatured").checked=false;
        renderAdminWorkshops(); renderDashboard(); showToast("Workshop added!","ok");
    })
    .catch(function(){ showToast("Something went wrong","er"); });
}
 
function editWorkshop(id) {
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/workshops", { headers: headers })
    .then(function(r){return r.json();})
    .then(function(workshops) {
        var workshop = null;
        for (var i=0;i<workshops.length;i++){if(workshops[i]._id===id){workshop=workshops[i];break;}}
        if (!workshop) return;
        editingWorkshopId=id;
        document.getElementById("editWsTitle").value=workshop.title;
        document.getElementById("editWsDate").value=workshop.date ? workshop.date.substring(0,10) : "";
        document.getElementById("editWsTime").value=workshop.time||"";
        document.getElementById("editWsLocation").value=workshop.location||"";
        document.getElementById("editWsDesc").value=workshop.description||"";
        document.getElementById("editWsInstructor").value=workshop.instructor||"";
        document.getElementById("editWsImage").value=workshop.image||"";
        document.getElementById("editWsMaxSpots").value=workshop.maxSpots||20;
        document.getElementById("editWsFeatured").checked=workshop.featured||false;
        document.getElementById("addWorkshopForm").style.display="none";
        document.getElementById("editWorkshopForm").style.display="block";
        showToast("Editing: "+workshop.title,"ok");
    });
}
 
function saveEditWorkshop() {
    if (!editingWorkshopId) return;
    var title=document.getElementById("editWsTitle").value.trim(), date=document.getElementById("editWsDate").value;
    if (!title||!date) { showToast("Title and date are required","er"); return; }
    var editFormData = new FormData();
editFormData.append("title", title);
editFormData.append("date", date);
editFormData.append("time", document.getElementById("editWsTime").value.trim());
editFormData.append("location", document.getElementById("editWsLocation").value.trim());
editFormData.append("description", document.getElementById("editWsDesc").value.trim());
editFormData.append("instructor", document.getElementById("editWsInstructor").value.trim()||"TBA");
editFormData.append("maxSpots", parseInt(document.getElementById("editWsMaxSpots").value)||20);
editFormData.append("featured", document.getElementById("editWsFeatured").checked);
var editImageFile = document.getElementById("editWsImage").files[0];
if (editImageFile) editFormData.append("image", editImageFile);
fetch("/api/workshops/" + editingWorkshopId, {
    method: "PUT", headers: authHeader(),
    body: editFormData
})
    .then(function(r){return r.json();})
    .then(function() {
        editingWorkshopId=null;
        document.getElementById("addWorkshopForm").style.display="block";
        document.getElementById("editWorkshopForm").style.display="none";
        renderAdminWorkshops(); renderDashboard(); showToast("Workshop updated!","ok");
    })
    .catch(function(){ showToast("Something went wrong","er"); });
}
 
function cancelEditWorkshop() {
    editingWorkshopId=null;
    document.getElementById("addWorkshopForm").style.display="block";
    document.getElementById("editWorkshopForm").style.display="none";
}
 
function renderAdminWorkshops() {
    var container=document.getElementById("tableWs"); if(!container)return;
    fetch("/api/workshops")
    .then(function(r){return r.json();})
    .then(function(data) {
        if(!data.length){container.innerHTML='<div class="admin-empty"><span>🛠</span><p>No workshops yet.</p></div>';return;}
        var html='<table><thead><tr><th>Title</th><th>Instructor</th><th>Date</th><th>Spots</th><th>Joined Users</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        for(var i=0;i<data.length;i++){
            var w=data[i],sl=getSpotsLeft(w);
            var joinedUsers = w.joinedUsers || [];
            var joinedHtml = joinedUsers.length
                ? joinedUsers.map(function(user) {
                    return '<div style="margin-bottom:6px;"><strong>'+(user.name || "-")+'</strong><br><span style="font-size:11px;color:#aaa;">'+(user.email || "-")+'</span></div>';
                }).join("")
                : '<span style="color:#aaa;">No users yet</span>';
            var sb=w.featured?'<span class="status-badge approved">⭐ Featured</span>':'<span class="status-badge pending">Standard</span>';
            html+='<tr><td><strong>'+w.title+'</strong></td><td>'+(w.instructor||"-")+'</td><td>'+(w.date?formatDate(w.date):"-")+'</td><td>'+sl+'/'+w.maxSpots+'</td><td>'+joinedHtml+'</td><td>'+sb+'</td>';
            html+='<td><div class="action-buttons"><button class="btn-approve" data-action="edit" data-id="'+w._id+'">✏️ Edit</button><button class="btn-delete" data-action="delete" data-id="'+w._id+'">🗑 Delete</button></div></td></tr>';
        }
        html+='</tbody></table>'; container.innerHTML=html;
    })
    .catch(function(){ container.innerHTML='<div class="admin-empty"><p>Could not load workshops.</p></div>'; });
}
 
function adminDeleteWorkshop(id) {
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/workshops/" + id, { method: "DELETE", headers: headers })
    .then(function(r){return r.json();})
    .then(function() { renderAdminWorkshops(); renderDashboard(); showToast("Workshop deleted","er"); })
    .catch(function(){ showToast("Something went wrong","er"); });
}
 
function renderAdminRehearsals() {
    var container=document.getElementById("tableReh");if(!container)return;
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/rehearsals", { headers: headers })
    .then(function(r){return r.json();})
    .then(function(data) {
        if(!data.length){container.innerHTML='<div class="admin-empty"><span>🎥</span><p>No videos yet.</p></div>';return;}
        var html='<table><thead><tr><th>Title</th><th>Date</th><th>Link</th><th>Actions</th></tr></thead><tbody>';
        for(var i=0;i<data.length;i++){html+='<tr><td><strong>'+data[i].title+'</strong></td><td>'+(data[i].date?formatDate(data[i].date):"-")+'</td><td><a href="'+data[i].link+'" target="_blank" style="color:var(--red);">Open ↗</a></td><td><button class="btn-delete" onclick="adminDelete(\'rehearsals\',\''+data[i]._id+'\')">Delete</button></td></tr>';}
        html+='</tbody></table>'; container.innerHTML=html;
    })
    .catch(function(){ container.innerHTML='<div class="admin-empty"><p>Could not load data.</p></div>'; });
}
 
function renderAdminMessages() {
    var container=document.getElementById("tableMsg");if(!container)return;
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/contact", { headers: headers })
    .then(function(r){return r.json();})
    .then(function(data) {
        var countEl=document.getElementById("countMsg");if(countEl)countEl.textContent=data.length+" messages";
        if(!data.length){container.innerHTML='<div class="admin-empty"><span>✉️</span><p>No messages yet.</p></div>';return;}
        var html='<table><thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
        for(var i=0;i<data.length;i++){var item=data[i];html+='<tr><td>'+(item.firstName+" "+(item.lastName||""))+'</td><td>'+item.email+'</td><td>'+(item.subject||"-")+'</td><td style="max-width:200px;font-size:11px;">'+item.message+'</td><td>'+(item.createdAt?formatDate(item.createdAt):"-")+'</td><td><button class="btn-delete" onclick="adminDelete(\'contact\',\''+item._id+'\')">Delete</button></td></tr>';}
        html+='</tbody></table>'; container.innerHTML=html;
    })
    .catch(function(){ container.innerHTML='<div class="admin-empty"><p>Could not load data.</p></div>'; });
}
 
function loadDeadlineInputs() {
    fetch("/api/deadlines")
    .then(function(r){return r.json();})
    .then(function(deadlines) {
        _deadlinesCache = deadlines;
        var audDate=document.getElementById("deadlineAudDate"),scrDate=document.getElementById("deadlineScrDate");
        for(var i=0;i<deadlines.length;i++){
            if(deadlines[i].type==="auditions"&&audDate) audDate.value=deadlines[i].date?deadlines[i].date.substring(0,10):"";
            if(deadlines[i].type==="scripts"&&scrDate)   scrDate.value=deadlines[i].date?deadlines[i].date.substring(0,10):"";
        }
    }).catch(function(){});
}
 
function saveDeadline(type) {
    var dateInput=document.getElementById(type==="auditions"?"deadlineAudDate":"deadlineScrDate");
    if(!dateInput||!dateInput.value){showToast("Please select a date","er");return;}
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/deadlines", {
        method: "POST", headers: headers,
        body: JSON.stringify({ type: type, date: dateInput.value })
    })
    .then(function(r){return r.json();})
    .then(function() { renderAdminDeadlines(); renderDashboard(); showToast("Deadline saved!","ok"); })
    .catch(function(){ showToast("Something went wrong","er"); });
}
 
function clearDeadline(type) {
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/deadlines/" + type, { method: "DELETE", headers: headers })
    .then(function(r){return r.json();})
    .then(function() {
        var di=document.getElementById(type==="auditions"?"deadlineAudDate":"deadlineScrDate");if(di)di.value="";
        renderAdminDeadlines(); renderDashboard(); showToast("Deadline removed","er");
    })
    .catch(function(){ showToast("Something went wrong","er"); });
}
 
function renderAdminDeadlines() {
    var container=document.getElementById("tableDeadlines");if(!container)return;
    fetch("/api/deadlines")
    .then(function(r){return r.json();})
    .then(function(deadlines) {
        _deadlinesCache = deadlines;
        var app=deadlines.filter(function(d){return d.type==="auditions"||d.type==="scripts";});
        if(!app.length){container.innerHTML='<div class="admin-empty"><span>⏰</span><p>No deadlines set yet.</p></div>';return;}
        var html='<table><thead><tr><th>Type</th><th>Deadline Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        for(var j=0;j<app.length;j++){
            var d=app[j],exp=isDeadlinePassed(d.date),dl=getDaysLeft(d.date);
            var sb=exp?'<span class="status-badge rejected">Expired</span>':'<span class="status-badge approved">Active ('+dl+' days left)</span>';
            html+='<tr><td><strong>'+(d.type==="auditions"?"🎭 Auditions":"📜 Script Upload")+'</strong></td><td>'+formatDate(d.date)+'</td><td>'+sb+'</td><td><button class="btn-delete" onclick="clearDeadline(\''+d.type+'\')">Remove</button></td></tr>';
        }
        html+='</tbody></table>';container.innerHTML=html;
    })
    .catch(function(){ container.innerHTML='<div class="admin-empty"><p>Could not load deadlines.</p></div>'; });
}
 
function addRehearsal() {
    var title=document.getElementById("rehTitle").value.trim(),date=document.getElementById("rehDate").value,link=document.getElementById("rehLink").value.trim();
    if(!title||!link){showToast("Title and link are required","er");return;}
    if(!isValidURL(link)){showToast("Please enter a valid URL","er");return;}
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/rehearsals", {
        method: "POST", headers: headers,
        body: JSON.stringify({ title: title, date: date||null, link: link })
    })
    .then(function(r){return r.json();})
    .then(function(data) {
        if (data.error) { showToast(data.error,"er"); return; }
        document.getElementById("rehTitle").value="";document.getElementById("rehDate").value="";document.getElementById("rehLink").value="";
        renderAdminRehearsals(); renderDashboard(); showToast("Video link added!","ok");
    })
    .catch(function(){ showToast("Something went wrong","er"); });
}
 
function renderAdminUsers() {
    var container = document.getElementById("tableUsers"); if (!container) return;
    var headers = Object.assign({ "Content-Type": "application/json" }, authHeader());
    fetch("/api/auth/users", { headers: headers })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        var countEl = document.getElementById("countUsers");
        if (countEl) countEl.textContent = data.length + " users";
        if (!data.length) { container.innerHTML = '<div class="admin-empty"><span>👥</span><p>No registered users yet.</p></div>'; return; }
        var html = '<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>';
        for (var i = 0; i < data.length; i++) {
            var u = data[i];
            html += '<tr><td>' + u.name + '</td><td>' + u.email + '</td><td><span class="status-badge ' + (u.role === "admin" ? "approved" : "pending") + '">' + u.role + '</span></td><td>' + (u.createdAt ? formatDate(u.createdAt) : "-") + '</td></tr>';
        }
        html += '</tbody></table>';
        container.innerHTML = html;
    })
    .catch(function() { container.innerHTML = '<div class="admin-empty"><p>Could not load users.</p></div>'; });
}


// ── Storage (kept for social links only) ──────────────────────
function getData(key) { var d=localStorage.getItem("miu_"+key); return d===null?[]:JSON.parse(d); }
function saveData(key,data) { localStorage.setItem("miu_"+key,JSON.stringify(data)); }
 
// ── Event Delegation ──────────────────────────────────────────
document.addEventListener("click", function(e) {
    var btn=e.target.closest("[data-action]"); if(!btn)return;
    var action=btn.getAttribute("data-action"), id=btn.getAttribute("data-id");
    if      (action==="join")   { e.preventDefault(); openJoinForm(id); }
    else if (action==="leave")  { e.preventDefault(); leaveWorkshop(id); }
    else if (action==="edit")   { e.preventDefault(); editWorkshop(id); }
    else if (action==="delete") { e.preventDefault(); if(confirm("Delete this workshop?")) adminDeleteWorkshop(id); }
});


 
// ── External API — Theatre Quote ──────────────────────────────
function fetchQuote() {
    var box = document.getElementById("quoteBox");
    if (!box) return;

    var session = getSession();
    var greeting = session ? "Welcome back, " + session.name.split(" ")[0] + "! 🎭 " : "";

    fetch("https://api.quotable.io/random?tags=inspirational|life|success")
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data && data.content) {
            box.innerHTML = greeting + '"' + data.content + '" — ' + data.author;
            box.style.display = "block";
        }
    })
    .catch(function() {
        if (greeting) {
            box.innerHTML = greeting + "Break a leg tonight! 🎭";
            box.style.display = "block";
        }
    });
}
// ── Init ──────────────────────────────────────────────────────
updateNav();
loadSocialLinks();
renderHomeWorkshops();
renderHomeDeadlines();
updateAdminBadges();
 
// ── Page-specific init ──────────────────────────────────────────
var path = window.location.pathname;
 
if (path === "/" || path === "/home") {
    renderHomeWorkshops();
    renderHomeDeadlines();
    fetchQuote();
}
 
if (path === "/workshops") {
    renderWorkshops();
}
 
if (path === "/rehearsals") {
    var session = getSession();
    if (!session) { navigate("/login"); }
    else { renderRehearsals(); }
}
 
if (path === "/auditions") {
    var session = getSession();
    if (!session) { localStorage.setItem("miu_redirect", "auditions"); navigate("/login"); }
    else { loadDeadlinesFromAPI(function() { renderAuditionDeadline(); }); }
}
 
if (path === "/scripts") {
    var session = getSession();
    if (!session) { localStorage.setItem("miu_redirect", "scripts"); navigate("/login"); }
    else { loadDeadlinesFromAPI(function() { renderScriptDeadline(); }); }
}
 
if (path === "/admin") {
    var session = getSession();
    if (!session || session.role !== "admin") { navigate("/login"); }
    else { initAdminPage(); }
}

if (path === "/exit") {
    var session = getSession();
    if (!session) { localStorage.setItem("miu_redirect", "exit"); navigate("/login"); }
    else { fillSignedInUser("exitName", "exitEmail"); }
}
 
if (path === "/contact") {
    var session = getSession();
    var ctEmail = document.getElementById("ctEmail");
    if (ctEmail && session) {
        ctEmail.value = session.email;
        ctEmail.readOnly = true;
    }
}
 
if (path === "/login") {
    var session = getSession();
    if (session) { navigate(session.role === "admin" ? "/admin" : "/"); }
}
 
updateAdminBadges();
renderHomeDeadlines();
renderHomeWorkshops();