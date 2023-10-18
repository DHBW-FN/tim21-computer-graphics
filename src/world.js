import * as THREE from "three";
import Drone from "./drone";
import EiffelTower from "./eiffeltower";

export default class World {
  constructor() {
    // Initialize the scene, renderer, and objects
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.objects = [];

    // Create a drone and add it to the scene
    this.drone = new Drone();
    this.drone.addToScene(this.scene);

    // Create and add objects to the scene
    this.objects.push(new EiffelTower(this.scene));

    // Set up renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Set up scene background and camera position
    this.scene.background = new THREE.Color(0xaaaaaa);

    // Get the camera from the Drone class
    this.camera = this.drone.camera;
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
