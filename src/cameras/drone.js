import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import * as THREE from "three";

export default class Drone {
  constructor(world) {
    this.world = world;
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new PointerLockControls(this.camera, document.body);
    this.moveSpeed = 1;
    this.velocity = new THREE.Vector3(0, 0, 0);
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
    document.addEventListener("click", () => {
      if (!this.controls.isLocked && this.world.activeCamera === this.camera) {
        this.controls.lock();
      } else {
        this.controls.unlock();
      }
    });
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
    this.world.snackbar.show("Controls locked", 1000);
  }

  onPointerUnlock() {
    this.world.snackbar.show("Controls unlocked", 1000);
  }

  moveForward(value = this.velocity.z) {
    this.controls.moveForward(value);
  }

  moveRight(value = this.velocity.x) {
    this.controls.moveRight(value);
  }

  moveUp(value = this.velocity.y) {
    this.controls.getObject().position.y += value;
  }

  updatePosition() {
    this.moveForward();
    this.moveRight();
    this.moveUp();
  }
}
