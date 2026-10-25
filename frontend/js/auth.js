// ================= REGISTER =================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;
        }

        // Save user details temporarily
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", password);

        alert("Account created successfully!");

        window.location.href = "login.html";

    });
}


// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        const savedEmail =
            localStorage.getItem("userEmail");

        const savedPassword =
            localStorage.getItem("userPassword");


        if (
            email === savedEmail &&
            password === savedPassword
        ) {

            localStorage.setItem("loggedIn", "true");

            window.location.href = "dashboard.html";

        } else {

            alert("Invalid email or password.");

        }

    });
}


// ================= DASHBOARD =================

const userNameElement =
    document.getElementById("userName");

if (userNameElement) {

    const loggedIn =
        localStorage.getItem("loggedIn");

    if (loggedIn !== "true") {

        window.location.href = "login.html";

    }

    const userName =
        localStorage.getItem("userName");

    if (userName) {

        userNameElement.textContent = userName;

    }

}


// ================= LOGOUT =================

function logout() {

    localStorage.removeItem("loggedIn");

    window.location.href = "index.html";

}