import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import * as THREE from "three";
import { Raycaster, Vector3 } from "three";
import Snackbar from "../components/snackbar";

export default class Drone {
  constructor(world) {
    this.world = world;
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new PointerLockControls(this.camera, document.body);
    this.moveSpeed = 1;
    this.sensitivity = 0.005;
    this.minDistance = 5;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.raycaster = new Raycaster(
      this.camera.position,
      this.camera.getWorldDirection(new Vector3()),
      0,
      this.moveSpeed + this.minDistance,
    );
    this.raycaster.firstHitOnly = true;

    this.setStartPosition();
    this.addEventListeners();
  }

  setStartPosition() {
    this.camera.position.set(370, 1, -230);
    this.camera.lookAt(615, 0, -230);
  }

  addToScene(scene) {
    scene.add(this.controls.getObject());
  }

  addEventListeners() {
    document.addEventListener("keydown", (event) => this.onKeyDown(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
    this.controls.addEventListener("lock", () => Drone.onPointerLock());
    this.controls.addEventListener("unlock", () => Drone.onPointerUnlock());
  }

  onKeyDown(event) {
    if (!this.controls.isLocked) return;

    const keyMap = {
      KeyW: new THREE.Vector3(0, 0, this.moveSpeed),
      KeyS: new THREE.Vector3(0, 0, -this.moveSpeed),
      KeyA: new THREE.Vector3(-this.moveSpeed, 0, 0),
      KeyD: new THREE.Vector3(this.moveSpeed, 0, 0),
      KeyR: new THREE.Vector3(0, this.moveSpeed, 0),
      KeyF: new THREE.Vector3(0, -this.moveSpeed, 0),
    };

    this.velocity = keyMap[event.code] || this.velocity;
  }

  onKeyUp(event) {
    const keyMap = {
      KeyW: new THREE.Vector3(0, 0, 0),
      KeyS: new THREE.Vector3(0, 0, 0),
      KeyA: new THREE.Vector3(0, 0, 0),
      KeyD: new THREE.Vector3(0, 0, 0),
      KeyR: new THREE.Vector3(0, 0, 0),
      KeyF: new THREE.Vector3(0, 0, 0),
    };

    this.velocity = keyMap[event.code] || this.velocity;
  }

  static onPointerLock() {
    Snackbar.show("Controls locked", 1000);
  }

  static onPointerUnlock() {
    Snackbar.show("Controls unlocked", 1000);
  }

  moveForward(value = this.velocity.z) {
    const direction = this.camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize().multiplyScalar(value);

    this.raycaster.set(this.camera.position, direction);
    const intersections = this.raycaster.intersectObjects(this.world.collidableObjects, true);

    if (intersections.length > 0) {
      const intersection = intersections[0];
      const { distance } = intersection;

      if (Math.abs(value) > distance - this.minDistance) {
        this.controls.moveForward(Math.sign(value) * (distance - this.minDistance));
        return;
      }
    }

    this.controls.moveForward(value);
  }

  moveRight(value = this.velocity.x) {
    const direction = this.camera
      .getWorldDirection(new THREE.Vector3())
      .setY(0)
      .normalize()
      .cross(this.camera.up)
      .multiplyScalar(value);
    this.raycaster.set(this.camera.position, direction);
    const intersections = this.raycaster.intersectObjects(this.world.collidableObjects, true);

    if (intersections.length > 0) {
      const intersection = intersections[0];
      const { distance } = intersection;

      if (Math.abs(value) > distance - this.minDistance) {
        this.controls.moveRight(Math.sign(value) * (distance - this.minDistance));
        return;
      }
    }

    this.controls.moveRight(value);
  }

  moveUp(value = this.velocity.y) {
    const direction = this.camera.up.normalize().multiplyScalar(value);
    this.raycaster.set(this.camera.position, direction);
    const intersections = this.raycaster.intersectObjects(this.world.collidableObjects, true);

    if (intersections.length > 0) {
      const intersection = intersections[0];
      const { distance } = intersection;

      if (Math.abs(value) > distance - this.minDistance) {
        this.controls.getObject().position.y += Math.sign(value) * (distance - this.minDistance);
        return;
      }
    }

    this.controls.getObject().position.y += value;
  }

  look(axis, degrees = 45) {
    const radians = (degrees * Math.PI) / 180;
    const effectiveRotation = radians * this.sensitivity;
    const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, effectiveRotation);
    this.camera.quaternion.multiplyQuaternions(quaternion, this.camera.quaternion);
  }

  updatePosition() {
    if (this.velocity.x) {
      this.moveRight();
    }
    if (this.velocity.y) {
      this.moveUp();
    }
    if (this.velocity.z) {
      this.moveForward();
    }
  }
}
