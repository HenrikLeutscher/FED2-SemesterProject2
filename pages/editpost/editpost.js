import { AUCTION_LISTINGS_URL } from "/js/config.js";
import { getToken, getApiKey } from "/js/utils/storage.js";

const token = getToken();
const apiKey = getApiKey();

const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

const form = document.getElementById("edit-listing-form");

const titleInput = document.getElementById("edit-listing-title");
const descInput = document.getElementById("edit-listing-description");
const tagsInput = document.getElementById("edit-listing-tags");
const mediaInput = document.getElementById("edit-listing-media");
const altInput = document.getElementById("edit-listing-media-alt");
const editBtn = document.getElementById("edit-listing-btn");
const errorMessageDiv = document.getElementById("error-message");
const successMessageDiv = document.getElementById("success-message");

// Loads listing into form fields
async function loadListing() {
  try {
    const response = await fetch(`${AUCTION_LISTINGS_URL}/${listingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    const { data } = await response.json();

    titleInput.value = data.title;
    descInput.value = data.description || "";
    tagsInput.value = data.tags?.join(", ") || "";

    mediaInput.value = data.media?.map((img) => img.url).join("\n") || "";
    altInput.value = data.media?.map((img) => img.alt).join("\n") || "";
  } catch (error) {
    errorMessageDiv.textContent = "Failed to load listing for edit";
  }
}

loadListing();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  editBtn.disabled = true;
  editBtn.textContent = "Saving...";

  const tags = tagsInput.value.split(",").map((tag) => tag.trim());

  const mediaUrls = mediaInput.value.split("\n").map((url) => url.trim());
  const mediaAlts = altInput.value.split("\n").map((alt) => alt.trim());

  const media = mediaUrls.map((url, i) => ({
    url,
    alt: mediaAlts[i] || "Auction Image",
  }));

  const updatedData = {
    title: titleInput.value,
    description: descInput.value,
    tags,
    media,
  };

  try {
    const response = await fetch(`${AUCTION_LISTINGS_URL}/${listingId}`, {
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
      editBtn.disabled = false;
      editBtn.textContent = "Edit Listing";
      errorMessageDiv.textContent =
        result.errors?.[0]?.message || "Failed to update listing";
      return;
    }

    successMessageDiv.classList.remove("hidden");

    successMessageDiv.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-600 shrink-0" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span class="font-semibold text-lg leading-tight flex items-center">
      Listing updated successfully! Redirecting...
    </span>`;
    setTimeout(() => {
      window.location.href = `/pages/individualauctionlisting/individualauctionlisting.html?id=${listingId}`;
    }, 3000);
  } catch (error) {
    errorMessageDiv.textContent = "Failed to update listing";
    editBtn.disabled = false;
    editBtn.textContent = "Edit Listing";
  }
});

// Counter for description input length

const editDescriptionInput = document.getElementById(
  "edit-listing-description"
);
const editDescriptionCounter = document.getElementById(
  "edit-description-counter"
);

editDescriptionInput.addEventListener("input", () => {
  editDescriptionCounter.textContent = editDescriptionInput.value.length;
});
