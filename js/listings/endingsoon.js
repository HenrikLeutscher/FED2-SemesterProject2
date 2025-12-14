import { getListings } from "/js/listings/getListings.js";
import { startCountDown } from "/js/listings/countdown.js";
import { displayListings } from "/js/listings/displayListings.js";

export async function renderEndingSoon() {
  const endingSoonContainer = document.getElementById("ending-soon");

  try {
    const { data } = await getListings();

    const activeListings = data
      .filter((listing) => new Date(listing.endsAt) > new Date())
      .sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt))
      .slice(0, 4);

    displayListings(activeListings, endingSoonContainer);
    startCountDown(endingSoonContainer);
  } catch (error) {
    console.error("Error loading ending soon listings:", error);
  }
}
