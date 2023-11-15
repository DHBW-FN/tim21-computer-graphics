// eslint-disable-next-line import/extensions,import/no-unresolved
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { BufferGeometry, Group, Mesh, MeshBasicMaterial } from "three";
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
              instanceMesh.updateMatrixWorld();
              // if instance.position is set, use it, otherwise leave it as is
              if (instance.position) {
                instanceMesh.position.set(instance.position.x, instance.position.y, instance.position.z);
              }
              if (instance.rotation) {
                instanceMesh.rotation.set(instance.rotation.x, instance.rotation.y, instance.rotation.z);
              }
              if (instance.scale) {
                instanceMesh.scale.set(instance.scale.x, instance.scale.y, instance.scale.z);
              }
              instanceMesh.collidable = instance.collidable !== false;
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
