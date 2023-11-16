import * as THREE from "three";
import { Clock, DirectionalLight } from "three";
import Drone from "../cameras/drone";
import ModelLoader from "../helpers/modelloader";
import Snackbar from "../components/snackbar";
import loadModels from "../helpers/animation-modelloader";
import models from "../components/animations/models.json";
import Grass from "../components/grass/grass";
import EventManager from "../utils/eventmanager";
import TimeManager from "../utils/timemanager";

const clock = new Clock();

export default class World {
  constructor() {
    this.eventManager = new EventManager();
    this.timeManager = new TimeManager();

    this.frameCount = 0;
    this.startTime = performance.now();
    this.fpsElement = document.getElementById("fpsCounter");

    this.lights = [];
    this.cameras = {};
    this.cubeLoader = new THREE.CubeTextureLoader();
    this.updatables = [];
    this.grass = [];

    // Initialize the scene, renderer, and objects
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.modelLoader = new ModelLoader();

    // Add event listeners
    document.addEventListener("click", () => this.toggleControls());

    this.eventManager.addListener(TimeManager.DAY_CHANGE_EVENT, (event) => this.onDayChange(event));
  }

  onDayChange(event) {
    if (event.isDay) {
      this.setDay();
    } else {
      this.setNight();
    }
  }

  static async getGrassPlanes() {
    return new Promise((resolve) => {
      const grassPlanes = [];

      grassPlanes.push(new Grass(new THREE.Vector3(142.5, 0.01, -165), 205, 90, 1000000));
      grassPlanes.push(new Grass(new THREE.Vector3(142.5, 0.01, -230), 205, 30, 100000));
      grassPlanes.push(new Grass(new THREE.Vector3(142.5, 0.01, -295), 205, 90, 100000));

      grassPlanes.push(new Grass(new THREE.Vector3(387.5, 0.01, -165), 205, 90, 1000000));
      grassPlanes.push(new Grass(new THREE.Vector3(387.5, 0.01, -230), 205, 30, 300000));
      grassPlanes.push(new Grass(new THREE.Vector3(387.5, 0.01, -295), 205, 90, 1000000));

      grassPlanes.push(new Grass(new THREE.Vector3(615, 0.01, -111), 170, 62, 100000));
      grassPlanes.push(new Grass(new THREE.Vector3(615, 0.01, -348.75), 170, 62.5, 100000));
      resolve(grassPlanes);
    });
  }

  animate() {
    this.renderer.setAnimationLoop((time) => {
      this.tick(time);

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

      this.renderer.render(this.scene, this.activeCamera);
    });
  }

  tick(time) {
    const delta = clock.getDelta();

    if (this.activeCamera === this.cameras.drone) {
      this.drone.updatePosition();
    }

    this.grass.forEach((grass) => {
      grass.update(time);
    });

    this.updatables.forEach((object) => {
      object.tick(delta);
    });
  }

  async init() {
    // Load models
    this.modelLoader.loadAsync(models.base).then((group) => {
      this.scene.add(group);
    });
    this.modelLoader.loadAsync(models.eiffeltower).then((group) => {
      this.scene.add(group);
    });

    // Load grass
    World.getGrassPlanes().then((grassPlanes) => {
      grassPlanes.forEach((field) => {
        this.grass.push(field);
        this.scene.add(field);
      });
    });

    // Load animations
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

    // Add lights
    this.addLights();

    // Set the time of day
    if (this.timeManager.isDay()) {
      this.setDay();
    } else {
      this.setNight();
    }

    // Initialize cameras
    await this.initCameras();

    this.timeManager.startUpdating();

    // Check if there is already a canvas element in the DOM
    const canvas = document.querySelector("canvas");
    if (canvas) {
      document.body.removeChild(canvas);
    }
    document.body.appendChild(this.renderer.domElement);
  }

  async initCameras() {
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

    // Add drone camera
    this.drone = new Drone(this);
    this.drone.addToScene(this.scene);
    this.cameras.drone = this.drone.camera;
    this.cameras.drone.name = "drone";

    // Set the initial camera
    this.activeCamera = this.cameras.drone;
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

    this.sun.shadow.camera.left = -740 / 2;
    this.sun.shadow.camera.right = 740 / 2;
    this.sun.shadow.camera.top = 460 / 2;
    this.sun.shadow.camera.bottom = -460 / 2;

    this.lights.push(this.sun);

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

  setNight() {
    this.scene.background = this.cubeLoader.load([
      "assets/nightBoxPieces/back.png",
      "assets/nightBoxPieces/front.png",
      "assets/nightBoxPieces/top.png",
      "assets/nightBoxPieces/bottom.png",
      "assets/nightBoxPieces/right.png",
      "assets/nightBoxPieces/left.png",
    ]);
  }

  setDay() {
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
