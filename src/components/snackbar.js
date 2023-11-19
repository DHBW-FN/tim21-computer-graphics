/**
 * Snackbar class for displaying temporary messages.
 * @module
 */
export default class Snackbar {
  /**
   * Reference to the snackbar element in the HTML document.
   * @type {HTMLElement}
   */
  static snackbar = document.getElementById("snackbar");

  /**
   * Timer used to automatically hide the snackbar after a specified timeout.
   * @type {?number}
   */
  static fadeOutTimer = null;

  /**
   * Displays a snackbar with the provided message for a specified duration.
   *
   * @param {string} message - The message to be displayed in the snackbar.
   * @param {number} timeout - The duration in milliseconds for which the snackbar will be visible.
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
   * Hides the snackbar by removing the 'show' class.
   */
  static hide() {
    Snackbar.snackbar.classList.remove("show");
  }
}
