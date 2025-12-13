import { removeToken } from "/js/utils/storage.js";
import { removeUser } from "/js/utils/storage.js";

export function logout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.disabled = true;
        logoutBtn.textContent = "Logging out...";
    }
    removeToken();
    setTimeout(() => {
        removeToken();
        removeUser();
        window.location.href = "/index.html";
    }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logout();
        });
    }
})