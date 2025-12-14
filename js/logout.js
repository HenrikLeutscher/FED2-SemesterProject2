import { removeToken, removeUser } from "/js/utils/storage.js";

document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("logout-btn")) return;

  event.preventDefault();

  event.target.textContent = "Logging out...";

  removeToken();
  removeUser();

  setTimeout(() => {
    window.location.href = "/index.html";
  }, 500);
});
