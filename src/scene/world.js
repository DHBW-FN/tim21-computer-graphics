import * as THREE from "three";
import { AmbientLight, DirectionalLight } from "three";
import Drone from "../cameras/drone";
import ModelLoader from "../helpers/modelloader";

export default class World {
  constructor() {
    // Initialize the scene, renderer, and objects
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();

    // Create a drone and add it to the scene
    this.drone = new Drone();
    this.drone.addToScene(this.scene);

    // Lights
    this.lights = [];

    // Add sun
    this.sun = new DirectionalLight(0xffffff, 10);
    this.sun.position.set(200, 600, 200);
    this.lights.push(this.sun);

    // Add ambient light
    const ambientLight = new AmbientLight(0xffffff, 1);
    this.lights.push(ambientLight);

    // Add lights to scene
    this.lights.forEach((light) => {
      this.scene.add(light);
    });

    // Create and add objects to the scene
    this.modelLoader = new ModelLoader();
    this.addBase();

    // Set up renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Set up scene background and camera position
    this.scene.background = new THREE.Color(0xaaaaaa);

    // Get the camera from the Drone class
    this.camera = this.drone.camera;
    this.camera.position.set(400, 300, 150);
    this.camera.lookAt(400, 0, -300);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Apply movements and update the position of the drone
    this.drone.moveForward(this.drone.velocity.z);
    this.drone.moveRight(this.drone.velocity.x);
    this.drone.updatePosition();

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  addBase() {
    this.modelLoader.load("/assets/models/world/World.gltf").then((model) => {
      this.scene.add(model);
    });
  }
}
