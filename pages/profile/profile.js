import { getUser, getToken, getApiKey } from "/js/utils/storage.js";
import { PROFILES_API_URL } from "/js/config.js";
import { AUCTION_LISTINGS_URL } from "/js/config.js";
import { displayListings } from "/js/listings/displayListings.js";
import { startCountDown } from "/js/listings/countdown.js";

// Profile DOM Elements
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileAvatar = document.getElementById("profile-avatar");
const profileCredits = document.getElementById("profile-credits");
const profileContainer = document.getElementById("profile-container");
const profileBio = document.getElementById("profile-bio");
const profileBanner = document.getElementById("profile-banner");
const userListings = document.getElementById("user-listings");
const editProfileContent = document.getElementById("edit-profile-content");
const editProfileBtn = document.getElementById("edit-profile-btn");
const editProfileContainer = document.getElementById("edit-profile-container");
const userBidsContainer = document.getElementById("userBids");

const token = getToken();
const apiKey = getApiKey();

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const otherUserName = params.get("user");
  const loggedInUser = getUser();

  const userNameToLoad = otherUserName || loggedInUser?.name;

  const isOwnProfile = !otherUserName || otherUserName === loggedInUser?.name;

  // Stops not logged in user from viewing profiles
  if (!userNameToLoad) {
    profileContainer.innerHTML =
      "<p>Please <a href='/pages/registerlogin/registerlogin.html' class='underline text-green-600'>log in</a> to view your profile.</p>";
    return;
  }

  // hides edit profile section when not the user owner
  if (isOwnProfile) {
    editProfileContent.classList.remove("hidden");
  }

  editProfileBtn.addEventListener("click", () =>
    editProfileContainer.classList.toggle("hidden")
  );

  try {
    const profileData = await loadPublicUserProfile(userNameToLoad);

    displayProfile(profileData);
    await loadUserListings(profileData.name);
    loadUserProfileInput(profileData);
    loadUserBidListings(profileData);

    document.title = `${profileData.name}'s Profile`;
  } catch (error) {
    profileContainer.classList.add("border-red-400", "text-center");
    profileContainer.innerHTML = `
    <p>❌</p>
    <p>Profile could not be loaded:</p>
    <p>${error.message}</p>
  `;
  }
});

async function loadPublicUserProfile(username) {
  if (!token || !apiKey) {
    throw new Error(
      "Please <a href='/pages/registerlogin/registerlogin.html' class=\"hover:text-blue-400 underline\">Login or Register here</a> to view profiles!"
    );
  }

  const response = await fetch(
    `${PROFILES_API_URL}/${username}?_bids=true&_listings=true&_seller=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Noroff-API-Key": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile. Status: ${response.status}`);
  }

  const { data } = await response.json();
  return data;
}

export function displayProfile(user) {
  profileName.textContent = user.name || "No Name";
  profileEmail.textContent = user.email || "No Email";

  profileAvatar.src =
    user.avatar?.url ||
    user.avatar ||
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

  profileAvatar.alt = `${user.name}'s profile avatar`;

  if (profileBanner) {
    profileBanner.src =
      user.banner?.url ||
      user.banner ||
      "https://via.placeholder.com/800x200?text=Profile+Banner";

    profileBanner.alt = `${user.name}'s profile banner`;
  }

  if (profileBio) {
    profileBio.textContent = user.bio || "No bio available.";
  }

  profileCredits.textContent = user.credits ?? 0;
}

// Loading user listings
async function loadUserListings(username) {
  try {
    const response = await fetch(
      `${PROFILES_API_URL}/${username}/listings?_bids=true&_seller=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch user listings. Status: ${response.status}`
      );
    }

    const { data: listings } = await response.json();

    if (!listings.length) {
      userListings.innerHTML =
        "<p>This user does not have any active listings</p>";
      return;
    }

    // ✅ REUSE SHARED LISTING RENDERER
    displayListings(listings, userListings, false);
    startCountDown(userListings);
  } catch (error) {
    console.error("Error loading user listings:", error);
    userListings.innerHTML = "<p>Failed to load user listings.</p>";
  }
}

