import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import * as THREE from "three";

export default class Drone {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.controls = new PointerLockControls(this.camera, document.body);
    this.moveSpeed = 1;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.controls.getObject().position.set(0, 0, 100);
    this.controls.getObject().lookAt(0, 50, 0);
    this.addEventListeners();
  }

  addToScene(scene) {
    scene.add(this.controls.getObject());
  }

  addEventListeners() {
    document.addEventListener("keydown", (event) => this.onKeyDown(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
    document.addEventListener("click", () => this.controls.lock(), false);
    this.controls.addEventListener("lock", () => this.onPointerLock());
    this.controls.addEventListener("unlock", () => this.onPointerUnlock());
  }

  onKeyDown(event) {
    switch (event.code) {
      case "KeyW":
        this.velocity.z = this.moveSpeed;
        break;
      case "KeyS":
        this.velocity.z = -this.moveSpeed;
        break;
      case "KeyA":
        this.velocity.x = -this.moveSpeed;
        break;
      case "KeyD":
        this.velocity.x = this.moveSpeed;
        break;
      case "Space":
        this.velocity.y = this.moveSpeed;
        break;
      case "ControlLeft":
        this.velocity.y = -this.moveSpeed;
        break;
      default:
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
      case "KeyS":
        this.velocity.z = 0;
        break;
      case "KeyA":
      case "KeyD":
        this.velocity.x = 0;
        break;
      case "Space":
      case "ControlLeft":
        this.velocity.y = 0;
        break;
      default:
        break;
    }
  }

  onPointerLock() {
    // Hide UI or pause game
  }

  onPointerUnlock() {
    // Show UI or unpause game
  }

  moveForward(value) {
    this.controls.moveForward(value);
  }

  moveRight(value) {
    this.controls.moveRight(value);
  }

  updatePosition() {
    this.controls.getObject().position.y += this.velocity.y;
  }
}
