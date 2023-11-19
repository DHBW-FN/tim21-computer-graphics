import * as THREE from "three";
import { Clock } from "three";
import Drone from "../cameras/drone";
import ModelLoader from "../helpers/modelloader";
import Snackbar from "../components/snackbar";
import loadModels from "../helpers/animation-modelloader";
import models from "../components/models.json";
import plants from "../components/plants.json";
import Grass from "../components/grass/grass";
import EventManager from "../utils/eventmanager";
import TimeManager from "../utils/timemanager";
import LightManager from "../utils/lightmanager";

const clock = new Clock();

export default class World {
  constructor() {
    this.eventManager = new EventManager();
    this.timeManager = new TimeManager();
    this.lightManager = new LightManager();

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

      grassPlanes.push(new Grass(new THREE.Vector3(142.5, 0, -165), 205, 90, 100000));
      grassPlanes.push(new Grass(new THREE.Vector3(142.5, 0, -230), 205, 30, 33000));
      grassPlanes.push(new Grass(new THREE.Vector3(142.5, 0, -295), 205, 90, 100000));

      grassPlanes.push(new Grass(new THREE.Vector3(387.5, 0, -165), 205, 90, 1000000));
      grassPlanes.push(new Grass(new THREE.Vector3(387.5, 0, -230), 205, 30, 300000));
      grassPlanes.push(new Grass(new THREE.Vector3(387.5, 0, -295), 205, 90, 1000000));

      grassPlanes.push(new Grass(new THREE.Vector3(615, 0, -111), 170, 62, 100000));
      grassPlanes.push(new Grass(new THREE.Vector3(615, 0, -348.75), 170, 62.5, 100000));
      resolve(grassPlanes);
    });
  }

  animate() {
    this.renderer.setAnimationLoop((time) => {
      this.tick(time);

      this.renderer.render(this.scene, this.activeCamera);
    });
  }

  tick(time) {
    const delta = clock.getDelta();

    if (this.activeCamera === this.cameras.drone) {
      this.drone.updatePosition();
    }

    this.grass.forEach((grass) => {
      grass.update(
        time,
        this.lightManager.getSun().light.intensity /
          Math.max(this.lightManager.getSun().dayIntensity, this.lightManager.getSun().nightIntensity),
      );
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

    // Load plants
    this.loadPlants().then((group) => {
      this.scene.add(group);
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
    this.initLights();

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

  initLights() {
    this.scene.add(this.lightManager.getSun().light);
    this.scene.add(this.lightManager.getSun().light.target);

    const spotLightIntensity = 25000;

    const spotLight1 = new THREE.SpotLight(0xffffff, spotLightIntensity, 0, Math.PI / 4, 0.5);
    spotLight1.castShadow = true;
    spotLight1.position.set(530, 0, -142);
    spotLight1.target.position.set(615, 50, -230);
    this.scene.add(this.lightManager.addLight(spotLight1, "spotLight1", 0, spotLightIntensity).light);
    this.scene.add(this.lightManager.getLight("spotLight1").light.target);

    const spotLight2 = new THREE.SpotLight(0xffffff, spotLightIntensity, 0, Math.PI / 4, 0.5);
    spotLight2.castShadow = true;
    spotLight2.position.set(700, 0, -142);
    spotLight2.target.position.set(615, 50, -230);
    this.scene.add(this.lightManager.addLight(spotLight2, "spotLight2", 0, spotLightIntensity).light);
    this.scene.add(this.lightManager.getLight("spotLight2").light.target);

    const spotLight3 = new THREE.SpotLight(0xffffff, spotLightIntensity, 0, Math.PI / 4, 0.5);
    spotLight3.castShadow = true;
    spotLight3.position.set(700, 0, -317.5);
    spotLight3.target.position.set(615, 50, -230);
    this.scene.add(this.lightManager.addLight(spotLight3, "spotLight3", 0, spotLightIntensity).light);
    this.scene.add(this.lightManager.getLight("spotLight3").light.target);

    const spotLight4 = new THREE.SpotLight(0xffffff, spotLightIntensity, 0, Math.PI / 4, 0.5);
    spotLight4.castShadow = true;
    spotLight4.position.set(530, 0, -317.5);
    spotLight4.target.position.set(615, 50, -230);
    this.scene.add(this.lightManager.addLight(spotLight4, "spotLight4", 0, spotLightIntensity).light);
    this.scene.add(this.lightManager.getLight("spotLight4").light.target);
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

  async loadPlants() {
    return new Promise((resolve, reject) => {
      const plantsGroup = new THREE.Group();

      Object.keys(plants).forEach((key) => {
        const model = plants[key];
        this.modelLoader
          .loadAsync(model)
          .then((group) => {
            plantsGroup.add(group);
          })
          .then(() => {
            resolve(plantsGroup);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }
}
