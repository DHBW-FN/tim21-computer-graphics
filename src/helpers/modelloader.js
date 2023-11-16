// eslint-disable-next-line import/extensions,import/no-unresolved
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { BufferGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial } from "three";
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";

export default class ModelLoader {
  static showBoundingBox = false;

  constructor() {
    this.loader = new GLTFLoader();

    BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    Mesh.prototype.raycast = acceleratedRaycast;
  }

  async loadAsync(model) {
    return new Promise((resolve, reject) => {
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
              const instanceMesh = child.clone();

              instanceMesh.traverse(function (node) {
                if (node.material) {
                  node.material.side = DoubleSide;
                }
              });

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

          console.log(group);
          resolve(group);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
