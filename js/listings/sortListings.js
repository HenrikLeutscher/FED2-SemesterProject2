/**
 *
 * @param {Array<object>} listings
 * @param {string} sortType - Sorting selection (newest, endingSoon etc)
 * @returns {Array<object>} - Returns sorted listings array
 */

export function sortListings(listings, sortType) {
  const sorted = [...listings];

  switch (sortType) {
    case "endingSoon":
      return sorted.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));

    case "newest":
      return sorted.sort((a, b) => new Date(b.created) - new Date(a.created));

    case "oldest":
      return sorted.sort((a, b) => new Date(a.created) - new Date(b.created));

    case "highestBid":
      return sorted.sort((a, b) => {
        const bidA = Math.max(0, ...(a.bids.map((b) => b.amount) || []));
        const bidB = Math.max(0, ...(b.bids.map((b) => b.amount) || []));
        return bidB - bidA;
      });

    case "mostBids":
      return sorted.sort(
        (a, b) => (b.bids?.length || 0) - (a.bids?.length || 0)
      );

    default:
      return sorted; // Default = No sorting
  }
}
