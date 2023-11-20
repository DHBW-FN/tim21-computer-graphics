import * as THREE from "three";
import { Clock } from "three";
import Drone from "../cameras/drone";
import ModelLoader from "../helpers/modelloader";
import Snackbar from "../components/snackbar";
import loadModels from "../helpers/animation-modelloader";
import models from "../components/models.json";
import plants from "../components/plants.json";
import buildings from "../components/buildings.json";
import streetLamps from "../components/streetLamps.json";
import Grass from "../components/grass/grass";
import EventManager from "../utils/eventmanager";
import TimeManager from "../utils/timemanager";
import LightManager from "../utils/lightmanager";


const clock = new Clock();

/**
 * Represents the virtual world with various elements and functionalities.
 * @class
 */
class World {
  /**
   * Creates a World instance.
   * @constructor
   */
  constructor() {
    /**
     * Event manager for handling events.
     * @type {EventManager}
     */
    this.eventManager = new EventManager();

    /**
     * Time manager for managing the time of day.
     * @type {TimeManager}
     */
    this.timeManager = new TimeManager();

    /**
     * Light manager for managing lights in the scene.
     * @type {LightManager}
     */
    this.lightManager = new LightManager();

    /**
     * Collection of different cameras in the world.
     * @type {object}
     */
    this.cameras = {};

    /**
     * Three.js CubeTextureLoader for loading cube textures.
     * @type {THREE.CubeTextureLoader}
     */
    this.cubeLoader = new THREE.CubeTextureLoader();

    /**
     * Array of updatable objects in the scene.
     * @type {Array}
     */
    this.updatables = [];

    /**
     * Array of grass planes in the scene.
     * @type {Array}
     */
    this.grass = [];

    /**
     * Three.js scene representing the virtual world.
     * @type {THREE.Scene}
     */
    this.scene = new THREE.Scene();

    /**
     * Three.js WebGLRenderer for rendering the scene.
     * @type {THREE.WebGLRenderer}
     */
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    /**
     * Model loader for loading 3D models.
     * @type {ModelLoader}
     */
    this.modelLoader = new ModelLoader();

    // Add event listeners
    document.addEventListener("click", () => this.toggleControls());
    this.eventManager.addListener(TimeManager.DAY_CHANGE_EVENT, (event) => this.onDayChange(event));
  }

  /**
   * Handles the DAY_CHANGE_EVENT and updates the scene based on the time of day.
   * @param {object} event - The DAY_CHANGE_EVENT event object.
   */
  onDayChange(event) {
    if (event.isDay) {
      this.setDay();
    } else {
      this.setNight();
    }
  }

  /**
   * Retrieves grass planes asynchronously.
   * @returns {Promise<Array>} - A promise that resolves to an array of Grass planes.
   */
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

  /**
   * Initiates the animation loop.
   */
  animate() {
    this.renderer.setAnimationLoop((time) => {
      this.tick(time);

      this.renderer.render(this.scene, this.activeCamera);
    });
  }

  /**
   * Updates the scene elements based on the time elapsed.
   * @param {number} time - The elapsed time since the last update.
   */
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

  /**
   * Initializes the world by loading models, adding lights, and setting the time of day.
   */
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

    // Load buildings
    this.loadBuildings().then((group) => {
      this.scene.add(group);
    });

    // Load street lamps
    this.loadStreetLamps().then((group) => {
      this.scene.add(group);
    });

