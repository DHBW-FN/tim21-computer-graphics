export default class Snackbar {
  static snackbar = document.getElementById("snackbar");

  static fadeOutTimer = null;

  static show(message, timeout) {
    Snackbar.snackbar.innerText = message;
    Snackbar.snackbar.classList.add("show");

    clearTimeout(Snackbar.fadeOutTimer);
    Snackbar.fadeOutTimer = setTimeout(() => {
      Snackbar.hide();
    }, timeout);
  }

  static hide() {
    Snackbar.snackbar.classList.remove("show");
  }
}
