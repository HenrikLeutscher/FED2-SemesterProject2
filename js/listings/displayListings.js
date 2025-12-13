/**
 * Renders a list of auction listings
 * @param {Array<object>} listings - Lists to render
 * @param {HTMLElement} container - DOM element to render the listings into
 * @param {boolean} showSeller - Whether to show seller info or not. Default to true
 */

export function displayListings(listings, container, showSeller = true) {
    const placeholder = "/assets/images/no-image.png";

    container.innerHTML = listings
        .map(listing => {
            const imageSrc = listing.media?.[0]?.url?.trim() || placeholder;
            const bidCount = listing.bids?.length || 0;
            const highestBid = bidCount
                ? Math.max(...listing.bids.map(b => b.amount))
                : "0";
            return `
        <div class="border border-blue-400 rounded mb-5">
            <img loading="lazy" src="${imageSrc}" class="w-full h-50 object-cover mb-4" alt="${listing.title}" onerror="this.onerror=null;this.src='${placeholder}'" />
            <div class="px-4 py-2">
                <h3 class="line-clamp-1">${listing.title}</h3>
                ${showSeller ? `
                <p>
                    <a href="/pages/profile/profile.html?user=${listing.seller?.name}"
                    class="text-blue-400 italic">
                        @${listing.seller?.name}
                    </a>
                </p>
                ` : ""}
                <p>Highest Bid: ${highestBid} Credits</p>
                <div class="flex justify-between">
                    <p>${bidCount} bids</p>
                    <p class="countdown" data-ends="${listing.endsAt}">Loading...</p>
                </div>

                <a href="/pages/individualAuctionListing/individualAuctionListing.html?id=${listing.id}" class="w-full bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-900 transition border-white border block mx-auto text-center">
                  View Details
                </a>
            </div>
        </div>`;
        }).join("");
}

