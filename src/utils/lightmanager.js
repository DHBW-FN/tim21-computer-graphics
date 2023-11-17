import { DirectionalLight } from "three";
import EventManager from "./eventmanager";
import TimeManager from "./timemanager";

export default class LightManager {
  constructor() {
    this.eventManager = new EventManager();
    this.eventManager.addListener(TimeManager.DAY_CHANGE_EVENT, (event) => this.onDayChange(event));

    this.lights = [];
  }

  onDayChange(event) {
    if (event.isDay) {
      this.lights.map((lightObject) => {
        // eslint-disable-next-line no-param-reassign
        lightObject.light.intensity = lightObject.dayIntensity || 0;
        return lightObject;
      });
    }
    if (!event.isDay) {
      this.lights.map((lightObject) => {
        // eslint-disable-next-line no-param-reassign
        lightObject.light.intensity = lightObject.nightIntensity || 0;
        return lightObject;
      });
    }
  }

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

  getSun() {
    if (!this.lights.sun) {
      this.lights.sun = this.initSun();
    }
    return this.lights.sun;
  }

  getLight(name) {
    return this.lights[name];
  }

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
