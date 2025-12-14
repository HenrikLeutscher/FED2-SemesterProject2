import { getToken, getApiKey } from "../utils/storage.js";
import { AUCTION_LISTINGS_URL } from "../config.js";

export async function deleteListing(listingId) {
  const token = getToken();
  const apiKey = getApiKey();

  if (!token) {
    throw new Error("You must be the publisher to delete this listing");
  }

  const response = await fetch(`${AUCTION_LISTINGS_URL}/${listingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (response === 204) {
    return true;
  }

  if (!response.ok) {
    throw new Error("Failed to delete the listing");
  }

  return true;
}
