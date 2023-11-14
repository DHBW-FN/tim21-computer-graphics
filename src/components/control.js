import world from "../main";

function initControls() {
  const toggleButton = document.getElementById("toggleButton");
  const controls = document.getElementById("controls");
  const controlsExplanationHeading = document.getElementById("controlsExplanationHeading");
  const dayNightToggle = document.getElementById("dayNightToggle");
  const startPositionButton = document.getElementById("startPositionButton");
  const cycleCamerasButton = document.getElementById("cycleCamerasButton");
  const controlButtons = document.querySelectorAll(".control-button");

  toggleButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (controls.classList.contains("hidden")) {
      controls.classList.remove("hidden");
      controlsExplanationHeading.classList.remove("hidden");
      toggleButton.innerHTML = "&#9654;";
    } else {
      controls.classList.add("hidden");
      controlsExplanationHeading.classList.add("hidden");
      toggleButton.innerHTML = "&#9664;";
    }
  });

  dayNightToggle.addEventListener("click", () => {
    world.isNight = !world.isNight;
    if (world.isNight) {
      world.setNightBackground();
    } else {
      world.setDayBackground();
    }
  });

  startPositionButton.addEventListener("click", () => {
    world.resetCameras();
  });

  cycleCamerasButton.addEventListener("click", () => {
    world.cycleCameras();
  });

  controlButtons.forEach((button) => {
    button.addEventListener("mousedown", () => {
      switch (button.id) {
        case "forward":
          world.drone.controls.pressedKeys.add("KeyW");
          break;
        case "backward":
          world.drone.controls.pressedKeys.add("KeyS");
          break;
        case "left":
          world.drone.controls.pressedKeys.add("KeyA");
          break;
        case "right":
          world.drone.controls.pressedKeys.add("KeyD");
          break;
        case "up":
          world.drone.controls.pressedKeys.add("KeyR");
          break;
        case "down":
          world.drone.controls.pressedKeys.add("KeyF");
          break;
        case "rotate-up":
          world.drone.controls.pressedKeys.add("ArrowUp");
          break;
        case "rotate-down":
          world.drone.controls.pressedKeys.add("ArrowDown");
          break;
        case "rotate-right":
          world.drone.controls.pressedKeys.add("ArrowRight");
          break;
        case "rotate-left":
          world.drone.controls.pressedKeys.add("ArrowLeft");
          break;
        default:
          break;
      }
    });
    button.addEventListener("mouseup", () => {
      switch (button.id) {
        case "forward":
          world.drone.controls.pressedKeys.delete("KeyW");
          break;
        case "backward":
          world.drone.controls.pressedKeys.delete("KeyS");
          break;
        case "left":
          world.drone.controls.pressedKeys.delete("KeyA");
          break;
        case "right":
          world.drone.controls.pressedKeys.delete("KeyD");
          break;
        case "up":
          world.drone.controls.pressedKeys.delete("KeyR");
          break;
        case "down":
          world.drone.controls.pressedKeys.delete("KeyF");
          break;
        case "rotate-up":
          world.drone.controls.pressedKeys.delete("ArrowUp");
          break;
        case "rotate-down":
          world.drone.controls.pressedKeys.delete("ArrowDown");
          break;
        case "rotate-right":
          world.drone.controls.pressedKeys.delete("ArrowRight");
          break;
        case "rotate-left":
          world.drone.controls.pressedKeys.delete("ArrowLeft");
          break;
        default:
          break;
      }
    });
    button.addEventListener("mouseleave", () => {
      switch (button.id) {
        case "forward":
          world.drone.controls.pressedKeys.delete("KeyW");
          break;
        case "backward":
          world.drone.controls.pressedKeys.delete("KeyS");
          break;
        case "left":
          world.drone.controls.pressedKeys.delete("KeyA");
          break;
        case "right":
          world.drone.controls.pressedKeys.delete("KeyD");
          break;
        case "up":
          world.drone.controls.pressedKeys.delete("KeyR");
          break;
        case "down":
          world.drone.controls.pressedKeys.delete("KeyF");
          break;
        case "rotate-up":
          world.drone.controls.pressedKeys.delete("ArrowUp");
          break;
        case "rotate-down":
          world.drone.controls.pressedKeys.delete("ArrowDown");
          break;
        case "rotate-right":
          world.drone.controls.pressedKeys.delete("ArrowRight");
          break;
        case "rotate-left":
          world.drone.controls.pressedKeys.delete("ArrowLeft");
          break;
        default:
          break;
      }
    });
    button.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  // Prevent the controls from locking when the button or explanation is clicked
  document.getElementById("controlsExplanation").addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

if (document.readyState !== "loading") {
  initControls();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    initControls();
  });
}
