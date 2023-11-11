import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import setupBirds from "../components/setupBirds";
import setupCars from "../components/setupCars";

export default async function loadModels() {
  const loader = new GLTFLoader();

  const [storkData, carData] = await Promise.all([
    loader.loadAsync("/assets/birds/Stork.glb"),
    loader.loadAsync("/assets/cars/Car.glb"),
  ]);

  const stork = setupBirds(storkData);
  const car = setupCars(carData);

  return {
    stork,
    car,
  };
}
