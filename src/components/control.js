import * as THREE from "three";
import world from "../main";

let accelerationInterval;

function continuousAcceleration(direction, accelerationVector) {
  accelerationInterval = setInterval(() => {
    world.drone.velocity
      .addScaledVector(accelerationVector, world.drone.acceleration)
      .clamp(
        new THREE.Vector3(-world.drone.maxSpeed, -world.drone.maxSpeed, -world.drone.maxSpeed),
        new THREE.Vector3(world.drone.maxSpeed, world.drone.maxSpeed, world.drone.maxSpeed),
      );
  }, 50);
}

function initControls() {
  const toggleButton = document.getElementById("toggleButton");
  const controls = document.getElementById("controls");
  const controlsExplanationHeading = document.getElementById("controlsExplanationHeading");
  const dayNightToggle = document.getElementById("dayNightToggle");
  const startPositionButton = document.getElementById("startPositionButton");
  const cycleCamerasButton = document.getElementById("cycleCamerasButton");
  const controlButtons = document.querySelectorAll(".control-button");

  let rotateInterval;

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
          continuousAcceleration("z", new THREE.Vector3(0, 0, 1));
          break;
        case "backward":
          continuousAcceleration("z", new THREE.Vector3(0, 0, -1));
          break;
        case "left":
          continuousAcceleration("x", new THREE.Vector3(-1, 0, 0));
          break;
        case "right":
          continuousAcceleration("x", new THREE.Vector3(1, 0, 0));
          break;
        case "up":
          continuousAcceleration("y", new THREE.Vector3(0, 1, 0));
          break;
        case "down":
          continuousAcceleration("y", new THREE.Vector3(0, -1, 0));
          break;
        case "rotate-up":
          rotateInterval = setInterval(() => {
            const forward = world.drone.camera.getWorldDirection(new THREE.Vector3());
            const axis = forward.clone().cross(world.drone.camera.up);
            world.drone.look(axis, 30);
          }, 1);
          break;
        case "rotate-down":
          rotateInterval = setInterval(() => {
            const forward = world.drone.camera.getWorldDirection(new THREE.Vector3());
            const axis = forward.clone().cross(world.drone.camera.up);
            world.drone.look(axis, -30);
          }, 1);
          break;
        case "rotate-right":
          rotateInterval = setInterval(() => {
            world.drone.look(new THREE.Vector3(0, 1, 0), -30);
          }, 1);
          break;
        case "rotate-left":
          rotateInterval = setInterval(() => {
            world.drone.look(new THREE.Vector3(0, 1, 0), 30);
          }, 1);
          break;
        default:
          break;
      }
    });
    button.addEventListener("mouseup", () => {
      clearInterval(accelerationInterval);
      clearInterval(rotateInterval);
      switch (button.id) {
        case "forward":
        case "backward":
          world.drone.velocity.z = 0;
          break;
        case "left":
        case "right":
          world.drone.velocity.x = 0;
          break;
        case "up":
        case "down":
          world.drone.velocity.y = 0;
          break;
        default:
          break;
      }
    });
    button.addEventListener("mouseleave", () => {
      clearInterval(accelerationInterval);
      clearInterval(rotateInterval);
      switch (button.id) {
        case "forward":
        case "backward":
          world.drone.velocity.z = 0;
          break;
        case "left":
        case "right":
          world.drone.velocity.x = 0;
          break;
        case "up":
        case "down":
          world.drone.velocity.y = 0;
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
