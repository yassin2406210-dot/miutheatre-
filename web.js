// =============================================
//   MIU Theatre Club - script.js
// =============================================


// ── Admin Credentials (hidden from UI) ──
var ADMIN_EMAIL    = "theatreadmin@miuegypt.edu.eg";
var ADMIN_PASSWORD = "MIUTheatre2025!";
var ADMIN_NAME     = "Theatre Admin";



// =============================================
//   PAGE NAVIGATION
// =============================================

var currentPage = "home";

function showPage(pageName) {

    // Close mobile menu
    closeMobileMenu();

    // Pages that require login
    var protectedPages = ["auditions", "acting", "scripts", "exit", "rehearsals", "admin"];

    var session = getSession();

    // If page requires login and user is not logged in — redirect to login
    for (var p = 0; p < protectedPages.length; p++) {
        if (pageName === protectedPages[p] && session === null) {
            // Save the page they wanted to go to
            localStorage.setItem("miu_redirect", pageName);
            showPage("login");
            showToast("Please sign in to access this page.", "er");
            return;
        }
    }

    // Admin guard — logged in but not admin
    if (pageName === "admin") {
        if (session === null || session.role !== "admin") {
            showPage("login");
            return;
        }
    }

    // *** Block admin from accessing non-admin pages ***
    if (session !== null && session.role === "admin") {
        var adminOnlyPages = ["admin", "login"];
        var allowed = false;
        for (var a = 0; a < adminOnlyPages.length; a++) {
            if (pageName === adminOnlyPages[a]) {
                allowed = true;
            }
        }
        if (!allowed) {
            showPage("admin");
            return;
        }
    }

    // Hide all pages
    var allPages = document.querySelectorAll(".page");
    for (var i = 0; i < allPages.length; i++) {
        allPages[i].classList.remove("active");
    }

    // Show the selected page
    var selectedPage = document.getElementById("page-" + pageName);
    if (selectedPage === null) {
        console.log("Page not found: " + pageName);
        return;
    }
    selectedPage.classList.add("active");

    // Scroll to top
    window.scrollTo(0, 0);

    currentPage = pageName;

    // Run page-specific functions
    if (pageName === "home") {
        renderHomeDeadlines();
        loadSocialLinks();
    }

    if (pageName === "workshops") {
        renderWorkshops();
    }

    if (pageName === "deadlines") {
        renderDeadlinesPage();
    }

    if (pageName === "rehearsals") {
        renderRehearsals();
    }

    if (pageName === "admin") {
        initAdminPage();
        renderAdminPanel("dashboard");
    }

    // When login page opens — clear the form fields
    if (pageName === "login") {
        clearLoginForm();
    }

    // When contact page opens — auto-fill email if logged in
    if (pageName === "contact") {
        autoFillContactEmail();
    }

    // Reset feature forms when re-visiting
    if (pageName === "auditions") {
        resetForm("auditionForm", "auditionSuccess");
    }
    if (pageName === "acting") {
        resetForm("actingForm", "actingSuccess");
    }
    if (pageName === "scripts") {
        resetForm("scriptForm", "scriptSuccess");
    }
    if (pageName === "exit") {
        resetForm("exitForm", "exitSuccess");
    }
}

function resetForm(formId, successId) {
    var form = document.getElementById(formId);
    var success = document.getElementById(successId);

    if (form !== null) {
        form.style.display = "";
        var inputs = form.querySelectorAll("input, textarea, select");
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type === "checkbox") {
                inputs[i].checked = false;
            } else {
                inputs[i].value = "";
            }
        }
    }

    if (success !== null) {
        success.style.display = "none";
    }
}

// Clear login form fields (called every time login page opens)
function clearLoginForm() {
    var emailInput = document.getElementById("signinEmail");
    var pwInput    = document.getElementById("signinPw");

    if (emailInput !== null) {
        emailInput.value = "";
        emailInput.style.borderColor = "";
    }
    if (pwInput !== null) {
        pwInput.value = "";
        pwInput.style.borderColor = "";
    }

    // Also clear signup form
    var suName  = document.getElementById("signupName");
    var suEmail = document.getElementById("signupEmail");
    var suPw    = document.getElementById("signupPw");
    var suPw2   = document.getElementById("signupPw2");

    if (suName  !== null) { suName.value  = ""; suName.style.borderColor  = ""; }
    if (suEmail !== null) { suEmail.value = ""; suEmail.style.borderColor = ""; }
    if (suPw    !== null) { suPw.value    = ""; suPw.style.borderColor    = ""; }
    if (suPw2   !== null) { suPw2.value   = ""; suPw2.style.borderColor   = ""; }

    // Hide all alerts and error messages
    hideAlert("signinAlert");
    hideAlert("signupAlert");
    hideErrorMsg("signinEmailError");
    hideErrorMsg("signinPwError");
    hideErrorMsg("signupNameError");
    hideErrorMsg("signupEmailError");
    hideErrorMsg("signupPwError");
    hideErrorMsg("signupPw2Error");
}

// Auto-fill contact email if user is logged in
function autoFillContactEmail() {
    var session  = getSession();
    var emailInput = document.getElementById("ctEmail");

    if (emailInput === null) {
        return;
    }

    if (session !== null) {
        // Fill the email and make it read-only
        emailInput.value    = session.email;
        emailInput.readOnly = true;
        emailInput.style.backgroundColor = "";
        emailInput.style.color           = "";
    } else {
        // Not logged in — field is editable and requires MIU email
        emailInput.value    = "";
        emailInput.readOnly = false;
        emailInput.style.backgroundColor = "";
        emailInput.style.color           = "";
    }
}


// =============================================
//   NAVBAR
// =============================================

