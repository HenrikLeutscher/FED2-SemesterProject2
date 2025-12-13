import { getToken, getApiKey, getUser } from "/js/utils/storage.js";
import { PROFILES_API_URL } from "/js/config.js";

const token = getToken();

const header = document.querySelector("header");
const footer = document.querySelector("footer");

if (token) {
    header.innerHTML = `
    <div class="h-30 items-center flex justify-between px-5" id="HeaderNotLoggedIn">
        <a href="/index.html">
          <img src="/assets/images/DealeryLogoPhone.png" alt="Dealery Logo" class="md:hidden h-16" aria-label="Go to homepage">
          <img src="/assets/images/DealeryLogo.png" alt="Dealery Logo" class="hidden md:block h-16" aria-label="Go to homepage">
        </a>

        <nav class="hidden md:flex md:items-center md:space-x-6">
          <ul class="flex space-x-4 text-white font-semibold">
            <li class="nav-link p-2"><a href="/index.html" class="hover:text-yellow-300 hover:underline">Home</a></li>
            <li class="nav-link p-2"><a href="/pages/listings/listings.html" class="hover:text-yellow-300 hover:underline ">Auctions</a></li>
            <li class="nav-link p-2"><a href="/pages/createAuctionListing/createAuctionListing.html" class="hover:text-yellow-300 hover:underline">Create a listing +</a></li>
            
          </ul>
        </nav>

        <nav class="hidden md:flex md:items-center md:space-x-6">
          <ul class="flex space-x-4 text-white font-semibold">
            <li class="nav-link p-2"><a href="/pages/registerlogin/registerlogin.html" id="logoutBtn" class="hover:text-yellow-300 hover:underline">Log Out</a></li>
            <li class="p-2"><a class="navbar-credits bg-blue-400 px-5 py-2.5 rounded-xl"></a></li>
          </ul>
          <div class="hidden md:flex md:items-center md:space-x-4">
            <a href="/pages/profile/profile.html">
              <img id="navbar-avatar" src="/assets/icons/profile-placeholder.png" alt="Dealery Logo" class="h-15 w-15 rounded-full object-cover hover:h-20 hover:w-20">
            </a>
          </div>
        </nav>

        <div class="flex items-center gap-4 md:hidden">
          <a class="navbar-credits text-white p-2"></a>
          <button id="dropdownBtn" class="cursor-pointer" aria-label="Open dropdown menu">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="60" height="60" viewBox="0 0 24 24">
            <path d="M 3 5 A 1.0001 1.0001 0 1 0 3 7 L 21 7 A 1.0001 1.0001 0 1 0 21 5 L 3 5 z M 3 11 A 1.0001 1.0001 0 1 0 3 13 L 21 13 A 1.0001 1.0001 0 1 0 21 11 L 3 11 z M 3 17 A 1.0001 1.0001 0 1 0 3 19 L 21 19 A 1.0001 1.0001 0 1 0 21 17 L 3 17 z"></path>
          </svg>
          </button>
          <div class="hidden flex flex-col absolute right-0 top-47 mt-2 w-screen text-center bg-blue-900 overflow-hidden transition transform origin-top-right" id="DropDownNotLoggedIn">
            <li class="nav-link p-2 py-3"><a href="/index.html" class="text-white hover:text-blue-400">Home</a></li>
            <li class="nav-link p-2 py-3"><a href="/pages/listings/listings.html" class="text-white hover:text-blue-400">Auctions</a></li>
            <li class="nav-link p-2 py-3"><a href="/pages/profile/profile.html" class="text-white hover:text-blue-400">My Profile</a></li>
            <li class="nav-link p-2 py-3"><a href="/pages/createAuctionListing/createAuctionListing.html" class="text-white hover:text-blue-400">+ Create a listing</a></li>
            <li class="nav-link p-2 py-3"><a href="/pages/registerlogin/registerlogin.html" id="logoutBtn" class="text-white hover:text-blue-400">Log Out</a></li>
          </div>
        </div>
      </div>`

      footer.innerHTML = `
        <img src="/assets/images/DealeryLogo.png" alt="Dealery Logo" class="hidden md:block h-16">
        <div class="max-w-1/2 text-center order-2 flex flex-col items-center">
          <h2>Ready to start bidding?</h2>
          <p>Bid alongside all other Noroff Students and start your auction journey below!</p>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-900 transition border-white border block mx-auto md:mx-0 text-center"><a href="/pages/listings/listings.html" aria-label="See all listings">See all listings here!</a></button>
        </div>
        <img src="/assets/images/DealeryLogoPhone.png" alt="Dealery Logo" class="md:hidden h-20 my-10">
      `
      
      setTimeout(() => {
        loadNavbarProfileInfo();
      }, 0);
}


const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownNotLoggedIn = document.getElementById("DropDownNotLoggedIn");

dropdownBtn.addEventListener("click", function(event) {
    event.stopPropagation();
    dropdownNotLoggedIn.classList.toggle("hidden");
});

document.addEventListener("click", function () {
    if (!dropdownNotLoggedIn.classList.contains("hidden")) {
        dropdownNotLoggedIn.classList.add("hidden");
    }
});

// Highlight active page
const currentLink = window.location.pathname;
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
  const linkPath = new URL(link.querySelector("a").href).pathname;
  
  if (linkPath === currentLink) {
    link.classList.add("bg-blue-400");
  }
});

// Load profile info in navbar

async function loadNavbarProfileInfo() {
  const user = getUser();
    const token = getToken();
    const apiKey = getApiKey();

    try {
      const response = await fetch(`${PROFILES_API_URL}/${user.name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json"
        }
      });

      const { data } = await response.json();

      const navbarAvatar = document.getElementById("navbar-avatar");
      const navbarCredits = document.querySelectorAll(".navbar-credits");

      navbarAvatar.src = data.avatar?.url || "/assets/icons/profile-placeholder.png";

      navbarCredits.forEach(element => {
        element.textContent = `Credits: ${data.credits || 0}`;
      })

    } catch (error) {
      console.error("Error loading profile info:", error);
    }
}