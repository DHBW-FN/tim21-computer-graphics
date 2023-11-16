/**
 * Represents a simple Snackbar for displaying messages.
 * @class
 */
export default class Snackbar {
  /**
   * The HTML element representing the Snackbar.
   * @static
   * @type {HTMLElement}
   */
  static snackbar = document.getElementById("snackbar");

  /**
   * The timer ID for the fade-out timeout.
   * @static
   * @type {?number}
   */
  static fadeOutTimer = null;

  /**
   * Displays a message in the Snackbar for a specified duration.
   * @static
   * @param {string} message - The message to be displayed.
   * @param {number} timeout - The duration (in milliseconds) for which the Snackbar will be visible.
   */
  static show(message, timeout) {
    Snackbar.snackbar.innerText = message;
    Snackbar.snackbar.classList.add("show");

    clearTimeout(Snackbar.fadeOutTimer);
    Snackbar.fadeOutTimer = setTimeout(() => {
      Snackbar.hide();
    }, timeout);
  }

  /**
   * Hides the Snackbar.
   * @static
   */
  static hide() {
    Snackbar.snackbar.classList.remove("show");
  }
}