// Update nav buttons based on login state
function updateNav() {
    var session = getSession();

    var loginBtn        = document.getElementById("loginBtn");
    var logoutBtn       = document.getElementById("logoutBtn");
    var mobileLoginBtn  = document.getElementById("mobileLoginBtn");
    var mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
    var navLinks        = document.getElementById("navLinks");

    if (session !== null) {
        // User is logged in
        loginBtn.style.display  = "none";
        logoutBtn.style.display = "";
        mobileLoginBtn.style.display  = "none";
        mobileLogoutBtn.style.display = "";

        if (session.role === "admin") {
            logoutBtn.textContent       = "⚙️ " + session.name + " — Sign Out";
            mobileLogoutBtn.textContent = "⚙️ " + session.name + " — Sign Out";

            // Hide all regular nav buttons except login/logout
            var allNavBtns = navLinks.querySelectorAll("button:not(#loginBtn):not(#logoutBtn):not(#darkModeBtn), .dropdown");
            for (var i = 0; i < allNavBtns.length; i++) {
                allNavBtns[i].style.display = "none";
            }

            // Add Admin Panel button if not already there
            if (!document.getElementById("adminPanelBtn")) {
                var adminBtn = document.createElement("button");
                adminBtn.id = "adminPanelBtn";
                adminBtn.textContent = "⚙️ Admin Panel";
                adminBtn.onclick = function() { showPage("admin"); };
                navLinks.insertBefore(adminBtn, logoutBtn);
            }

        } else {
            logoutBtn.textContent       = "👤 " + session.name + " — Sign Out";
            mobileLogoutBtn.textContent = "👤 " + session.name + " — Sign Out";
        }

    } else {
        // User is not logged in
        loginBtn.style.display  = "";
        logoutBtn.style.display = "none";
        mobileLoginBtn.style.display  = "";
        mobileLogoutBtn.style.display = "none";

        // Restore all hidden nav buttons
        var allNavBtns2 = navLinks.querySelectorAll("button, .dropdown");
        for (var k = 0; k < allNavBtns2.length; k++) {
            allNavBtns2[k].style.display = "";
        }

        // Remove Admin Panel button if present
        var adminBtn2 = document.getElementById("adminPanelBtn");
        if (adminBtn2 !== null) {
            adminBtn2.parentNode.removeChild(adminBtn2);
        }
    }
}

// Scroll shadow on navbar
window.addEventListener("scroll", function() {
    var navbar = document.getElementById("navbar");
    if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

// Mobile menu toggle
function toggleMobileMenu() {
    var menu = document.getElementById("mobileMenu");
    menu.classList.toggle("open");
}

function closeMobileMenu() {
    var menu = document.getElementById("mobileMenu");
    menu.classList.remove("open");
}


// =============================================
//   TOAST NOTIFICATION
// =============================================

function showToast(message, type) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "show";

    if (type === "ok") {
        toast.classList.add("ok");
    } else if (type === "er") {
        toast.classList.add("er");
    }

    setTimeout(function() {
        toast.className = "";
    }, 3200);
}


// =============================================
//   SESSION (localStorage)
// =============================================

function getSession() {
    var data = localStorage.getItem("miu_session");
    if (data === null) {
        return null;
    }
    return JSON.parse(data);
}

function saveSession(sessionData) {
    localStorage.setItem("miu_session", JSON.stringify(sessionData));
}

function clearSession() {
    localStorage.removeItem("miu_session");
}


// =============================================
//   DATA HELPERS (localStorage)
// =============================================

function getData(key) {
    var data = localStorage.getItem(key);
    if (data === null) {
        return [];
    }
    return JSON.parse(data);
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}


// =============================================
//   VALIDATION HELPERS
// =============================================

function isValidMIUEmail(email) {
    // Email must end with @miuegypt.edu.eg
    var emailPattern = /^[^ ]+@miuegypt\.edu\.eg$/;
    return emailPattern.test(email.trim().toLowerCase());
}

function showAlert(alertId, message, type) {
    var alertBox = document.getElementById(alertId);
    alertBox.style.display = "";
    alertBox.className = "alert " + type;

    if (type === "error") {
        alertBox.innerHTML = "⚠️ " + message;
    } else {
        alertBox.innerHTML = "✅ " + message;
    }
}

function hideAlert(alertId) {
    var alertBox = document.getElementById(alertId);
    alertBox.style.display = "none";
    alertBox.className = "alert";
}

function showErrorMsg(elementId) {
    document.getElementById(elementId).style.display = "block";
}

function hideErrorMsg(elementId) {
    document.getElementById(elementId).style.display = "none";
}

function markError(inputId) {
    document.getElementById(inputId).style.borderColor = "#e24b4a";
}

function clearError(inputId) {
    document.getElementById(inputId).style.borderColor = "";
}


// =============================================
//   TOGGLE PASSWORD VISIBILITY
// =============================================

function togglePassword(inputId, buttonId) {
    var input  = document.getElementById(inputId);
    var button = document.getElementById(buttonId);

    if (input.type === "password") {
        input.type = "text";
        button.textContent = "🙈";
    } else {
        input.type = "password";
        button.textContent = "👁";
    }
}


// =============================================
//   LOGIN TABS
// =============================================

function switchLoginTab(tab) {
    var formSignIn = document.getElementById("formSignIn");
    var formSignUp = document.getElementById("formSignUp");
    var tabSignIn  = document.getElementById("tabSignIn");
    var tabSignUp  = document.getElementById("tabSignUp");

    if (tab === "signin") {
        formSignIn.style.display = "";
        formSignUp.style.display = "none";
        tabSignIn.classList.add("active");
        tabSignUp.classList.remove("active");
    } else {
        formSignIn.style.display = "none";
        formSignUp.style.display = "";
        tabSignIn.classList.remove("active");
        tabSignUp.classList.add("active");
    }

    hideAlert("signinAlert");
    hideAlert("signupAlert");
}


// =============================================
//   SIGN IN
// =============================================

function doLogin() {

    // Get values from form
    var email    = document.getElementById("signinEmail").value.trim().toLowerCase();
    var password = document.getElementById("signinPw").value;

    // Clear previous errors
    hideAlert("signinAlert");
    hideErrorMsg("signinEmailError");
    hideErrorMsg("signinPwError");
    clearError("signinEmail");
    clearError("signinPw");

    // Validate email
    var valid = true;

    if (email === "" || !isValidMIUEmail(email)) {
        showErrorMsg("signinEmailError");
        markError("signinEmail");
        valid = false;
    }

    // Validate password length
    if (password.length < 6) {
        showErrorMsg("signinPwError");
        markError("signinPw");
        valid = false;
    }

    // Stop if validation failed
    if (valid === false) {
        return;
    }

    // Check if admin
    var extraAdmins = getData("extraAdmins");
    var adminAccount = null;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        adminAccount = { email: ADMIN_EMAIL, name: ADMIN_NAME };
    }

    // Check extra admins
    for (var i = 0; i < extraAdmins.length; i++) {
        if (extraAdmins[i].email === email && extraAdmins[i].password === password) {
            adminAccount = extraAdmins[i];
        }
    }

    if (adminAccount !== null) {
        saveSession({ email: email, role: "admin", name: adminAccount.name });
        updateNav();
        localStorage.removeItem("miu_redirect");
        showPage("admin");
        return;
    }

    // Check regular users
    var users = getData("miu_users");
    var foundUser = null;

    for (var j = 0; j < users.length; j++) {
        if (users[j].email === email && users[j].password === password) {
            foundUser = users[j];
        }
    }

    if (foundUser !== null) {
        saveSession({ email: email, role: "user", name: foundUser.name });
        updateNav();

        // Go to the page they were trying to visit, or home
        var redirect = localStorage.getItem("miu_redirect");
        localStorage.removeItem("miu_redirect");

        if (redirect !== null) {
            showPage(redirect);
        } else {
            showPage("home");
        }

        showToast("Welcome back, " + foundUser.name + " 🎭", "ok");
        return;
    }

    // If nothing matched
    showAlert("signinAlert", "Incorrect email or password. Please try again.", "error");
}


