import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

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
const moveSpeed = 1;
const velocity = new THREE.Vector3(0, 0, 0);

scene.add(controls.getObject());

// Loader
const loader = new GLTFLoader();
loader.load(
  "/assets/models/scene.gltf",
  function (gltf) {
    scene.add(gltf.scene);
    animate();
  },
  undefined,
  function (error) {
    console.error(error);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
);

// Event Listener for Keyboard (KeyDown)
document.addEventListener("keydown", function (event) {
  switch (event.code) {
    case "KeyW":
      velocity.z = moveSpeed;
      break;
    case "KeyS":
      velocity.z = -moveSpeed;
      break;
    case "KeyA":
      velocity.x = -moveSpeed;
      break;
    case "KeyD":
      velocity.x = moveSpeed;
      break;
    case "Space":
      velocity.y = moveSpeed;
      break;
    case "ControlLeft":
      velocity.y = -moveSpeed;
      break;
    default:
      break;
  }
});

// Event Listener for Keyboard (KeyUp)
document.addEventListener("keyup", function (event) {
  switch (event.code) {
    case "KeyW":
    case "KeyS":
      velocity.z = 0;
      break;
    case "KeyA":
    case "KeyD":
      velocity.x = 0;
      break;
    case "Space":
    case "ControlLeft":
      velocity.y = 0;
      break;
    default:
      break;
  }
});

// Lock the pointer when the canvas is clicked
document.addEventListener(
  "click",
  function () {
    controls.lock();
  },
  false,
);

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
  controls.moveForward(velocity.z);
  controls.moveRight(velocity.x);
  controls.getObject().position.y += velocity.y;

  renderer.render(scene, camera);
}

// Trigger the initial animation
animate();
