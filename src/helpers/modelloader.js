// eslint-disable-next-line import/extensions,import/no-unresolved
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Mesh, MeshBasicMaterial } from "three";
import World from "../scene/world";
import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";

export default class ModelLoader {
  static excludeFromBoundingBox = [];

  static showBoundingBox = false;

  constructor() {
    this.loader = new GLTFLoader();
  }

  load(modelPath) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          let boundingObjects = [];

          gltf.scene.traverse((child) => {
            if (child instanceof Mesh) {
              const modifier = new SimplifyModifier();
              const boundingObject = child.clone();
              boundingObject.name = `${child.name}-boundingObject`;
              boundingObject.material = new MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });

              const count = Math.floor(boundingObject.geometry.attributes.position.count * 0.875);
              // TODO fix simplify geometry
              // boundingObject.geometry = modifier.modify(boundingObject.geometry, count);

              if (ModelLoader.showBoundingBox && !ModelLoader.excludeFromBoundingBox.includes(child.name)) {
                boundingObjects.push(boundingObject);
              }

              if (!ModelLoader.excludeFromBoundingBox.includes(child.name)) {
                World.objects.push(boundingObject);
              }
            }
          });

          gltf.scene.children = gltf.scene.children.filter((child) => {
            return !boundingObjects.some((boundingObject) => {
              return child.name.startsWith(boundingObject.name.replace("-boundingObject", ""));
            });
          });

          gltf.scene.add(...boundingObjects);

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