// =============================================
//   SIGN UP
// =============================================

function doSignup() {

    // Get values from form
    var name      = document.getElementById("signupName").value.trim();
    var email     = document.getElementById("signupEmail").value.trim().toLowerCase();
    var password  = document.getElementById("signupPw").value;
    var password2 = document.getElementById("signupPw2").value;

    // Clear previous errors
    hideAlert("signupAlert");
    hideErrorMsg("signupNameError");
    hideErrorMsg("signupEmailError");
    hideErrorMsg("signupPwError");
    hideErrorMsg("signupPw2Error");
    clearError("signupName");
    clearError("signupEmail");
    clearError("signupPw");
    clearError("signupPw2");

    // Validate
    var valid = true;

    if (name === "") {
        showErrorMsg("signupNameError");
        markError("signupName");
        valid = false;
    }

    if (email === "" || !isValidMIUEmail(email)) {
        showErrorMsg("signupEmailError");
        markError("signupEmail");
        valid = false;
    }

    if (password.length < 6) {
        showErrorMsg("signupPwError");
        markError("signupPw");
        valid = false;
    }

    if (password !== password2) {
        showErrorMsg("signupPw2Error");
        markError("signupPw2");
        valid = false;
    }

    if (valid === false) {
        return;
    }

    // Check if email already registered
    var users = getData("miu_users");

    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            showAlert("signupAlert", "This email is already registered. Please sign in.", "error");
            return;
        }
    }

    // Save new user
    users.push({ name: name, email: email, password: password });
    saveData("miu_users", users);

    // Log in automatically
    saveSession({ email: email, role: "user", name: name });
    updateNav();

    // Go to the page they were trying to visit, or home
    var redirect = localStorage.getItem("miu_redirect");
    localStorage.removeItem("miu_redirect");

    if (redirect !== null) {
        showPage(redirect);
    } else {
        showPage("home");
    }

    showToast("Account created! Welcome, " + name + " 🎭", "ok");
}


// =============================================
//   LOGOUT
// =============================================

function doLogout() {
    clearSession();
    updateNav();
    showPage("home");
    showToast("Signed out successfully.", "ok");
}


// =============================================
//   CONTACT FORM
// =============================================

function submitContact() {

    var firstName = document.getElementById("ctFirstName").value.trim();
    var email     = document.getElementById("ctEmail").value.trim();
    var message   = document.getElementById("ctMessage").value.trim();
    var lastName = document.getElementById("ctLastName").value.trim();

    hideAlert("contactAlert");

    // Validate required fields
    if (firstName === "" || message === "") {
        showAlert("contactAlert", "Please fill in all required fields.", "error");
        return;
    }

    // If user is NOT logged in — validate the email they typed
    var session = getSession();
    if (session === null) {
        if (email === "") {
            showAlert("contactAlert", "Please enter your MIU email.", "error");
            return;
        }
        if (!isValidMIUEmail(email)) {
            showAlert("contactAlert", "Please use your MIU email (@miuegypt.edu.eg).", "error");
            return;
        }
    }

    // Success — save message to localStorage
    var messages = getData("contact_messages");
    messages.push({
        firstName: firstName,
        lastName:  lastName,
        email:     email,
        subject:   document.getElementById("ctSubject").value,
        message:   message,
        date:      new Date().toLocaleDateString()
    });
    saveData("contact_messages", messages);

    showAlert("contactAlert", "Your message has been sent! We'll get back to you within 1–2 business days.", "success");
    updateAdminBadges();

    // Clear form (but keep email if logged in)
    document.getElementById("ctFirstName").value = "";
    document.getElementById("ctLastName").value  = "";
    document.getElementById("ctSubject").value   = "";
    document.getElementById("ctMessage").value   = "";

    // Only clear email if user typed it themselves (not auto-filled)
    if (session === null) {
        document.getElementById("ctEmail").value = "";
    }
}


