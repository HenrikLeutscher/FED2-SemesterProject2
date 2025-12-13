/**
 * 
 * @param {string} endsAt - ISO date string being auction end time
 * @returns {string} - Gives bak the formatted remaining time, if no time remaining = ended.
 */

export function getTimeRemaining(endsAt) {
    const now = new Date();
    const end = new Date(endsAt);

    let diff = end - now;
    if (diff <= 0) return "Ended";

    const totalSeconds = Math.floor(diff / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days >= 1) {
        return `${days}d ${hours}h`;
    }

    // when its under 1 day
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${hh}h ${mm}m ${ss}s`;
}
