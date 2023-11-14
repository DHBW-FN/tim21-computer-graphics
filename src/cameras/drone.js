import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import * as THREE from "three";
import { Raycaster, Vector3 } from "three";
import Snackbar from "../components/snackbar";

export default class Drone {
  constructor(world) {
    this.world = world;
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new PointerLockControls(this.camera, document.body);
    this.maxSpeed = 1;
    this.acceleration = this.maxSpeed / 50;
    this.sensitivity = 0.005;
    this.minDistance = 5;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.raycaster = new Raycaster(
      this.camera.position,
      this.camera.getWorldDirection(new Vector3()),
      0,
      this.maxSpeed + this.minDistance,
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
      KeyW: new THREE.Vector3(0, 0, 1),
      KeyS: new THREE.Vector3(0, 0, -1),
      KeyA: new THREE.Vector3(-1, 0, 0),
      KeyD: new THREE.Vector3(1, 0, 0),
      KeyR: new THREE.Vector3(0, 1, 0),
      KeyF: new THREE.Vector3(0, -1, 0),
    };

    const direction = keyMap[event.code] || new THREE.Vector3();
    this.velocity
      .addScaledVector(direction, this.acceleration)
      .clamp(
        new Vector3(-this.maxSpeed, -this.maxSpeed, -this.maxSpeed),
        new Vector3(this.maxSpeed, this.maxSpeed, this.maxSpeed),
      );
  }

  onKeyUp(event) {
    const keyMap = {
      KeyW: "z",
      KeyS: "z",
      KeyA: "x",
      KeyD: "x",
      KeyR: "y",
      KeyF: "y",
    };

    const coordinate = keyMap[event.code];
    if (coordinate) {
      this.velocity[coordinate] = 0;
    }
  }

  static onPointerLock() {
    Snackbar.show("Controls locked", 1000);
  }

  static onPointerUnlock() {
    Snackbar.show("Controls unlocked", 1000);
  }

  move(directionVector) {
    const direction = directionVector.clone();

    this.raycaster.set(this.camera.position, direction);
    const intersections = this.raycaster.intersectObjects(this.world.collidableObjects, true);

    if (intersections.length > 0) {
      const intersection = intersections[0];
      const { distance } = intersection;

      if (Math.abs(direction.length()) > distance - this.minDistance) {
        // Collision detected
        this.velocity.set(0, 0, 0);
        const newPosition = this.camera.position.clone().addScaledVector(direction, distance - this.minDistance);
        this.camera.position.copy(newPosition);
        return;
      }
    }

    const newPosition = this.camera.position
      .clone()
      .add(new THREE.Vector3(directionVector.x, directionVector.y, directionVector.z));
    this.camera.position.copy(newPosition);
  }

  look(axis, degrees = 45) {
    const radians = (degrees * Math.PI) / 180;
    const effectiveRotation = radians * this.sensitivity;
    const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, effectiveRotation);
    this.camera.quaternion.multiplyQuaternions(quaternion, this.camera.quaternion);
  }

  updatePosition() {
    const forwardDirection = this.camera
      .getWorldDirection(new THREE.Vector3())
      .clone()
      .setY(0)
      .normalize()
      .multiplyScalar(this.velocity.z);
    const rightDirection = this.camera
      .getWorldDirection(new THREE.Vector3())
      .clone()
      .setY(0)
      .cross(this.camera.up)
      .normalize()
      .multiplyScalar(this.velocity.x);
    const upDirection = this.camera.up.clone().multiplyScalar(this.velocity.y);

    const moveVector = forwardDirection.add(rightDirection).add(upDirection);
    this.move(moveVector);
  }
}