// =============================================
//   AUDITIONS FORM
// =============================================

function submitAudition() {

    var name  = document.getElementById("audName").value.trim();
    var email = document.getElementById("audEmail").value.trim().toLowerCase();
    var check1 = document.getElementById("audCheck1").checked;
    var check2 = document.getElementById("audCheck2").checked;

    hideAlert("auditionAlert");

    // Validate
    if (name === "" || email === "") {
        showAlert("auditionAlert", "Please fill in Name and Email.", "error");
        return;
    }

    if (!isValidMIUEmail(email)) {
        showAlert("auditionAlert", "Please use your MIU email.", "error");
        return;
    }

    if (check1 === false || check2 === false) {
        showAlert("auditionAlert", "Please confirm both commitment checkboxes.", "error");
        return;
    }

    // Save to localStorage
    var applications = getData("auditions");
    applications.push({
        name:       name,
        email:      email,
        faculty:    document.getElementById("audFaculty").value,
        experience: document.getElementById("audExperience").value,
        why:        document.getElementById("audWhy").value,
        date:       new Date().toLocaleDateString(),
        status:     "pending"
    });
    saveData("auditions", applications);

    // Show success screen
    document.getElementById("auditionForm").style.display    = "none";
    document.getElementById("auditionSuccess").style.display = "block";

    // Update admin badges
    updateAdminBadges();
}


// =============================================
//   ACTING INTERVIEW FORM
// =============================================

function submitActing() {

    var name   = document.getElementById("actName").value.trim();
    var email  = document.getElementById("actEmail").value.trim().toLowerCase();
    var arabic = document.getElementById("actArabic").value;
    var check1 = document.getElementById("actCheck1").checked;
    var check2 = document.getElementById("actCheck2").checked;
    var check3 = document.getElementById("actCheck3").checked;

    hideAlert("actingAlert");

    if (name === "" || email === "" || arabic === "") {
        showAlert("actingAlert", "Please fill in all required fields.", "error");
        return;
    }

    if (!isValidMIUEmail(email)) {
        showAlert("actingAlert", "Please use your MIU email.", "error");
        return;
    }

    if (check1 === false || check2 === false || check3 === false) {
        showAlert("actingAlert", "Please confirm all commitment checkboxes.", "error");
        return;
    }

    var applications = getData("acting_interviews");
    applications.push({
        name:         name,
        email:        email,
        arabic:       arabic,
        commitment:   "Confirmed",
        experience:   document.getElementById("actExperience").value,
        role:         document.getElementById("actRole").value,
        availability: document.getElementById("actAvailability").value,
        date:         new Date().toLocaleDateString(),
        status:       "pending"
    });
    saveData("acting_interviews", applications);

    document.getElementById("actingForm").style.display    = "none";
    document.getElementById("actingSuccess").style.display = "block";

    updateAdminBadges();
}


// =============================================
//   SCRIPT SUBMISSION FORM
// =============================================

function submitScript() {

    var name  = document.getElementById("scrName").value.trim();
    var email = document.getElementById("scrEmail").value.trim().toLowerCase();
    var title = document.getElementById("scrTitle").value.trim();
    var check1 = document.getElementById("scrCheck1").checked;

    hideAlert("scriptAlert");

    if (name === "" || email === "" || title === "") {
        showAlert("scriptAlert", "Please fill in Name, Email, and Script Title.", "error");
        return;
    }

    if (!isValidMIUEmail(email)) {
        showAlert("scriptAlert", "Please use your MIU email.", "error");
        return;
    }

    if (check1 === false) {
        showAlert("scriptAlert", "Please confirm the ownership checkbox.", "error");
        return;
    }

    var scripts = getData("scripts");
    scripts.push({
        name:        name,
        email:       email,
        title:       title,
        genre:       document.getElementById("scrGenre").value,
        language:    document.getElementById("scrLanguage").value,
        description: document.getElementById("scrDescription").value,
        cast:        document.getElementById("scrCast").value,
        link:        document.getElementById("scrLink").value,
        date:        new Date().toLocaleDateString(),
        status:      "pending"
    });
    saveData("scripts", scripts);

    document.getElementById("scriptForm").style.display    = "none";
    document.getElementById("scriptSuccess").style.display = "block";

    updateAdminBadges();
}


// =============================================
//   EXIT INTERVIEW FORM
// =============================================

function submitExit() {

    var name   = document.getElementById("exitName").value.trim();
    var email  = document.getElementById("exitEmail").value.trim().toLowerCase();
    var reason = document.getElementById("exitReason").value;
    var check1 = document.getElementById("exitCheck1").checked;

    hideAlert("exitAlert");

    if (name === "" || email === "" || reason === "") {
        showAlert("exitAlert", "Please fill in all required fields.", "error");
        return;
    }

    if (!isValidMIUEmail(email)) {
        showAlert("exitAlert", "Please use your MIU email.", "error");
        return;
    }

    if (check1 === false) {
        showAlert("exitAlert", "Please confirm the checkbox.", "error");
        return;
    }

    var exits = getData("exit_interviews");
    exits.push({
        name:     name,
        email:    email,
        reason:   reason,
        comments: document.getElementById("exitComments").value,
        date:     new Date().toLocaleDateString(),
        status:   "pending"
    });
    saveData("exit_interviews", exits);

    document.getElementById("exitForm").style.display    = "none";
    document.getElementById("exitSuccess").style.display = "block";

    updateAdminBadges();
}


// =============================================
//   SOCIAL LINKS
// =============================================

function getSocialLinks() {
    var data = localStorage.getItem("miu_social");
    if (data === null) {
        return { ig: "#", tt: "#" };
    }
    return JSON.parse(data);
}

