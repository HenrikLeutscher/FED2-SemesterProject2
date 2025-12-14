import { AUCTION_LISTINGS_URL } from "../config.js";

/**
 *
 * @returns {Promise<Object>} The API Response containing the fetched listing data
 * @throws {Error} If request fails
 */

export async function getListings() {
  const response = await fetch(
    `${AUCTION_LISTINGS_URL}?page=1&_active=true&_bids=true&_seller=true&sort=created&sortOrder=desc`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.json();
    throw new Error(`Failed to fetch the listings: ${response.status} ${text}`);
  }

  return await response.json();
}
