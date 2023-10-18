import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader();
  }

  load(modelPath) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          resolve(gltf.scene);
        },
        (xhr) => {
          const progress = (xhr.loaded / xhr.total) * 100;
          console.log(`Model loading progress: ${progress}%`);
        },
        (error) => {
          console.error(error);
          reject(error);
        },
      );
    });
  }
}