function loadSocialLinks() {
    var social = getSocialLinks();

    var igLink = document.getElementById("igLink");
    var ttLink = document.getElementById("ttLink");

    if (igLink !== null) {
        igLink.href = social.ig || "#";
    }
    if (ttLink !== null) {
        ttLink.href = social.tt || "#";
    }
}

function saveSocialLinks() {
    var igValue = document.getElementById("socialIG").value.trim();
    var ttValue = document.getElementById("socialTT").value.trim();

    localStorage.setItem("miu_social", JSON.stringify({ ig: igValue, tt: ttValue }));

    loadSocialLinks();
    showToast("✅ Social links saved!", "ok");
}


// =============================================
//   DEADLINES RENDERING
// =============================================

function getDaysLeft(dateString) {
    var deadline = new Date(dateString);
    var today    = new Date();
    var diff     = deadline - today;
    var days     = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
        return 0;
    }
    return days;
}

function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function buildDeadlineCard(item) {
    var days = getDaysLeft(item.date);
    var daysText = days === 1 ? "day left" : "days left";

    var card = '<div class="deadline-card">';
    card += '<div class="deadline-label">' + (item.category || "Event") + '</div>';
    card += '<h4>' + item.title + '</h4>';
    card += '<div class="deadline-date">📅 ' + formatDate(item.date) + '</div>';
    card += '<div class="countdown">' + days + '<small>' + daysText + '</small></div>';
    card += '</div>';

    return card;
}

function renderHomeDeadlines() {
    var container = document.getElementById("homeDeadlines");
    if (container === null) { return; }

    var deadlines = getData("deadlines");

    if (deadlines.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:14.5px;">No upcoming deadlines yet. Check back soon.</p>';
        return;
    }

    var html = "";
    var limit = Math.min(4, deadlines.length);

    for (var i = 0; i < limit; i++) {
        html += buildDeadlineCard(deadlines[i]);
    }

    container.innerHTML = html;
}

function renderDeadlinesPage() {
    var container = document.getElementById("deadlinesOutput");
    if (container === null) { return; }

    var deadlines = getData("deadlines");

    if (deadlines.length === 0) {
        container.innerHTML = '<div class="empty-state"><span>⏰</span><p>No deadlines added yet.</p></div>';
        return;
    }

    var html = "";
    for (var i = 0; i < deadlines.length; i++) {
        html += buildDeadlineCard(deadlines[i]);
    }

    container.innerHTML = html;
}


// =============================================
//   WORKSHOPS RENDERING
// =============================================

