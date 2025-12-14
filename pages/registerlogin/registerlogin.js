import { loginUser, registerUser } from "/js/api/auth.js";
import { saveToken, saveUser } from "/js/utils/storage.js";

// Toggle Sections

const loginToggleBtn = document.getElementById("login-toggle");
const loginContent = document.getElementById("login-content");

const registerToggleBtn = document.getElementById("register-toggle");
const registerContent = document.getElementById("register-content");

loginToggleBtn.addEventListener("click", () => {
  loginContent.classList.remove("hidden");
  registerContent.classList.add("hidden");
  document.title = "Login | Dealery";
  loginToggleBtn.classList.add("bg-blue-800");
  registerToggleBtn.classList.remove("bg-blue-800");
});

registerToggleBtn.addEventListener("click", () => {
  registerContent.classList.remove("hidden");
  loginContent.classList.add("hidden");
  document.title = "Register | Dealery";
  registerToggleBtn.classList.add("bg-blue-800");
  loginToggleBtn.classList.remove("bg-blue-800");
});

const loginForm = document.getElementById("login-form");
const loginErrorMessageDiv = document.querySelector(".login-error-message");
const registerErrorMessageDiv = document.querySelector(
  ".register-error-message"
);
const successMessageDiv = document.querySelector(".success-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const loginBtn = document.getElementById("login-btn");

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  if (!email || !password) {
    loginErrorMessageDiv.textContent =
      "Please ensure all fields are filled out.";
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
    return;
  }

  try {
    const loginResponse = await loginUser(email, password);

    const token = loginResponse.data.accessToken;
    saveToken(token);

    saveUser(loginResponse.data);

    successMessageDiv.classList.remove("hidden");

    successMessageDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-600 shrink-0" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="font-semibold text-lg leading-tight flex items-center">
          Successfully logged in! Redirecting...
        </span>`;

    setTimeout(() => {
      window.location.href = "/pages/profile/profile.html";
    }, 2000);
  } catch (error) {
    loginErrorMessageDiv.textContent = error.message;
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
});

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Register Form Values
  const registerUsername = document.getElementById("register-username").value;
  const registerEmail = document.getElementById("register-email").value;
  const registerPassword = document.getElementById("register-password").value;
  const registerConfirmPassword = document.getElementById(
    "register-confirm-password"
  ).value;
  const registerBtn = document.getElementById("register-btn");
  registerBtn.disabled = true;
  registerBtn.textContent = "Registering...";

  const userData = {
    name: registerUsername,
    email: registerEmail,
    password: registerPassword,
  };

  //
  if (!registerEmail.endsWith("@stud.noroff.no")) {
    registerErrorMessageDiv.textContent =
      "Email must be a Noroff student email.";
    registerBtn.disabled = false;
    registerBtn.textContent = "Register";
    return;
  }

  if (registerPassword !== registerConfirmPassword) {
    registerErrorMessageDiv.textContent = "Passwords do not match.";
    registerBtn.disabled = false;
    registerBtn.textContent = "Register";
    return;
  }

  if (
    !registerUsername ||
    !registerEmail ||
    !registerPassword ||
    !registerConfirmPassword
  ) {
    registerErrorMessageDiv.textContent =
      "Please ensure all fields are filled out.";
    registerBtn.disabled = false;
    registerBtn.textContent = "Register";
    return;
  }

  try {
    await registerUser(userData);

    const loginResponse = await loginUser(registerEmail, registerPassword);

    saveToken(loginResponse.data.accessToken);

    saveUser(loginResponse.data);

    successMessageDiv.classList.remove("hidden");

    successMessageDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-600 shrink-0" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="font-semibold text-lg leading-tight flex items-center">
          Successfully logged in! Redirecting...
        </span>`;

    setTimeout(() => {
      window.location.href = "/pages/profile/profile.html";
    }, 2000);
  } catch (error) {
    registerErrorMessageDiv.textContent = error.message;
    registerBtn.disabled = false;
    registerBtn.textContent = "Register";
  }
});
