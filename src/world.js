import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import Drone from "./drone";
import EiffelTower from "./eiffeltower";

export default class World {
  constructor() {
    // Initialize the scene, renderer, camera, and controls
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.controls = new PointerLockControls(
      this.camera,
      this.renderer.domElement,
    );
    this.moveSpeed = 1;

    // Create a drone and add it to the scene
    this.drone = new Drone(this.camera, this.renderer.domElement);
    this.drone.addToScene(this.scene);
    this.drone.addEventListeners();

    // Create an array to store objects in the scene
    this.objects = [];

    // Add objects to the scene
    this.objects.push(new EiffelTower(this.scene));

    // Set up renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Set up scene background and camera position
    this.scene.background = new THREE.Color(0xaaaaaa);
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 50, 0);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Apply movements and update position of the drone
    this.drone.moveForward(this.drone.velocity.z);
    this.drone.moveRight(this.drone.velocity.x);
    this.drone.updatePosition();

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
}
