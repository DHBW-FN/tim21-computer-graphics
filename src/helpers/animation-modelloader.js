import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import carAnimations from "../components/animations/car-animations.json";
import storkAnimations from "../components/animations/stork-animations.json";

import setupBirds from "../components/animations/setup-birds";
import setupCar from "../components/animations/setup-cars";

export default async function loadModels() {
  const loader = new GLTFLoader();

  const storkPaths = Array(Object.keys(storkAnimations).length).fill("/assets/birds/Stork.glb");
  const carPaths = Array(Object.keys(carAnimations).length).fill("/assets/cars/Car.glb");

  const storksData = await Promise.all([...storkPaths.map((path) => loader.loadAsync(path))]);
  const carsData = await Promise.all([...carPaths.map((path) => loader.loadAsync(path))]);

  const storks = [];
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
