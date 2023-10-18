import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import EiffelTower from "./eiffeltower";
import Drone from "./drone";

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 0, 100);
camera.lookAt(0, 50, 0);

// Controls
const controls = new PointerLockControls(camera, renderer.domElement);

const drone = new Drone(camera, renderer.domElement);
drone.addToScene(scene);
drone.addEventListeners();

const eiffelTower = new EiffelTower(scene);

// Do something when the pointer is locked or unlocked
controls.addEventListener("lock", function () {
  // Hide UI or pause game
});

controls.addEventListener("unlock", function () {
  // Show UI or unpause game
});

// Animation
function animate() {
  requestAnimationFrame(animate);

  // Apply movements
  drone.moveForward(drone.velocity.z);
  drone.moveRight(drone.velocity.x);
  drone.updatePosition();

  renderer.render(scene, camera);
}

// Trigger the initial animation
animate();
