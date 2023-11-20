import { DirectionalLight } from "three";
import EventManager from "./eventmanager";
import TimeManager from "./timemanager";

/**
 * Manages lights in the scene and their behavior based on the time of day.
 * @class
 */
class LightManager {
  /**
   * Creates a LightManager instance.
   * @constructor
   */
  constructor() {
    /**
     * Event manager for handling events.
     * @type {EventManager}
     */
    this.eventManager = new EventManager();

    /**
     * Listens for the DAY_CHANGE_EVENT and triggers the onDayChange method.
     * @param {object} event - The event object.
     */
    this.eventManager.addListener(TimeManager.DAY_CHANGE_EVENT, (event) => this.onDayChange(event));

    /**
     * Array to store lights managed by this LightManager.
     * @type {Array}
     */
    this.lights = [];
  }

  /**
   * Handles the DAY_CHANGE_EVENT and adjusts the intensity and visibility of lights accordingly.
   * @param {object} event - The DAY_CHANGE_EVENT event object.
   */
  onDayChange(event) {
    this.lights.map((lightObject) => {
      // eslint-disable-next-line no-param-reassign
      lightObject.light.intensity = event.isDay ? lightObject.dayIntensity || 0 : lightObject.nightIntensity || 0;
      // eslint-disable-next-line no-param-reassign
      lightObject.light.visible = lightObject.light.intensity !== 0;
      return lightObject;
    });
  }

  /**
   * Initializes and returns the sun light.
   * @returns {DirectionalLight} - The sun light.
   */
  initSun() {
    const sun = new DirectionalLight(0xffffff, 10);
    sun.position.set(740 / 2, 400, -460 / 2);
    sun.target.position.set(370, 0, -230);
    sun.castShadow = true;

    sun.shadow.mapSize.width = 1024 * 2 ** 1;
    sun.shadow.mapSize.height = 1024 * 2 ** 1;

    sun.shadow.camera.left = -740 / 2;
    sun.shadow.camera.right = 740 / 2;
    sun.shadow.camera.top = 460 / 2;
    sun.shadow.camera.bottom = -460 / 2;

    return this.addLight(sun, "sun", 10, 0.5);
  }

  /**
   * Gets the sun light, initializing it if not already present.
   * @returns {DirectionalLight} - The sun light.
   */
  getSun() {
    if (!this.lights.sun) {
      this.lights.sun = this.initSun();
    }
    return this.lights.sun;
  }

  /**
   * Gets a specific light by name.
   * @param {string} name - The name of the light.
   * @returns {object} - The light object.
   */
  getLight(name) {
    return this.lights.filter((light) => light.name === name)[0];
  }

  /**
   * Adds a new light to the manager.
   * @param {DirectionalLight} light - The light to be added.
   * @param {string} name - The name of the light.
   * @param {number} dayIntensity - The intensity of the light during the day.
   * @param {number} nightIntensity - The intensity of the light during the night.
   * @returns {object} - The added light object.
   */
  addLight(light, name, dayIntensity, nightIntensity) {
    const newLight = {
      light,
      name,
      dayIntensity,
      nightIntensity,
    };
    this.lights.push(newLight);
    return newLight;
  }
}

export default LightManager;
