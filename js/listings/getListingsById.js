import { AUCTION_LISTINGS_URL } from "/js/config.js";

/**
 * Grabs a single listing by its ID
 * @param {string} id - Listing ID 
 * @returns  {Promise<Object>} The Specific listing data
 * @throws {Error} If listing couldnt be found / fetched
 */

export async function getListingsById(id) {
    const response = await fetch(`${AUCTION_LISTINGS_URL}/${id}?_seller=true&_bids=true`);

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.errors?.[0]?.message || "Failed to fetch the listing by ID");
    }

    return result.data;
}