import * as THREE from "three";
import { Clock, DirectionalLight } from "three";
import Drone from "../cameras/drone";
import ModelLoader from "../helpers/modelloader";
import Snackbar from "../components/snackbar";
import loadModels from "../helpers/animationModelLoader";
import models from "../components/models.json";
import Grass from "../components/grass.js";

const clock = new Clock();

export default class World {
  constructor() {
    this.frameCount = 0;
    this.startTime = performance.now();
    this.fpsElement = document.getElementById("fpsCounter");

    this.lights = [];
    this.cameras = {};
    this.cubeLoader = new THREE.CubeTextureLoader();
    this.updatables = [];

    // Initialize the scene, renderer, and objects
    this.scene = new THREE.Scene();
    this.collidableObjects = [];
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Add lights to the scene
    this.addLights();

    // Create a drone and add it to the scene
    this.drone = new Drone(this);
    this.drone.addToScene(this.scene);
    this.cameras.drone = this.drone.camera;
    this.cameras.drone.name = "drone";

    // Set up background depending on the time of day
    this.date = new Date();
    this.isNight = this.date.getHours() > 18 || this.date.getHours() < 6;
    // TODO: Add light depending on Background
    if (this.isNight) {
      this.setNightBackground();
    } else {
      this.setDayBackground();
    }

    // Create and add a model to the scene
    this.modelLoader = new ModelLoader();
    ModelLoader.showBoundingBox = false;
    this.modelLoader.loadAsync(models.base).then((group) => {
      this.scene.add(group);
    });
    this.modelLoader.loadAsync(models.eiffeltower).then((group) => {
      this.scene.add(group);
    });

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

    this.grass = new Grass(10, 8, 10000);

    this.scene.add(this.grass);

    // Add event listeners
    document.addEventListener("click", () => this.toggleControls());
  }

  animate() {
    this.renderer.setAnimationLoop((time) => {
      this.grass.update(time);
      this.tick();

      if (this.activeCamera === this.cameras.drone) {
        this.drone.updatePosition();
      }

      // Calculate FPS
      this.frameCount += 1;
      const currentTime = performance.now();
      const elapsedTime = currentTime - this.startTime;

      if (elapsedTime >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / elapsedTime);
        this.fpsElement.textContent = `FPS: ${fps}`;

        // Reset counters for the next second
        this.frameCount = 0;
        this.startTime = currentTime;
      }

      // render a frame
      this.renderer.render(this.scene, this.activeCamera);
    });
  }

  tick() {
    const delta = clock.getDelta();

    this.updatables.forEach((object) => {
      object.tick(delta);
    });
  }

  async init() {
    loadModels()
      .then(({ storks, cars }) => {
        this.updatables.push(...storks);
        this.updatables.push(...cars);
      })
      .then(() => {
        this.updatables.forEach((object) => {
          this.scene.add(object);
        });
      });
  }

  addLights() {
    // Add sun
    this.sun = new DirectionalLight(0xffffff, 10);
    this.sun.position.set(740 / 2, 400, -460 / 2);
    this.scene.add(this.sun.target);
    this.sun.target.position.set(370, 0, -230);
    this.sun.castShadow = true;

    this.sun.shadow.mapSize.width = 1024 * 2 ** 4;
    this.sun.shadow.mapSize.height = 1024 * 2 ** 4;
    // this.sun.shadow.camera.near = 0;
    // this.sun.shadow.camera.far = 500;

    this.sun.shadow.camera.left = -740 / 2;
    this.sun.shadow.camera.right = 740 / 2;
    this.sun.shadow.camera.top = 460 / 2;
    this.sun.shadow.camera.bottom = -460 / 2;

    this.lights.push(this.sun);

    // Add ambient light
    // const ambientLight = new AmbientLight(0xffffff, 1);
    // this.lights.push(ambientLight);

    // Add lights to the scene
    this.lights.forEach((light) => {
      this.scene.add(light);
    });

    const helper = new THREE.CameraHelper(this.sun.shadow.camera);
    this.scene.add(helper);
  }

  toggleControls() {
    if (!this.drone.controls.isLocked && this.activeCamera === this.drone.camera) {
      this.drone.controls.lock();
    } else {
      this.drone.controls.unlock();
    }
  }

  setNightBackground() {
    this.scene.background = this.cubeLoader.load([
      "assets/nightBoxPieces/back.png",
      "assets/nightBoxPieces/front.png",
      "assets/nightBoxPieces/top.png",
      "assets/nightBoxPieces/bottom.png",
      "assets/nightBoxPieces/right.png",
      "assets/nightBoxPieces/left.png",
    ]);
  }

  setDayBackground() {
    this.scene.background = this.cubeLoader.load([
      "assets/daylightBoxPieces/back.bmp",
      "assets/daylightBoxPieces/front.bmp",
      "assets/daylightBoxPieces/top.bmp",
      "assets/daylightBoxPieces/bottom.bmp",
      "assets/daylightBoxPieces/right.bmp",
      "assets/daylightBoxPieces/left.bmp",
    ]);
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
