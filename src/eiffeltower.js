import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

export default class EiffelTower {
  constructor(scene) {
    this.loader = new GLTFLoader();
    this.loader.load(
      "/assets/models/eiffel.glb",
      this.onLoad.bind(this),
      undefined,
      this.onError.bind(this),
      this.onProgress.bind(this),
    );
    this.scene = scene;
  }

  onLoad(gltf) {
    this.scene.add(gltf.scene);

    this.scene.traverse((object) => {
      if (object instanceof THREE.Light) {
        object.intensity = object.intensity * 0.001;
      }
    });
  }

  onError(error) {
    console.error(error);
  }

  onProgress(xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  }
}
