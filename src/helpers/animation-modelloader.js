import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import carAnimations from "../components/animations/car-animations.json";
import storkAnimations from "../components/animations/stork-animations.json";

import setupBirds from "../components/animations/setup-birds";
import setupCar from "../components/animations/setup-cars";

/**
 * Asynchronously loads 3D models using the GLTFLoader and sets up animations for birds and cars.
 *
 * @returns {Promise<{ storks: Object[], cars: Object[] }>} A promise resolving to an object containing arrays of stork and car models.
 */
export default async function loadModels() {
  /**
   * The GLTFLoader instance for loading 3D models.
   * @type {GLTFLoader}
   */
  const loader = new GLTFLoader();

  /**
   * Array of paths for stork GLTF models.
   * @type {string[]}
   */
  const storkPaths = Array(Object.keys(storkAnimations).length).fill("/assets/birds/Stork.glb");

  /**
   * Array of paths for car GLTF models.
   * @type {string[]}
   */
  const carPaths = Array(Object.keys(carAnimations).length).fill("/assets/cars/Car.glb");

  /**
   * Array of promises representing the loaded data for stork models.
   * @type {Promise<GLTF>[]}
   */
  const storksData = await Promise.all([...storkPaths.map((path) => loader.loadAsync(path))]);

  /**
   * Array of promises representing the loaded data for car models.
   * @type {Promise<GLTF>[]}
   */
  const carsData = await Promise.all([...carPaths.map((path) => loader.loadAsync(path))]);

  /**
   * Array of setup bird models.
   * @type {Object[]}
   */
  const storks = [];

  /**
   * Array of setup car models.
   * @type {Object[]}
   */
  const cars = [];

  /**
   * Set up bird models and apply rotations.
   */
  storksData.forEach((stork, i) => {
    storks.push(setupBirds(stork, i));
    storks[i].rotateZ(storkAnimations[i].rotation * Math.PI);
  });

  /**
   * Set up car models and apply scaling.
   */
  carsData.forEach((car, i) => {
    cars.push(setupCar(car, i));
    cars[i].scale.set(2, 2, 2);
  });

  /**
   * Return an object containing arrays of stork and car models.
   * @type {Promise<{ storks: Object[], cars: Object[] }>}
   */
  return {
    storks,
    cars,
  };
}
