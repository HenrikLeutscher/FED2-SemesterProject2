import { getListings } from "./getListings.js";

export async function listingStats() {
    const { data } = await getListings();
    const now = new Date();

    const activeListings = data.filter(listing => new Date(listing.endsAt) > now).length;
    const activeCount = activeListings;

    let totalSpent = 0;

    data.forEach(listing => {
        if (listing.bids?.length > 0) {
            const highest = Math.max(...listing.bids.map(bid => bid.amount));
            totalSpent += highest;
        }
    });

    const today = new Date().toISOString().slice(0, 10);

    const endingToday = data.filter(listing => {
        const end = new Date(listing.endsAt).toISOString().slice(0, 10);
        return end === today;
    }).length;

    // DOM elements to display stats
    document.getElementById("activeListings").innerText = activeCount;
    document.getElementById("totalSpent").innerText = `$${totalSpent.toLocaleString()}`;
    document.getElementById("endingToday").innerText = endingToday;
}