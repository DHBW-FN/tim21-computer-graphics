import world from "../main";

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleButton");
  const controls = document.getElementById("controls");
  const controlsExplanationHeading = document.getElementById("controlsExplanationHeading");
  const dayNightToggle = document.getElementById("dayNightToggle");
  const startPositionButton = document.getElementById("startPositionButton");

  let isNight = false;

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
    isNight = !isNight;
    // TODO: Add code to toggle night mode
  });

  startPositionButton.addEventListener("click", () => {
    world.camera.position.set(400, 300, 150);
    world.camera.lookAt(400, 0, -300);
  });

  // Prevent the controls from locking when the button or explanation is clicked
  document.getElementById("controlsExplanation").addEventListener("click", (event) => {
    event.stopPropagation();
  });
});