function renderWorkshops() {
    var container = document.getElementById("workshopsOutput");
    if (container === null) { return; }

    var workshops = getData("workshops");

    if (workshops.length === 0) {
        container.innerHTML = '<div class="empty-state"><span>🛠</span><p>No workshops scheduled yet. Check back soon.</p></div>';
        return;
    }

    var html = '<div class="content-grid">';

    for (var i = 0; i < workshops.length; i++) {
        var w = workshops[i];
        html += '<div class="content-card">';
        html += '<div class="content-card-date">' + (w.date ? formatDate(w.date) : "Date TBA") + '</div>';
        html += '<h3>' + w.title + '</h3>';
        html += '<p>' + (w.desc || "") + '</p>';
        html += '<div class="content-card-meta">';
        if (w.time)     { html += '<span>🕐 ' + w.time + '</span>'; }
        if (w.location) { html += '<span>📍 ' + w.location + '</span>'; }
        html += '</div>';
        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
}


// =============================================
//   REHEARSALS RENDERING
// =============================================

function renderRehearsals() {
    var container = document.getElementById("rehearsalsOutput");
    if (container === null) { return; }

    var rehearsals = getData("rehearsals");

    if (rehearsals.length === 0) {
        container.innerHTML = '<div class="empty-state"><span>🎥</span><p>No rehearsal videos added yet.</p></div>';
        return;
    }

    var html = '<div class="content-grid">';

    for (var i = 0; i < rehearsals.length; i++) {
        var r = rehearsals[i];
        html += '<div class="content-card">';
        html += '<h3>' + r.title + '</h3>';
        if (r.date) { html += '<div class="content-card-date">📅 ' + formatDate(r.date) + '</div>'; }
        html += '<a href="' + r.link + '" target="_blank" class="watch-btn">▶ Watch Recording</a>';
        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
}


// =============================================
//   ADMIN PAGE
// =============================================

function initAdminPage() {
    var session = getSession();
    if (session === null || session.role !== "admin") { return; }

    var emailBadge = document.getElementById("adminEmailBadge");
    if (emailBadge !== null) {
        emailBadge.textContent = session.email;
    }

    // Load social link values into inputs
    var social = getSocialLinks();
    var igInput = document.getElementById("socialIG");
    var ttInput = document.getElementById("socialTT");
    if (igInput !== null) { igInput.value = social.ig || ""; }
    if (ttInput !== null) { ttInput.value = social.tt || ""; }

    // Always refresh badges and dashboard with latest data
    updateAdminBadges();
    renderDashboard();
}

var adminPanelTitles = {
    dashboard:  "Dashboard",
    auditions:  "Audition Applications",
    acting:     "Acting Interview Applications",
    exit:       "Exit Interview Requests",
    scripts:    "Script Submissions",
    workshops:  "Workshops",
    deadlines:  "Deadlines",
    rehearsals: "Rehearsal Videos",
    social:     "Social Links",
    messages:   "Contact Messages",
    admins:     "Manage Admins"
};

function adminGoTo(panelName, button) {

    // Hide all panels
    var allPanels = document.querySelectorAll(".admin-panel");
    for (var i = 0; i < allPanels.length; i++) {
        allPanels[i].classList.remove("active");
    }

    // Remove active from all sidebar buttons
    var allBtns = document.querySelectorAll(".sidebar-btn");
    for (var j = 0; j < allBtns.length; j++) {
        allBtns[j].classList.remove("active");
    }

    // Show selected panel
    var panel = document.getElementById("adminPanel-" + panelName);
    if (panel !== null) {
        panel.classList.add("active");
    }

    // Activate clicked button
    if (button !== null) {
        button.classList.add("active");
    }

    // Update title
    var titleEl = document.getElementById("adminPanelTitle");
    if (titleEl !== null) {
        titleEl.textContent = adminPanelTitles[panelName] || panelName;
    }

    // Render the selected panel
    renderAdminPanel(panelName);
}

function renderAdminPanel(panelName) {
    if (panelName === "dashboard")  { renderDashboard(); }
    if (panelName === "auditions")  { renderAdminTable("auditions",         "tableAud",   "countAud",  ["Name","Email","Faculty","Date","Status","Actions"]); }
    if (panelName === "acting")     { renderAdminTable("acting_interviews",  "tableAct",   "countAct",  ["Name","Email","Arabic Level","Date","Status","Actions"]); }
    if (panelName === "exit")       { renderAdminTable("exit_interviews",    "tableExit",  "countExit", ["Name","Email","Reason","Date","Status","Actions"]); }
    if (panelName === "scripts")    { renderAdminScripts(); }
    if (panelName === "workshops")  { renderAdminWorkshops(); }
    if (panelName === "deadlines")  { renderAdminDeadlines(); }
    if (panelName === "rehearsals") { renderAdminRehearsals(); }
    if (panelName === "messages")   { renderAdminMessages(); }
    if (panelName === "admins")     { renderAdminAccounts(); }
}

function updateAdminBadges() {
    var audBadge  = document.getElementById("badgeAud");
    var actBadge  = document.getElementById("badgeAct");
    var exitBadge = document.getElementById("badgeExit");
    var scrBadge  = document.getElementById("badgeScr");
    var msgBadge  = document.getElementById("badgeMsg");

    if (audBadge  !== null) { audBadge.textContent  = getData("auditions").filter(function(x) { return x.status === "pending"; }).length; }
    if (actBadge  !== null) { actBadge.textContent  = getData("acting_interviews").filter(function(x) { return x.status === "pending"; }).length; }
    if (exitBadge !== null) { exitBadge.textContent = getData("exit_interviews").filter(function(x) { return x.status === "pending"; }).length; }
    if (scrBadge  !== null) { scrBadge.textContent  = getData("scripts").filter(function(x) { return x.status === "pending"; }).length; }
    if (msgBadge  !== null) { msgBadge.textContent  = getData("contact_messages").length; }
}

function renderDashboard() {
    var audPending  = getData("auditions").filter(function(x) { return x.status === "pending"; }).length;
    var actPending  = getData("acting_interviews").filter(function(x) { return x.status === "pending"; }).length;
    var scrPending  = getData("scripts").filter(function(x) { return x.status === "pending"; }).length;
    var exitPending = getData("exit_interviews").filter(function(x) { return x.status === "pending"; }).length;

    var container = document.getElementById("dashboardStats");
    if (container === null) { return; }

    container.innerHTML =
        '<div class="stat-card red"><div class="stat-label">Pending Auditions</div><div class="stat-number">' + audPending + '</div></div>' +
        '<div class="stat-card red"><div class="stat-label">Pending Acting</div><div class="stat-number">' + actPending + '</div></div>' +
        '<div class="stat-card red"><div class="stat-label">Pending Scripts</div><div class="stat-number">' + scrPending + '</div></div>' +
        '<div class="stat-card red"><div class="stat-label">Exit Requests</div><div class="stat-number">' + exitPending + '</div></div>' +
        '<div class="stat-card"><div class="stat-label">Contact Messages</div><div class="stat-number">' + getData("contact_messages").length + '</div></div>' +
        '<div class="stat-card"><div class="stat-label">Workshops</div><div class="stat-number">' + getData("workshops").length + '</div></div>' +
        '<div class="stat-card"><div class="stat-label">Deadlines</div><div class="stat-number">' + getData("deadlines").length + '</div></div>' +
        '<div class="stat-card"><div class="stat-label">Rehearsal Videos</div><div class="stat-number">' + getData("rehearsals").length + '</div></div>' +
        '<div class="stat-card"><div class="stat-label">Registered Users</div><div class="stat-number">' + getData("miu_users").length + '</div></div>';
}

function renderAdminTable(key, containerId, countId, headers) {
    var data    = getData(key);
    var pending = data.filter(function(x) { return x.status === "pending"; }).length;

    document.getElementById(countId).textContent = pending + " pending";

    var container = document.getElementById(containerId);
    if (container === null) { return; }

    if (data.length === 0) {
        container.innerHTML = '<div class="admin-empty"><span>📋</span><p>No submissions yet.</p></div>';
        return;
    }

    var html = '<table><thead><tr>';
    for (var h = 0; h < headers.length; h++) {
        html += '<th>' + headers[h] + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var statusBadge = '<span class="status-badge ' + item.status + '">' + item.status + '</span>';

        var actions = "";
        if (item.status === "pending") {
            actions = '<div class="action-buttons">' +
                      '<button class="btn-approve" onclick="adminAction(\'' + key + '\',' + i + ',\'approved\')">Approve</button>' +
                      '<button class="btn-reject"  onclick="adminAction(\'' + key + '\',' + i + ',\'rejected\')">Reject</button>' +
                      '</div>';
        } else {
            actions = '<button class="btn-delete" onclick="adminDelete(\'' + key + '\',' + i + ')">Delete</button>';
        }

        html += '<tr>';

        if (key === "auditions") {
            html += '<td>' + item.name + '</td><td>' + item.email + '</td><td>' + (item.faculty || "-") + '</td><td>' + (item.date || "-") + '</td><td>' + statusBadge + '</td><td>' + actions + '</td>';
        }
        if (key === "acting_interviews") {
            html += '<td>' + item.name + '</td><td>' + item.email + '</td><td style="font-size:11px; max-width:110px;">' + (item.arabic || "-") + '</td><td>' + (item.date || "-") + '</td><td>' + statusBadge + '</td><td>' + actions + '</td>';
        }
        if (key === "exit_interviews") {
            html += '<td>' + item.name + '</td><td>' + item.email + '</td><td>' + (item.reason || "-") + '</td><td>' + (item.date || "-") + '</td><td>' + statusBadge + '</td><td>' + actions + '</td>';
        }

        html += '</tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderAdminScripts() {
    var data    = getData("scripts");
    var pending = data.filter(function(x) { return x.status === "pending"; }).length;

    document.getElementById("countScr").textContent = pending + " pending";

    var container = document.getElementById("tableScr");
    if (container === null) { return; }

    if (data.length === 0) {
        container.innerHTML = '<div class="admin-empty"><span>📜</span><p>No scripts yet.</p></div>';
        return;
    }

    var html = '<table><thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>Language</th><th>Link</th><th>Status</th><th>Actions</th></tr></thead><tbody>';

    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var statusBadge = '<span class="status-badge ' + item.status + '">' + item.status + '</span>';
        var linkHtml = item.link ? '<a href="' + item.link + '" target="_blank" style="color:var(--red); font-size:12px;">View ↗</a>' : '-';

        var actions = "";
        if (item.status === "pending") {
            actions = '<div class="action-buttons">' +
                      '<button class="btn-approve" onclick="adminAction(\'scripts\',' + i + ',\'approved\')">Approve → OOA</button>' +
                      '<button class="btn-reject"  onclick="adminAction(\'scripts\',' + i + ',\'rejected\')">Reject</button>' +
                      '</div>';
        } else {
            actions = '<button class="btn-delete" onclick="adminDelete(\'scripts\',' + i + ')">Delete</button>';
        }

        html += '<tr><td><strong>' + item.title + '</strong></td><td>' + item.name + '</td><td>' + (item.genre || "-") + '</td><td>' + (item.language || "-") + '</td><td>' + linkHtml + '</td><td>' + statusBadge + '</td><td>' + actions + '</td></tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

function adminAction(key, index, status) {
    var data = getData(key);
    data[index].status = status;
    saveData(key, data);

    if (key === "auditions")        { renderAdminTable("auditions",        "tableAud",  "countAud",  ["Name","Email","Faculty","Date","Status","Actions"]); }
    if (key === "acting_interviews") { renderAdminTable("acting_interviews","tableAct",  "countAct",  ["Name","Email","Arabic Level","Date","Status","Actions"]); }
    if (key === "exit_interviews")   { renderAdminTable("exit_interviews",  "tableExit", "countExit", ["Name","Email","Reason","Date","Status","Actions"]); }
    if (key === "scripts")           { renderAdminScripts(); }

    updateAdminBadges();
    renderDashboard();

    if (status === "approved") {
        showToast("✅ Approved!", "ok");
    } else {
        showToast("❌ Rejected", "er");
    }
}

function adminDelete(key, index) {
    var data = getData(key);
    data.splice(index, 1);
    saveData(key, data);

    if (key === "auditions")        { renderAdminTable("auditions",        "tableAud",  "countAud",  ["Name","Email","Faculty","Date","Status","Actions"]); }
    if (key === "acting_interviews") { renderAdminTable("acting_interviews","tableAct",  "countAct",  ["Name","Email","Arabic Level","Date","Status","Actions"]); }
    if (key === "exit_interviews")   { renderAdminTable("exit_interviews",  "tableExit", "countExit", ["Name","Email","Reason","Date","Status","Actions"]); }
    if (key === "scripts")           { renderAdminScripts(); }
    if (key === "workshops")         { renderAdminWorkshops(); }
    if (key === "deadlines")         { renderAdminDeadlines(); }
    if (key === "rehearsals")        { renderAdminRehearsals(); }

    updateAdminBadges();
    showToast("🗑 Deleted", "er");
}

function renderAdminWorkshops() {
    var data      = getData("workshops");
    var container = document.getElementById("tableWs");
    if (container === null) { return; }

    if (data.length === 0) {
        container.innerHTML = '<div class="admin-empty"><span>🛠</span><p>No workshops yet.</p></div>';
        return;
    }

    var html = '<table><thead><tr><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Actions</th></tr></thead><tbody>';
    for (var i = 0; i < data.length; i++) {
        html += '<tr><td><strong>' + data[i].title + '</strong></td><td>' + (data[i].date || "-") + '</td><td>' + (data[i].time || "-") + '</td><td>' + (data[i].location || "-") + '</td><td><button class="btn-delete" onclick="adminDelete(\'workshops\',' + i + ')">Delete</button></td></tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderAdminDeadlines() {
    var data      = getData("deadlines");
    var container = document.getElementById("tableDl");
    if (container === null) { return; }

    if (data.length === 0) {
        container.innerHTML = '<div class="admin-empty"><span>⏰</span><p>No deadlines yet.</p></div>';
        return;
    }

    var html = '<table><thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
    for (var i = 0; i < data.length; i++) {
        html += '<tr><td><strong>' + data[i].title + '</strong></td><td>' + (data[i].category || "-") + '</td><td>' + (data[i].date || "-") + '</td><td><button class="btn-delete" onclick="adminDelete(\'deadlines\',' + i + ')">Delete</button></td></tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderAdminRehearsals() {
    var data      = getData("rehearsals");
    var container = document.getElementById("tableReh");
    if (container === null) { return; }

    if (data.length === 0) {
        container.innerHTML = '<div class="admin-empty"><span>🎥</span><p>No videos yet.</p></div>';
        return;
    }

    var html = '<table><thead><tr><th>Title</th><th>Date</th><th>Link</th><th>Actions</th></tr></thead><tbody>';
    for (var i = 0; i < data.length; i++) {
        html += '<tr><td><strong>' + data[i].title + '</strong></td><td>' + (data[i].date || "-") + '</td><td><a href="' + data[i].link + '" target="_blank" style="color:var(--red); font-size:12px;">Open ↗</a></td><td><button class="btn-delete" onclick="adminDelete(\'rehearsals\',' + i + ')">Delete</button></td></tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function addWorkshop() {
    var title    = document.getElementById("wsTitle").value.trim();
    var date     = document.getElementById("wsDate").value;
    var time     = document.getElementById("wsTime").value.trim();
    var location = document.getElementById("wsLocation").value.trim();
    var desc     = document.getElementById("wsDesc").value.trim();

    if (title === "" || date === "") {
        showToast("⚠️ Title and date are required", "er");
        return;
    }

    var workshops = getData("workshops");
    workshops.push({ title: title, date: date, time: time, location: location, desc: desc });
    saveData("workshops", workshops);

    document.getElementById("wsTitle").value    = "";
    document.getElementById("wsDate").value     = "";
    document.getElementById("wsTime").value     = "";
    document.getElementById("wsLocation").value = "";
    document.getElementById("wsDesc").value     = "";

    renderAdminWorkshops();
    renderDashboard();
    showToast("✅ Workshop added!", "ok");
}

function addDeadline() {
    var title    = document.getElementById("dlTitle").value.trim();
    var category = document.getElementById("dlCategory").value.trim();
    var date     = document.getElementById("dlDate").value;

    if (title === "" || date === "") {
        showToast("⚠️ Title and date are required", "er");
        return;
    }

    var deadlines = getData("deadlines");
    deadlines.push({ title: title, category: category, date: date });
    saveData("deadlines", deadlines);

    document.getElementById("dlTitle").value    = "";
    document.getElementById("dlCategory").value = "";
    document.getElementById("dlDate").value     = "";

    renderAdminDeadlines();
    renderDashboard();
    showToast("✅ Deadline added!", "ok");
}

function addRehearsal() {
    var title = document.getElementById("rehTitle").value.trim();
    var date  = document.getElementById("rehDate").value;
    var link  = document.getElementById("rehLink").value.trim();

    if (title === "" || link === "") {
        showToast("⚠️ Title and link are required", "er");
        return;
    }

    var rehearsals = getData("rehearsals");
    rehearsals.push({ title: title, date: date, link: link });
    saveData("rehearsals", rehearsals);

    document.getElementById("rehTitle").value = "";
    document.getElementById("rehDate").value  = "";
    document.getElementById("rehLink").value  = "";

    renderAdminRehearsals();
    renderDashboard();
    showToast("✅ Video link added!", "ok");
}

function renderAdminMessages() {
    var data      = getData("contact_messages");
    var container = document.getElementById("tableMsg");

    if (container === null) { return; }

    document.getElementById("countMsg").textContent = data.length + " messages";

    if (data.length === 0) {
        container.innerHTML = '<div class="admin-empty"><span>✉️</span><p>No contact messages yet.</p></div>';
        return;
    }

    var html = '<table><thead><tr>';
    html += '<th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th><th>Actions</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < data.length; i++) {
        var item     = data[i];
        var fullName = item.firstName + (item.lastName ? " " + item.lastName : "");

        html += '<tr>';
        html += '<td>' + fullName + '</td>';
        html += '<td>' + item.email + '</td>';
        html += '<td>' + (item.subject || "-") + '</td>';
        html += '<td style="max-width:220px; font-size:11.5px;">' + item.message + '</td>';
        html += '<td>' + (item.date || "-") + '</td>';
        html += '<td><button class="btn-delete" onclick="deleteMessage(' + i + ')">Delete</button></td>';
        html += '</tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

function deleteMessage(index) {
    var data = getData("contact_messages");
    data.splice(index, 1);
    saveData("contact_messages", data);
    renderAdminMessages();
    updateAdminBadges();
    renderDashboard();
    showToast("🗑 Message deleted", "er");
}

function renderAdminAccounts() {
    var container = document.getElementById("adminsList");
    if (container === null) { return; }

    var extraAdmins = getData("extraAdmins");
    var html = "";

    html += '<div class="admin-row"><span class="email">' + ADMIN_EMAIL + '</span><span class="tag">Built-in</span></div>';

    for (var i = 0; i < extraAdmins.length; i++) {
        html += '<div class="admin-row"><span class="email">' + extraAdmins[i].email + ' — ' + extraAdmins[i].name + '</span><span class="tag">Admin</span></div>';
    }

    container.innerHTML = html;
}

function addAdmin() {
    var name     = document.getElementById("newAdminName").value.trim();
    var email    = document.getElementById("newAdminEmail").value.trim().toLowerCase();
    var password = document.getElementById("newAdminPw").value;

    if (name === "" || email === "" || password === "") {
        showToast("⚠️ All fields are required", "er");
        return;
    }

    if (!isValidMIUEmail(email)) {
        showToast("⚠️ Must use @miuegypt.edu.eg email", "er");
        return;
    }

    if (password.length < 8) {
        showToast("⚠️ Password must be at least 8 characters", "er");
        return;
    }

    var extraAdmins = getData("extraAdmins");

    if (email === ADMIN_EMAIL) {
        showToast("⚠️ This email is already an admin", "er");
        return;
    }

    for (var i = 0; i < extraAdmins.length; i++) {
        if (extraAdmins[i].email === email) {
            showToast("⚠️ This email is already an admin", "er");
            return;
        }
    }

    extraAdmins.push({ name: name, email: email, password: password });
    saveData("extraAdmins", extraAdmins);

    document.getElementById("newAdminName").value  = "";
    document.getElementById("newAdminEmail").value = "";
    document.getElementById("newAdminPw").value    = "";

    renderAdminAccounts();
    showToast("✅ Admin account created!", "ok");
}


// =============================================
//   INIT (runs when page loads)
// =============================================

initDarkMode();
updateNav();
loadSocialLinks();
updateAdminBadges();
renderHomeDeadlines();