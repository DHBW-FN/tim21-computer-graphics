document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleButton");
  const controls = document.getElementById("controls");
  const controlsExplanationHeading = document.getElementById(
    "controlsExplanationHeading",
  );

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

  // Prevent the controls from locking when the button or explanation is clicked
  document
    .getElementById("controlsExplanation")
    .addEventListener("click", (event) => {
      event.stopPropagation();
    });
});
