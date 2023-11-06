import * as THREE from "three";
import { AmbientLight, DirectionalLight } from "three";
import Drone from "../cameras/drone";
import ModelLoader from "../helpers/modelloader";

export default class World {
  constructor() {
    this.lights = [];
    this.cameras = {};

    // Initialize the scene, renderer, and objects
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Add lights to the scene
    this.addLights();

    // Create a drone and add it to the scene
    this.drone = new Drone();
    this.drone.addToScene(this.scene);
    this.cameras.drone = this.drone.camera;
    this.cameras.drone.position.set(370, 1, -230);
    this.cameras.drone.lookAt(615, 0, -230);

    // Set up scene background and camera position
    this.scene.background = new THREE.Color(0xaaaaaa);

    // Create and add model to the scene
    this.modelLoader = new ModelLoader();
    this.modelLoader.load("/assets/models/world/World.gltf").then((model) => {
      this.scene.add(model);
    });

    // Add debug camera
    this.cameras.debug = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.cameras.debug.position.set(370, 1, -230);
    this.cameras.debug.lookAt(615, 100, -230);

    // Add stationary camera
    this.cameras.stationary = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.cameras.stationary.position.set(370, 1, -230);
    this.cameras.stationary.lookAt(615, 100, -230);

    // Set the initial camera
    this.activeCamera = this.cameras.drone;
  }

  setStartPosition() {
    this.cameras.drone = this.drone.camera;
    this.cameras.drone.position.set(370, 1, -230);
    this.cameras.drone.lookAt(615, 0, -230);
    this.activeCamera = this.cameras.drone;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.activeCamera === this.cameras.drone) {
      this.drone.updatePosition();
    }

    // Render the scene
    this.renderer.render(this.scene, this.activeCamera);
  }

  addLights() {
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
  }
}
