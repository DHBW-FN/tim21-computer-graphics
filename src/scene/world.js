import * as THREE from "three";
import { AmbientLight, DirectionalLight } from "three";
import Drone from "../cameras/drone";
import ModelLoader from "../helpers/modelloader";

export default class World {
  constructor() {
    this.lights = [];

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

    // Set up scene background and camera position
    this.scene.background = new THREE.Color(0xaaaaaa);

    // Create and add model to the scene
    this.modelLoader = new ModelLoader();
    this.modelLoader.load("/assets/models/world/World.gltf").then((model) => {
      this.scene.add(model);
    });

    // Set up camera
    this.camera = this.drone.camera;
    this.camera.position.set(400, 300, 150);
    this.camera.lookAt(400, 0, -300);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.drone.updatePosition();

    // Render the scene
    this.renderer.render(this.scene, this.camera);
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
