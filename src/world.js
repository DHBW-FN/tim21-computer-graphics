import * as THREE from "three";
import Drone from "./drone";
import ModelLoader from "./modelloader";

export default class World {
  constructor() {
    // Initialize the scene, renderer, and objects
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();

    // Create a drone and add it to the scene
    this.drone = new Drone();
    this.drone.addToScene(this.scene);

    // Create and add objects to the scene
    this.modelLoader = new ModelLoader();
    this.addEiffelTower();

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

  addEiffelTower() {
    this.modelLoader.load("/assets/models/eiffel.glb").then((model) => {
      this.scene.add(model);

      // TODO remove this and handle lights in Three.js
      this.scene.traverse((object) => {
        if (object instanceof THREE.Light) {
          object.intensity = object.intensity * 0.001;
        }
      });
    });
  }
}
