// eslint-disable-next-line import/extensions,import/no-unresolved
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Mesh, MeshBasicMaterial } from "three";
import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";

export default class ModelLoader {
  static showBoundingBox = false;

  static ignoreCollisionObjects = [];

  static ignoreBoundingBoxDisplay = ModelLoader.ignoreCollisionObjects + ["Eiffel_Tower"];

  constructor() {
    this.loader = new GLTFLoader();
    this.boundingObjectReductionFactor = 0.875;
  }

  load(modelPath, listWithObjects) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          const modifiedGltf = { ...gltf };

          modifiedGltf.scene.children = gltf.scene.children.map((child) => {
            if (!(child instanceof Mesh)) {
              return child;
            }

            if (ModelLoader.ignoreCollisionObjects.includes(child.name)) {
              return child;
            }

            if (ModelLoader.showBoundingBox && !ModelLoader.ignoreBoundingBoxDisplay.includes(child.name)) {
              return this.getBoundingObject(child);
            }

            return child;
          });

          // Add the bounding objects to the list of collidable objects
          listWithObjects.push(
            ...modifiedGltf.scene.children
              .map((child) => {
                if (ModelLoader.ignoreCollisionObjects.includes(child.name)) {
                  return null;
                }

                return this.getBoundingObject(child);
              })
              .filter(Boolean),
          );
          // listWithObjects.push(...modifiedGltf.scene.children);
          resolve(modifiedGltf.scene);
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

  getBoundingObject(object) {
    // Calculate a bounding object
    const modifier = new SimplifyModifier();
    const boundingObject = object.clone();
    boundingObject.updateMatrixWorld();
    boundingObject.name = `${object.name}-boundingObject`;
    boundingObject.material = new MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    boundingObject.material.flatShading = true;

    const count = Math.floor(boundingObject.geometry.attributes.position.count * this.boundingObjectReductionFactor);
    // boundingObject.geometry = modifier.modify(boundingObject.geometry, count);

    return boundingObject;
  }
}
