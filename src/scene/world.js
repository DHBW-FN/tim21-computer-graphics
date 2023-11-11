import * as THREE from "three";
import { AmbientLight, DirectionalLight } from "three";
import Drone from "../cameras/drone";
import ModelLoader from "../helpers/modelloader";
import Snackbar from "../components/snackbar";
import { Loop } from "../helpers/loop";
import { loadBirds } from "../helpers/animationModelLoader.js";

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
    this.cameras.drone.name = "drone";

    // Set up scene background and camera position
    this.scene.background = new THREE.Color(0xaaaaaa);

    // Create and add a model to the scene
    this.modelLoader = new ModelLoader();
    this.modelLoader.load("/assets/models/world/World.gltf").then((model) => {
      this.scene.add(model);
    });

    this.loop = new Loop(this.cameras.drone, this.scene, this.renderer);

    // Add debug camera
    this.cameras.debug = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.cameras.debug.name = "debug";
    this.cameras.debug.position.set(370, 250, 175);
    this.cameras.debug.lookAt(370, 75, -230);

    // Add stationary camera
    this.cameras.stationary = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.cameras.stationary.name = "stationary";
    this.cameras.stationary.position.set(370, 1, -230);
    this.cameras.stationary.lookAt(615, 100, -230);

    // Set the initial camera
    this.activeCamera = this.cameras.drone;

    // Add event listeners
    document.addEventListener("click", () => this.toggleControls());
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.activeCamera === this.cameras.drone) {
      this.drone.updatePosition();
    }

    // Render the scene
    this.renderer.render(this.scene, this.activeCamera);
  }

  async init() {
    const { stork } = await loadBirds();

    this.loop.updatables.push(stork);
    this.scene.add(stork);
  }

  start() {
    this.loop.start();
  }

  addLights() {
    // Add sun
    this.sun = new DirectionalLight(0xffffff, 10);
    this.sun.position.set(200, 600, 200);
    this.lights.push(this.sun);

    // Add ambient light
    const ambientLight = new AmbientLight(0xffffff, 1);
    this.lights.push(ambientLight);

    // Add lights to the scene
    this.lights.forEach((light) => {
      this.scene.add(light);
    });
  }

  toggleControls() {
    if (!this.drone.controls.isLocked && this.activeCamera === this.drone.camera) {
      this.drone.controls.lock();
    } else {
      this.drone.controls.unlock();
    }
  }

  cycleCameras() {
    const cameras = Object.keys(this.cameras);
    const currentCameraIndex = cameras.indexOf(this.activeCamera.name);
    const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
    this.activeCamera = this.cameras[cameras[nextCameraIndex]];
    Snackbar.show(`Active camera: ${this.activeCamera.name}`, 3000);
  }

  resetCameras() {
    Snackbar.show("Resetting camera position", 3000);
    this.drone.setStartPosition();
    this.activeCamera = this.cameras.drone;
  }
}