// Prefills user input when edit profile is pressed
async function loadUserProfileInput() {
  const avatarInput = document.getElementById("edit-avatar");
  const bannerInput = document.getElementById("edit-banner");
  const bioInput = document.getElementById("edit-bio");

  if (!avatarInput || !bannerInput || !bioInput) return;

  avatarInput.value = profileAvatar.src;
  bannerInput.value = profileBanner.src;
  bioInput.value = profileBio.textContent;
}

// Edit Profile Submit Handler

const saveProfileBtn = document.getElementById("save-profile-btn");
if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", updateProfile);
}

async function updateProfile() {
  const avatarInput = document.getElementById("edit-avatar").value;
  const bannerInput = document.getElementById("edit-banner").value;
  const bioInput = document.getElementById("edit-bio").value;
  const errorMessage = document.getElementById("error-message");
  saveProfileBtn.disabled = true;
  saveProfileBtn.textContent = "Saving...";
  errorMessage.textContent = "";
  const successMessageDiv = document.getElementById("success-message");

  const updatedData = {
    avatar: avatarInput ? { url: avatarInput } : "",
    banner: bannerInput ? { url: bannerInput } : "",
    bio: bioInput || "",
  };

  try {
    const response = await fetch(`${PROFILES_API_URL}/${getUser().name}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Noroff-API-Key": apiKey,
      },
      body: JSON.stringify(updatedData),
    });

    const result = await response.json();

    if (!response.ok) {
      errorMessage.textContent =
        result.errors?.[0]?.message || "Failed to update profile";
      saveProfileBtn.disabled = false;
      saveProfileBtn.textContent = "Save Changes";
      return;
    }

    successMessageDiv.classList.remove("hidden");
    successMessageDiv.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-600 shrink-0" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span class="font-semibold text-lg leading-tight flex items-center">
      Profile updated successfully! Reloading...
    </span>`;
    setTimeout(() => window.location.reload(), 2000);
  } catch (error) {
    errorMessage.textContent = "Error updating profile: " + error.message;
  }
}

// So the API returns 100 listings at max...
// So we need to loop through pages until we find the listings target has bid on.
async function loadUserBidListings(profileData) {
  if (!userBidsContainer) return;

  userBidsContainer.innerHTML =
    '<p class="text-center">Currently loading bid history.. Please wait.</p>';

  const targetName = profileData?.name;
  if (!targetName) {
    userBidsContainer.innerHTML = "<p>Missing username.</p>";
    return;
  }

  let matched = [];
  let page = 1;

  try {
    while (matched.length === 0) {
      const response = await fetch(
        `${AUCTION_LISTINGS_URL}?_bids=true&page=${page}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Noroff-API-Key": apiKey,
          },
        }
      );

      if (!response.ok)
        throw new Error(`Failed to fetch listings (page ${page})`);

      const result = await response.json();
      const listings = result.data || [];

      // nothing more to fetch
      if (listings.length === 0) break;

      const pageMatches = listings.filter((listing) =>
        listing.bids?.some((bid) => bid.bidder?.name === targetName)
      );

      matched.push(...pageMatches);

      // stop if last page
      if (result.meta?.isLastPage) break;

      page++;

      // tiny delay to reduce chance of 429
      await new Promise((r) => setTimeout(r, 200));
    }

    if (matched.length === 0) {
      userBidsContainer.innerHTML = "<p>This user has not placed any bids.</p>";
      return;
    }

    displayListings(matched, userBidsContainer, false);
    startCountDown(userBidsContainer);
  } catch (error) {
    console.error("Error loading bid listings:", error);
    userBidsContainer.innerHTML = "<p>Failed to load user bid history.</p>";
  }
}
