import { renderEndingSoon } from "/js/listings/endingsoon.js";
import { renderNewestListings } from "/js/listings/newestListings.js";
import { listingStats } from "/js/listings/listingstats.js";

document.addEventListener("DOMContentLoaded", () => {
  renderEndingSoon();
  renderNewestListings();
  listingStats();
});
