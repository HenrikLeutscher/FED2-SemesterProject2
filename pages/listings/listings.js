import { getListings } from "/js/listings/getListings.js";
import { displayListings } from "/js/listings/displayListings.js";
import { startCountDown } from "/js/listings/countdown.js";
import { sortListings } from "/js/listings/sortListings.js";

document.addEventListener("DOMContentLoaded", async () => {
  const listingsContainer = document.getElementById("listings-container");
  const searchInput = document.getElementById("search-bar");
  const sortSelector = document.getElementById("sort-selector");
  const listingSearchResult = document.getElementById("listing-search-result");

  if (!listingsContainer || !searchInput) return;

  let allListings = [];
  let filteredListings = [];

  try {
    const { data } = await getListings();
    allListings = data;
    filteredListings = [...allListings];

    displayListings(filteredListings, listingsContainer);
    startCountDown(listingsContainer);
  } catch (error) {
    listingsContainer.innerHTML = "<p>Failed to load listings.</p>";
    return;
  }

  // Search Function

  function applySearch() {
    const query = searchInput.value.toLowerCase();

    filteredListings = allListings.filter((listing) => {
      const title = listing.title?.toLowerCase() || "";
      const description = listing.description?.toLowerCase() || "";
      const tags = (listing.tags || []).join(" ").toLowerCase();

      return (
        title.includes(query) ||
        description.includes(query) ||
        tags.includes(query)
      );
    });
  }

  function applySort() {
    const sortType = sortSelector.value || "newest";
    filteredListings = sortListings(filteredListings, sortType);
  }

  function updateListings() {
    if (filteredListings.length !== 0) {
      listingSearchResult.classList.remove("hidden");
      listingSearchResult.textContent = `${filteredListings.length} listings found.`;
    }

    if (filteredListings.length === 0) {
      listingsContainer.innerHTML = `<p>No listings found.</p>`;
      listingSearchResult.classList.add("hidden");
      return;
    }

    if (searchInput.value.trim() === "") {
      listingSearchResult.classList.add("hidden");
    }

    displayListings(filteredListings, listingsContainer);
    startCountDown(listingsContainer);
  }

  searchInput.addEventListener("input", () => {
    applySearch();
    applySort();
    updateListings();
  });

  sortSelector.addEventListener("change", () => {
    applySort();
    updateListings();
  });
});
