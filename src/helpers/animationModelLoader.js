import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import carAnimations from "../components/carAnimations.json";
import storkAnimations from "../components/storkAnimations.json";

import setupBirds from "../components/setupBirds";
import setupCar from "../components/setupCars";

export default async function loadModels() {
  const loader = new GLTFLoader();

  const [storkData1, storkData2, storkData3, storkData4, storkData5, carData1, carData2, carData3, carData4, carData5, carData6] = await Promise.all([
    loader.loadAsync("/assets/birds/Stork.glb"),
    loader.loadAsync("/assets/birds/Stork.glb"),
    loader.loadAsync("/assets/birds/Stork.glb"),
    loader.loadAsync("/assets/birds/Stork.glb"),
    loader.loadAsync("/assets/birds/Stork.glb"),
    loader.loadAsync("/assets/cars/Car.glb"),
    loader.loadAsync("/assets/cars/Car.glb"),
    loader.loadAsync("/assets/cars/Car.glb"),
    loader.loadAsync("/assets/cars/Car.glb"),
    loader.loadAsync("/assets/cars/Car.glb"),
    loader.loadAsync("/assets/cars/Car.glb"),
  ]);

  const stork1 = setupBirds(storkData1, 1);
  const stork2 = setupBirds(storkData2, 2);
  const stork3 = setupBirds(storkData3, 3);
  const stork4 = setupBirds(storkData4, 4);
  const stork5 = setupBirds(storkData5, 5);
  const car1 = setupCar(carData1, 1);
  const car2 = setupCar(carData2, 2);
  const car3 = setupCar(carData3, 3);
  const car4 = setupCar(carData4, 4);
  const car5 = setupCar(carData5, 5);
  const car6 = setupCar(carData6, 6);
  stork1.rotateZ(storkAnimations[1].rotation * Math.PI);
  stork2.rotateZ(storkAnimations[2].rotation * Math.PI);
  stork3.rotateZ(storkAnimations[3].rotation * Math.PI);
  stork4.rotateZ(storkAnimations[4].rotation * Math.PI);
  stork5.rotateZ(storkAnimations[5].rotation * Math.PI);
  car1.scale.set(3, 3, 3);
  car1.rotateY(carAnimations[1].rotation * Math.PI);
  car2.scale.set(3, 3, 3);
  car2.rotateY(carAnimations[2].rotation * Math.PI);
  car3.scale.set(3, 3, 3);
  car3.rotateY(carAnimations[3].rotation * Math.PI);
  car4.scale.set(3, 3, 3);
  car4.rotateY(carAnimations[4].rotation * Math.PI);
  car5.scale.set(3, 3, 3);
  car5.rotateY(carAnimations[5].rotation * Math.PI);
  car6.scale.set(3, 3, 3);
  car6.rotateY(carAnimations[6].rotation * Math.PI);

  return {
    stork1,
    stork2,
    stork3,
    stork4,
    stork5,
    car1,
    car2,
    car3,
    car4,
    car5,
    car6,
  };
}
