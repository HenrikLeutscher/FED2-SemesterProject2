import { getToken } from "/js/utils/storage.js";
import { getListingsById } from "/js/listings/getListingsById.js";
import { startCountDown } from "/js/listings/countdown.js";
import { getUser } from "/js/utils/storage.js";
import { AUCTION_LISTINGS_URL } from "/js/config.js";
import { API_KEY } from "/js/config.js";
import { deleteListing } from "/js/listings/deleteListing.js";

document.addEventListener("DOMContentLoaded", async () => {
  const individualListingContainer = document.getElementById("listingDetails");
  if (!individualListingContainer) return;

  const params = new URLSearchParams(window.location.search);
  const listingId = params.get("id");

  if (!listingId) {
    individualListingContainer.innerHTML = `<p class="text-center">No listing was selected</p>`;
    return;
  }

  try {
    const listing = await getListingsById(listingId);

    renderListingDetails(listing, individualListingContainer);
    renderBidHistory(listing);
    startCountDown(individualListingContainer);
    document.title = `${listing.title} | Dealery`;

  } catch (error) {
    console.error(error);
    individualListingContainer.innerHTML = `<p class="text-center">Error loading listing...</p>`;
  }
});


function renderListingDetails(listing, individualListingContainer) {
  const bidCount = listing.bids?.length || 0;
  const highestBid = bidCount
    ? Math.max(...listing.bids.map(b => b.amount))
    : 0;

  const hasEnded = new Date(listing.endsAt) <= new Date();

  const images = Array.isArray(listing.media) && listing.media.length
    ? listing.media
    : [{ url: "../../assets/images/no-image.png", alt: listing.title }];

  const listingTags = listing.tags && listing.tags.length
    ? listing.tags.join(", ")
    : "No tags";

  let currentImageIndex = 0;

  const loggedInUser = getUser();
  const isSeller = loggedInUser && loggedInUser.name === listing.seller?.name;

  document.querySelector("h1.sr-only").textContent = listing.title;

  individualListingContainer.innerHTML = `
    <div class="border rounded pb-5 p-5">
      <div class="flex flex-col lg:flex-row min-h-150 lg:items-center">

        <div class="relative w-full lg:max-w-1/2">
          <div id="imageCounter" class="absolute top-2 right-2 bg-blue-400 text-white px-3 py-1 rounded">
            1 / ${images.length}
          </div>
          <img 
            loading="lazy"
            id="carouselImage"
            src="${images[0].url}"
            alt="${images[0].alt || listing.title}"
            class="w-full max-h-75 md:max-h-100 lg:max-h-150 lg:h-full object-cover mb-4"
          />

          ${images.length > 1 ? `
            <button id="prevImage"
              class="absolute left-2 bottom-2 -translate-y-1/2 bg-blue-400 text-white px-3 py-1 rounded" aria-label="Previous Image">
              ◀
            </button>

            <button id="nextImage"
              class="absolute right-2 bottom-2 -translate-y-1/2 bg-blue-400 text-white px-3 py-1 rounded" aria-label="Next Image">
              ▶
            </button>
          ` : ""}
        </div>

        <div class="px-5 lg:max-w-1/2 w-full">
          <h2>${listing.title}</h2>
          <div class="flex flex-col border-t-2 border-blue-400 pt-3">
            <p class="font-semibold">Tags:</p>
            <p class="italic">${listingTags}</p>
          </div>

          <p class="border-t-2 border-blue-400 pt-3 font-semibold">
            Seller: 
            <a href="/pages/profile/profile.html?user=${listing.seller?.name}"
              class="text-blue-400 hover:underline">
              @${listing.seller?.name}
            </a>
          </p>

          <div class="flex flex-col md:flex-row md:gap-5 border-t-2 border-blue-400 pt-3">
            <p class="font-semibold">Highest Bid: <span class="font-normal">$${highestBid}</span></p>
            <p>${bidCount} bids</p>
          </div>

          <p class="border-t-2 border-blue-400 pt-3 font-semibold">
            Time Remaining:
            <span class="countdown font-normal" data-ends="${listing.endsAt}"></span>
          </p>
          <div class="border-y-2 border-blue-400 pt-3">
            <p class="font-semibold">Listing Description:</p>
            <p>${listing.description || "No description"}</p>
          </div>

          <div class="flex flex-col items-center gap-3 mt-3 sm:flex-row mb-2">
            ${getToken() && !hasEnded && !isSeller ? `<div id="bidSection" class="flex flex-col">
                <input type="number"
                id="bidAmount"
                class="border rounded px-2 py-1"
                placeholder="Place bid, min $${highestBid + 1}"
                min="${highestBid + 1}" />

              <button id="placeBidBtn"
                class="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer mt-2" aria-label="Place a bid">
                Place a Bid
              </button>
              <small class="text-sm text-blue-800 text-center pt-2 underline">Credits may be locked during bids.</small>
            </div>` : ""}

             ${isSeller && getToken() ? `<button id="editListingBtn" class="bg-yellow-400 text-white px-4 py-2 rounded cursor-pointer" aria-label="Edit listing">
              Edit Listing
            </button>

            <button id="deleteListingBtn" class="bg-red-600 text-white px-4 py-2 rounded cursor-pointer" aria-label="Delete listing">
              Delete Listing
            </button>` : ""}
          </div>
          <div id="error-message" class="text-red-600 pt-5 font-semibold"></div>

          <div id="success-message" class="hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-50 border border-blue-700 text-blue-400 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
          </div>
        </div>
      </div>

      <div class="p-4 mb-5 border-t-2">
        <h3>Bid History:</h3>
        <div id="bidHistory"></div>
      </div>
    </div>
  `;

  const errorMessageDiv = document.getElementById("error-message");
  const successMessageDiv = document.getElementById("success-message");

  if (images.length > 1) {
    const imageElement = document.getElementById("carouselImage");
    const prevBtn = document.getElementById("prevImage");
    const nextBtn = document.getElementById("nextImage");
    const imageCounter = document.getElementById("imageCounter");

    function updateImage() {
      imageElement.src = images[currentImageIndex].url;
      imageCounter.alt = images[currentImageIndex].alt || listing.title;
      imageCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    }


    prevBtn.addEventListener("click", () => {
      currentImageIndex =
        currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;

      imageElement.src = images[currentImageIndex].url;
      updateImage();
    });

    nextBtn.addEventListener("click", () => {
      currentImageIndex =
        currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;

      imageElement.src = images[currentImageIndex].url;
      updateImage();
    });
  }

  const bidBtn = document.getElementById("placeBidBtn");
  const bidInput = document.getElementById("bidAmount");

  if (bidBtn && bidInput) {
    bidBtn.addEventListener("click", () => {
      const bidAmount = Number(bidInput.value);
      bidBtn.disabled = true;
      bidBtn.textContent = "Placing your bid...";

      if (!bidAmount || bidAmount <= highestBid) {
        errorMessageDiv.textContent = `Your bid must be higher than the current highest bid of $${highestBid}.`;
        bidBtn.disabled = false;
        bidBtn.textContent = "Place a Bid";
        return;

      }
      setTimeout(() => {
        bidBtn.disabled = false;
        bidBtn.textContent = "Place a Bid";
      }, 2000);

      placeBid(listing.id, bidAmount);
    });
  }

  const editListingBtn = document.getElementById("editListingBtn");

  if (editListingBtn) {
    editListingBtn.addEventListener("click", () => {
      window.location.href = `/pages/editpost/editpost.html?id=${listing.id}`;
    });
  }

  const deleteListingBtn = document.getElementById("deleteListingBtn");

  if (deleteListingBtn) {
    deleteListingBtn.addEventListener("click", async () => {
      const confirmDelete = confirm("Are you sure you want to delete this listing?");
      if (!confirmDelete) return;

      deleteListingBtn.disabled = true;
      deleteListingBtn.textContent = "Deleting listing...";

      try {
        await deleteListing(listing.id);
        successMessageDiv.classList.remove("hidden");
        successMessageDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-600 shrink-0" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="font-semibold text-lg leading-tight flex items-center">
          Listing deleted successfully! Redirecting...
        </span>`;
        setTimeout(() => {
          window.location.href = "/pages/listings/listings.html";
        }, 3000);

      } catch (error) {
        errorMessageDiv.textContent = "There was an error deleting the listing. Please try again.";
        deleteListingBtn.disabled = false;
        deleteListingBtn.textContent = "Delete Listing";
      }
    });
  }
}

function renderBidHistory(listing) {
  const bidHistoryindividualListingContainer = document.getElementById("bidHistory");

  if (!listing.bids || listing.bids.length === 0) {
    bidHistoryindividualListingContainer.innerHTML = "<p>No bids yet. Be the first to bid!</p>";
    return;
  }

  const sortedBids = listing.bids.sort(
    (a, b) => new Date(b.created) - new Date(a.created)
  );

  bidHistoryindividualListingContainer.innerHTML = sortedBids
    .map(bid => {
      const bidderName = bid.bidder?.name || "Unknown";
      const bidAmount = bid.amount;
      const bidTime = new Date(bid.created).toLocaleString();

      return `
        <div class="border-b py-2">
          <p>
            <a href="/pages/profile/profile.html?user=${bidderName}" class="text-blue-400 mr-1 hover:underline">
              @${bidderName}
            </a>
            has bid $${bidAmount} on ${bidTime}
          </p>
        </div>
      `;
    })
    .join("");
}

async function placeBid(listingId, amount) {
  const token = getToken();
  const errorMessageDiv = document.getElementById("error-message");
  const successMessageDiv = document.getElementById("success-message");

  // Safety Fallback incase button is shown when it shouldn't be
  if (!token) {
    errorMessageDiv.textContent = "You must be logged in to place a bid.";
    return;
  }

  try {
    const updatedListing = await getListingsById(listingId);

    if (updatedListing.bids?.length > 0) {
      const highestBidObject = updatedListing.bids.reduce((max, bid) =>
        bid.amount > max.amount ? bid : max
      );

      const loggedInUser = getUser();

      if (highestBidObject.bidder?.name === loggedInUser?.name) {
        errorMessageDiv.textContent = "You have already placed the highest bid.";
        bidBtn.disabled = false;
        bidBtn.textContent = "Place a Bid";
        return;
      }
    }

    const response = await fetch(`${AUCTION_LISTINGS_URL}/${listingId}/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY
      },
      body: JSON.stringify({ amount })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.errors?.[0]?.message || "Failed to place bid");
    }

    const updateListing = await getListingsById(listingId);
    setTimeout(() => {
      window.location.reload();
    }, 2000);

    successMessageDiv.classList.remove("hidden");

    successMessageDiv.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-600 shrink-0" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span class="font-semibold text-lg leading-tight flex items-center">
      Successfully placed bid!
    </span>`;

    setTimeout(() => {
      successMessageDiv.classList.add("hidden");
    }, 3000);

  } catch (error) {
    console.error("Error placing bid:", error);
    errorMessageDiv.textContent = "There was an error placing your bid. Please try again.";
  }
}