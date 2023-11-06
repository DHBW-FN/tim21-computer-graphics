export default class Snackbar {
  constructor() {
    this.snackbar = document.getElementById("snackbar");
    this.fadeOutTimer = null;
  }

  show(message, timeout) {
    this.snackbar.innerText = message;
    this.snackbar.classList.add("show");

    clearTimeout(this.fadeOutTimer);
    this.fadeOutTimer = setTimeout(() => {
      this.hide();
    }, timeout);
  }

  hide() {
    this.snackbar.classList.remove("show");
  }
}
