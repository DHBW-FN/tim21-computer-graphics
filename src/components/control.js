import world from "../main";

/**
 * Key mappings for controlling the drone.
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
 * Toggles between day and night background.
 * Updates the world's background and state accordingly.
 * @function
 */
function toggleDayNight() {
  world.isNight = !world.isNight;
  if (world.isNight) {
    world.setNightBackground();
  } else {
    world.setDayBackground();
  }
}

/**
 * Attaches event listeners for mouse and button events to control the drone.
 * @function
 * @param {HTMLButtonElement} button - The button element representing a control.
 */
function handleButtonEvents(button) {
  button.addEventListener("mousedown", () => world.drone.controls.pressedKeys.add(keys[button.id]));
  button.addEventListener("mouseup", () => world.drone.controls.pressedKeys.delete(keys[button.id]));
  button.addEventListener("mouseleave", () => world.drone.controls.pressedKeys.delete(keys[button.id]));
  button.addEventListener("click", (event) => event.stopPropagation());
}

/**
 * Initializes the user interface controls and attaches event listeners.
 * @function
 */
function initControls() {
  const toggleButton = document.getElementById("toggleButton");
  const controls = document.getElementById("controls");
  const controlButtons = document.querySelectorAll(".control-button");
  const controlsExplanationHeading = document.getElementById("controlsExplanationHeading");
  const cycleCamerasButton = document.getElementById("cycleCamerasButton");
  const startPositionButton = document.getElementById("startPositionButton");
  const dayNightToggleButton = document.getElementById("dayNightToggle");

  toggleButton.addEventListener("click", () => {
    controls.classList.toggle("hidden");
    controlsExplanationHeading.classList.toggle("hidden");
    toggleButton.innerHTML = controls.classList.contains("hidden") ? "&#9664;" : "&#9654;";
  });
  dayNightToggleButton.addEventListener("click", toggleDayNight);
  startPositionButton.addEventListener("click", () => {
    world.resetCameras();
  });
  cycleCamerasButton.addEventListener("click", () => {
    world.cycleCameras();
  });
  controlButtons.forEach(handleButtonEvents);
  document.getElementById("controlsExplanation").addEventListener("click", (event) => event.stopPropagation());
}

// Initialize controls when the document is ready
if (document.readyState !== "loading") {
  initControls();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    initControls();
  });
}
