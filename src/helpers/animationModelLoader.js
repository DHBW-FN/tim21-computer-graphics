import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import carAnimations from "../components/carAnimations.json";
import storkAnimations from "../components/storkAnimations.json";

import setupBirds from "../components/setupBirds";
import setupCar from "../components/setupCars";

/**
 * Asynchronously loads 3D models using GLTFLoader.
 * @function
 * @returns {Promise<Object>} A Promise that resolves to an object containing arrays of storks and cars.
 */
export default async function loadModels() {
  /** @type {GLTFLoader} */
  const loader = new GLTFLoader();

  /** @type {string[]} */
  const storkPaths = Array(Object.keys(storkAnimations).length).fill("/assets/birds/Stork.glb");
  /** @type {string[]} */
  const carPaths = Array(Object.keys(carAnimations).length).fill("/assets/cars/Car.glb");

  /** @type {Object[]} */
  const storksData = await Promise.all([...storkPaths.map((path) => loader.loadAsync(path))]);
  /** @type {Object[]} */
  const carsData = await Promise.all([...carPaths.map((path) => loader.loadAsync(path))]);

  /** @type {Object[]} */
  const storks = [];
  /** @type {Object[]} */
  const cars = [];

  storksData.forEach((stork, i) => {
    storks.push(setupBirds(stork, i));
    storks[i].rotateZ(storkAnimations[i].rotation * Math.PI);
  });

  carsData.forEach((car, i) => {
    cars.push(setupCar(car, i));
    cars[i].scale.set(2, 2, 2);
  });

  return {
    storks,
    cars,
  };
}
