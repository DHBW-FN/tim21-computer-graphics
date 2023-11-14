import world from "../main";

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

function toggleDayNight() {
  world.isNight = !world.isNight;
  if (world.isNight) {
    world.setNightBackground();
  } else {
    world.setDayBackground();
  }
}

function handleButtonEvents(button) {
  button.addEventListener("mousedown", () => world.drone.controls.pressedKeys.add(keys[button.id]));
  button.addEventListener("mouseup", () => world.drone.controls.pressedKeys.delete(keys[button.id]));
  button.addEventListener("mouseleave", () => world.drone.controls.pressedKeys.delete(keys[button.id]));
  button.addEventListener("click", (event) => event.stopPropagation());
}

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

if (document.readyState !== "loading") {
  initControls();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    initControls();
  });
}
