import world from "../main";

/**
 * Mapping of button IDs to corresponding keyboard keys.
 * @type {Object<string, string>}
 */
const keys = {
  forward: "KeyW",
  backward: "KeyS",
  left: "KeyA",
  right: "KeyD",
  up: "KeyR",
  down: "KeyF",
  "rotate-up": "ArrowUp",
  "rotate-down": "ArrowDown",
  "rotate-right": "ArrowRight",
  "rotate-left": "ArrowLeft",
};

/**
 * Handles button events for mouse interactions with controls.
 *
 * @param {HTMLElement} button - The button element to handle events for.
 */
function handleButtonEvents(button) {
  button.addEventListener("mousedown", () => world.drone.controls.pressedKeys.add(keys[button.id]));
  button.addEventListener("mouseup", () => world.drone.controls.pressedKeys.delete(keys[button.id]));
  button.addEventListener("mouseleave", () => world.drone.controls.pressedKeys.delete(keys[button.id]));
  button.addEventListener("click", (event) => event.stopPropagation());
}

/**
 * Initializes the controls for the 3D world.
 */
function initControls() {
  /**
   * The button to toggle the visibility of the controls.
   * @type {HTMLElement}
   */
  const toggleButton = document.getElementById("toggleButton");

  /**
   * The container for control buttons.
   * @type {HTMLElement}
   */
  const controls = document.getElementById("controls");

  /**
   * The collection of control buttons.
   * @type {NodeList<HTMLElement>}
   */
  const controlButtons = document.querySelectorAll(".control-button");

  /**
   * The heading explaining the controls.
   * @type {HTMLElement}
   */
  const controlsExplanationHeading = document.getElementById("controlsExplanationHeading");

  /**
   * The button to cycle through cameras.
   * @type {HTMLElement}
   */
  const cycleCamerasButton = document.getElementById("cycleCamerasButton");

  /**
   * The button to set the time of day to day.
   * @type {HTMLElement}
   */
  const buttonSetDay = document.getElementById("buttonSetDay");

  /**
   * The button to set the time of day to night.
   * @type {HTMLElement}
   */
  const buttonSetNight = document.getElementById("buttonSetNight");

  /**
   * The button to set the initial camera position.
   * @type {HTMLElement}
   */
  const startPositionButton = document.getElementById("startPositionButton");

  toggleButton.addEventListener("click", () => {
    controls.classList.toggle("hidden");
    controlsExplanationHeading.classList.toggle("hidden");
    toggleButton.innerHTML = controls.classList.contains("hidden") ? "&#9664;" : "&#9654;";
  });
  buttonSetDay.addEventListener("click", () => {
    world.timeManager.setDay();
  });
  buttonSetNight.addEventListener("click", () => {
    world.timeManager.setNight();
  });
  startPositionButton.addEventListener("click", () => {
    world.resetCameras();
  });
  cycleCamerasButton.addEventListener("click", () => {
    world.cycleCameras();
  });
  controlButtons.forEach(handleButtonEvents);
  document.getElementById("controlsExplanation").addEventListener("click", (event) => event.stopPropagation());
}

if (document.readyState !== "loading") {
  initControls();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    initControls();
  });
}
