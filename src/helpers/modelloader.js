// eslint-disable-next-line import/extensions,import/no-unresolved
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { BufferGeometry, Group, Mesh, MeshBasicMaterial } from "three";
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";

/**
 * A utility class for loading and managing 3D models using GLTFLoader.
 * @class
 */
export default class ModelLoader {
  /**
   * Indicates whether to show bounding boxes for loaded models.
   * @static
   * @type {boolean}
   */
  static showBoundingBox = false;

  /**
   * Constructs a new instance of the ModelLoader class.
   * @constructor
   */
  constructor() {
    /** @type {GLTFLoader} */
    this.loader = new GLTFLoader();

    // Extend BufferGeometry with BVH methods
    BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    Mesh.prototype.raycast = acceleratedRaycast;
  }

  /**
   * Asynchronously loads a 3D model and returns a Promise that resolves to a Group.
   * @method
   * @param {Object} model - The model configuration object containing 'path' and 'instances'.
   * @returns {Promise<Group>} A Promise that resolves to a Group containing instances of the loaded model.
   */
  async loadAsync(model) {
    return new Promise((resolve, reject) => {
      /** @type {Group} */
      const group = new Group();

      this.loader
        .loadAsync(model.path)
        .then((gltf) => gltf.scene)
        .then((scene) => {
          scene.traverse((modelChild) => {
            const child = modelChild;
            if (!(child instanceof Mesh)) {
              return;
            }

            if (ModelLoader.showBoundingBox) {
              child.material = new MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
            }

            if (!child.geometry.boundsTree) {
              child.geometry.computeBoundsTree();
            }

            model.instances.forEach((instance, index) => {
              /** @type {Mesh} */
              const instanceMesh = child.clone();
              instanceMesh.updateMatrixWorld();
              if (instance.position) {
                instanceMesh.position.copy(instance.position);
              }
              if (instance.rotation) {
                instanceMesh.rotation.copy(instance.rotation);
              }
              if (instance.scale) {
                instanceMesh.scale.copy(instance.scale);
              }
              if (instance.castShadow !== false) {
                instanceMesh.castShadow = true;
              }
              if (instance.receiveShadow !== false) {
                instanceMesh.receiveShadow = true;
              }
              if (instance.collidable !== false) {
                instanceMesh.collidable = true;
              }

              instanceMesh.name = `${child.name}-${index}`;
              group.add(instanceMesh);
            });
          });

          resolve(group);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
