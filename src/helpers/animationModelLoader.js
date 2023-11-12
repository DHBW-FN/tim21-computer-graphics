import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import carAnimations from "../components/carAnimations.json";
import storkAnimations from "../components/storkAnimations.json";

import setupBirds from "../components/setupBirds";
import setupCar from "../components/setupCars";

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
    cars[i].scale.set(3, 3, 3);
  });

  return {
    storks,
    cars,
  };
}
