import { getListings } from "./getListings.js";
import { displayListings } from "./displayListings.js";
import { startCountDown } from "./countdown.js";

export async function renderNewestListings() {
  const container = document.getElementById("newest-listings");
  if (!container) return;

  try {
    const { data } = await getListings();

    const newestListings = data
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 4);

    displayListings(newestListings, container);
    startCountDown(container);
  } catch (error) {
    container.innerHTML = "<p>Failed to load newest listings.</p>";
  }
}
