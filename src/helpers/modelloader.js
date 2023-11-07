// eslint-disable-next-line import/extensions,import/no-unresolved
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import World from "../scene/world";

export default class ModelLoader {
  static excludeFromBoundingBox = ["Grass", "Eiffeltower_base", "Houses_base", "Walk_path", "Street", "Sidewalk"];

  static showBoundingBox = false;

  constructor() {
    this.loader = new GLTFLoader();
  }

  load(modelPath) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          gltf.scene.traverse((child) => {
            if (child instanceof Mesh) {
              if (ModelLoader.showBoundingBox && !ModelLoader.excludeFromBoundingBox.includes(child.name)) {
                const boundingBox = new Box3().setFromObject(child);
                const size = new Vector3();
                boundingBox.getSize(size);
                const material = new MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
                const geometry = new BoxGeometry(size.x, size.y, size.z);
                const redBox = new Mesh(geometry, material);
                boundingBox.getCenter(redBox.position);
                gltf.scene.add(redBox);
              }

              World.objects.push(child);
            }
          });

          resolve(gltf.scene);
        },
        (xhr) => {
          const progress = (xhr.loaded / xhr.total) * 100;
          // eslint-disable-next-line no-console
          console.log(`Model loading progress: ${progress}%`);
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error(error);
          reject(error);
        },
      );
    });
  }
}
