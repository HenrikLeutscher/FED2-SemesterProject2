import { getTimeRemaining } from "./timeleft.js";

/**
 * Starts countdown timer for all elements with the .countdown class
 * @param {*} container - Container element containing the countdown elements
 */

export function startCountDown(container) {
  if (!container) return;

  const element = container.querySelectorAll(".countdown");

  element.forEach((el) => {
    const endsAt = el.dataset.ends;

    function update() {
      el.textContent = getTimeRemaining(endsAt);
    }

    update();
    setInterval(update, 1000);
  });
}
