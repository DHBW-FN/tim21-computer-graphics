// eslint-disable-next-line import/extensions,import/no-unresolved
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { BufferGeometry, Mesh, MeshBasicMaterial } from "three";
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";

export default class ModelLoader {
  static boundingObjectSuffix = "-boundingObject";

  static showBoundingBox = false;

  static ignoreCollisionObjects = [];

  static ignoreBoundingBoxDisplay = ModelLoader.ignoreCollisionObjects + [];

  constructor() {
    this.loader = new GLTFLoader();
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

            if (ModelLoader.showBoundingBox && !ModelLoader.ignoreBoundingBoxDisplay.includes(child.name)) {
              return ModelLoader.getBoundingObject(child);
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

                return ModelLoader.getBoundingObject(child);
              })
              .filter(Boolean),
          );

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

  static getBoundingObject(object) {
    BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    Mesh.prototype.raycast = acceleratedRaycast;

    if (object.name.endsWith(ModelLoader.boundingObjectSuffix)) {
      return object;
    }

    const boundingObject = object.clone();
    boundingObject.updateMatrixWorld();

    // Calculate a bounding object
    boundingObject.name = `${object.name}${ModelLoader.boundingObjectSuffix}`;
    boundingObject.material = new MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });

    // Compute the bounds-tree to enable faster raycasting
    boundingObject.traverse((child) => {
      if (child instanceof Mesh && !ModelLoader.ignoreCollisionObjects.includes(child.name)) {
        if (!child.geometry.boundsTree) {
          child.geometry.computeBoundsTree();
        }
      }
    });

    return boundingObject;
  }
}
