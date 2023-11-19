// eslint-disable-next-line import/extensions,import/no-unresolved
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { BufferGeometry, DoubleSide, Group, MathUtils, Mesh, MeshBasicMaterial } from "three";
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";

/**
 * Utility class for loading 3D models with additional functionality like bounding boxes and instance handling.
 */
export default class ModelLoader {
  /**
   * Flag indicating whether bounding boxes should be shown for loaded models.
   * @type {boolean}
   */
  static showBoundingBox = false;

  /**
   * Creates an instance of ModelLoader.
   */
  constructor() {
    /**
     * The GLTFLoader instance used for loading 3D models.
     * @type {GLTFLoader}
     */
    this.loader = new GLTFLoader();

    // Extend BufferGeometry prototype with bounds tree computation and disposal
    BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

    // Extend Mesh prototype with accelerated raycasting
    Mesh.prototype.raycast = acceleratedRaycast;
  }

  /**
   * Asynchronously loads a 3D model, handles instances, and optionally shows bounding boxes.
   *
   * @param {Object} model - The model configuration object.
   * @param {string} model.path - The path to the GLTF model.
   * @param {Object[]} model.instances - An array of instances with position, rotation, and scale information.
   * @returns {Promise<Group>} A promise resolving to a Three.js Group containing the loaded and configured model.
   */
  async loadAsync(model) {
    return new Promise((resolve, reject) => {
      /**
       * The Three.js Group to which the loaded model and its instances will be added.
       * @type {Group}
       */
      const group = new Group();
      const debugMaterial = new MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });

      this.loader
        .loadAsync(model.path)
        .then((gltf) => gltf.scene)
        .then((scene) => {
          scene.traverse((modelChild) => {
            const child = modelChild;
            if (!(child instanceof Mesh)) {
              return;
            }

            // Optionally show bounding boxes
            if (ModelLoader.showBoundingBox) {
              child.material = debugMaterial;
            }

            // Compute bounds tree if not already present
            if (!child.geometry.boundsTree) {
              child.geometry.computeBoundsTree();
            }

            model.instances.forEach((instance, index) => {
              const instanceMesh = child.clone();

              // Fix for one-sided transparency of Eiffel Tower
              instanceMesh.traverse((node) => {
                if (node.material) {
                  // eslint-disable-next-line no-param-reassign
                  node.material.side = DoubleSide;
                }
              });

              if (instance.position) {
                instanceMesh.position.copy(instance.position);
              }
              if (instance.rotation) {
                instanceMesh.rotation.set(
                  MathUtils.degToRad(instance.rotation.x),
                  MathUtils.degToRad(instance.rotation.y),
                  MathUtils.degToRad(instance.rotation.z),
                );
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