    // Add lights to streetlamps
    this.loadStreetLampsLights().then((lights) => {
      lights.forEach((light) => {
        this.scene.add(light);
        this.scene.add(light.target);
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

  /**
   * Initializes different cameras in the world.
   */
  async initCameras() {
    // Add debug camera
    this.cameras.debug = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.cameras.debug.name = "debug";
    this.cameras.debug.position.set(370, 250, 175);
    this.cameras.debug.lookAt(370, 75, -230);

    // Add stationary camera
    this.cameras.stationary = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.cameras.stationary.name = "stationary";
    this.cameras.stationary.position.set(470, 5, -230);
    this.cameras.stationary.lookAt(615, 60, -230);

    // Add drone camera
    this.drone = new Drone(this);
    this.drone.addToScene(this.scene);
    this.cameras.drone = this.drone.camera;
    this.cameras.drone.name = "drone";

    // Set the initial camera
    this.activeCamera = this.cameras.drone;
  }

  /**
   * Initializes lights in the scene.
   */
  initLights() {
    this.scene.add(this.lightManager.getSun().light);
    this.scene.add(this.lightManager.getSun().light.target);

    const spotLightIntensity = 25000;

    const spotLight1 = new THREE.SpotLight(0xffffff, spotLightIntensity, 0, Math.PI / 4, 0.5);
    spotLight1.position.set(530, 0, -142);
    spotLight1.target.position.set(615, 50, -230);
    this.scene.add(this.lightManager.addLight(spotLight1, "spotLight1", 0, spotLightIntensity).light);
    this.scene.add(this.lightManager.getLight("spotLight1").light.target);

    const spotLight2 = new THREE.SpotLight(0xffffff, spotLightIntensity, 0, Math.PI / 4, 0.5);
    spotLight2.position.set(700, 0, -142);
    spotLight2.target.position.set(615, 50, -230);
    this.scene.add(this.lightManager.addLight(spotLight2, "spotLight2", 0, spotLightIntensity).light);
    this.scene.add(this.lightManager.getLight("spotLight2").light.target);

    const spotLight3 = new THREE.SpotLight(0xffffff, spotLightIntensity, 0, Math.PI / 4, 0.5);
    spotLight3.position.set(700, 0, -317.5);
    spotLight3.target.position.set(615, 50, -230);
    this.scene.add(this.lightManager.addLight(spotLight3, "spotLight3", 0, spotLightIntensity).light);
    this.scene.add(this.lightManager.getLight("spotLight3").light.target);

    const spotLight4 = new THREE.SpotLight(0xffffff, spotLightIntensity, 0, Math.PI / 4, 0.5);
    spotLight4.position.set(530, 0, -317.5);
    spotLight4.target.position.set(615, 50, -230);
    this.scene.add(this.lightManager.addLight(spotLight4, "spotLight4", 0, spotLightIntensity).light);
    this.scene.add(this.lightManager.getLight("spotLight4").light.target);
  }

  /**
   * Toggles camera controls between locked and unlocked states.
   */
  toggleControls() {
    if (!this.drone.controls.isLocked && this.activeCamera === this.drone.camera) {
      this.drone.controls.lock();
    } else {
      this.drone.controls.unlock();
    }
  }

  /**
   * Sets the background to represent nighttime.
   */
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

  /**
   * Sets the background to represent daytime.
   */
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

  /**
   * Cycles through different cameras in the scene.
   */
  cycleCameras() {
    const cameras = Object.keys(this.cameras);
    const currentCameraIndex = cameras.indexOf(this.activeCamera.name);
    const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
    this.activeCamera = this.cameras[cameras[nextCameraIndex]];
    Snackbar.show(`Active camera: ${this.activeCamera.name}`, 3000);
  }

  /**
   * Resets the cameras to their initial positions.
   */
  resetCameras() {
    Snackbar.show("Resetting camera position", 3000);
    this.drone.setStartPosition();
    this.activeCamera = this.cameras.drone;
  }

  /**
   * Loads plant models asynchronously and returns a promise.
   * @returns {Promise<THREE.Group>} - A promise that resolves to a Three.js group containing plant models.
   */
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

  /**
   * Loads building models asynchronously and returns a promise.
   * @returns {Promise<THREE.Group>} - A promise that resolves to a Three.js group containing building models.
   */
  async loadBuildings() {
    return new Promise((resolve, reject) => {
      const buildingsGroup = new THREE.Group();

      Object.keys(buildings).forEach((key) => {
        const model = buildings[key];
        this.modelLoader
          .loadAsync(model)
          .then((group) => {
            buildingsGroup.add(group);
          })
          .then(() => {
            resolve(buildingsGroup);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

/**
 * Loads streetlamp models asynchronously and returns a promise.
 * @returns {Promise<THREE.Group>} - A promise that resolves to a Three.js group containing street lamp models.
  **/
  async loadStreetLamps() {
    return new Promise((resolve, reject) => {
      const stretLampsGroup = new THREE.Group();

      Object.keys(streetLamps).forEach((key) => {
        const model = streetLamps[key];
        this.modelLoader
          .loadAsync(model)
          .then((group) => {
            stretLampsGroup.add(group);
          })
          .then(() => {
            resolve(stretLampsGroup);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

  static async getLightForStreetLamp(lamp) {
    const offsetVector = new THREE.Vector3(4.139, 11.603, 0);
    if (lamp.rotation) {
      offsetVector.applyEuler(new THREE.Euler(lamp.rotation.x, lamp.rotation.y, lamp.rotation.z, "XYZ"));
    }

    return new Promise((resolve) => {
      const lightPosition = new THREE.Vector3().copy(lamp.position).add(offsetVector);
      const light = new THREE.SpotLight(0xffffff, 0, 0, Math.PI / 4, 1);
      light.visible = false;
      light.position.copy(lightPosition);
      light.target.position.copy(lightPosition.setY(0));
      resolve(light);
    });
  }

  async loadStreetLampsLights() {
    const lights = [];
    const visibleStreetLampLights = [6, 15, 22, 23, 24, 25];

    await Promise.all(
      Object.keys(streetLamps).map(async (key) => {
        const lamp = streetLamps[key];

        await Promise.all(
          lamp.instances.map(async (instance, instanceKey) => {
            if (!visibleStreetLampLights.includes(instanceKey)) {
              return;
            }

            const light = await World.getLightForStreetLamp(instance);
            this.lightManager.addLight(light, `${instance.name}-${key}-light`, 0, 1000);
            lights.push(light);
          }),
        );
      }),
    );

    return lights;
  }
}

export default World;
