document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleButton");
  const controls = document.getElementById("controls");

  toggleButton.addEventListener("click", function (event) {
    event.stopPropagation();
    if (controls.classList.contains("hidden")) {
      controls.classList.remove("hidden");
      toggleButton.innerHTML = "&#9654;";
    } else {
      controls.classList.add("hidden");
      toggleButton.innerHTML = "&#9664;";
    }
  });

  // Prevent the controls from locking when the button or explanation is clicked
  document
    .getElementById("controlsExplanation")
    .addEventListener("click", function (event) {
      event.stopPropagation();
    });
});
