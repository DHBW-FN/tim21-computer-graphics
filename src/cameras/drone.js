import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import * as THREE from "three";
import { Mesh, Raycaster, Vector3 } from "three";
import Snackbar from "../components/snackbar";

export default class Drone {
  constructor(world) {
    this.world = world;
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new PointerLockControls(this.camera, document.body);
    this.controls.pressedKeys = new Set();
    this.maxSpeed = 0.5;
    this.acceleration = this.maxSpeed / 100;
    this.deceleration = this.maxSpeed / 50;
    this.sensitivity = 0.02;
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

    // Add flashlight
    const flashlightIntensity = 2500;
    this.flashLight = new THREE.SpotLight(0xffffff, flashlightIntensity, 50, Math.PI / 7, 1);
    this.world.lightManager.addLight(this.flashLight, "flashLight", 0, flashlightIntensity);
    this.updateFlashlight();
    this.world.scene.add(this.world.lightManager.getLight("flashLight").light);
    this.world.scene.add(this.world.lightManager.getLight("flashLight").light.target);

    this.addEventListeners();

    this.keymap = {
      KeyW: { direction: "z", sign: 1 },
      KeyS: { direction: "z", sign: -1 },
      KeyA: { direction: "x", sign: -1 },
      KeyD: { direction: "x", sign: 1 },
      KeyR: { direction: "y", sign: 1 },
      KeyF: { direction: "y", sign: -1 },
      ArrowUp: {
        action: "look",
        vector: () => {
          const forward = world.drone.camera.getWorldDirection(new THREE.Vector3());
          return forward.clone().cross(world.drone.camera.up);
        },
        degrees: 30,
      },
      ArrowDown: {
        action: "look",
        vector: () => {
          const forward = world.drone.camera.getWorldDirection(new THREE.Vector3());
          return forward.clone().cross(world.drone.camera.up);
        },
        degrees: -30,
      },
      ArrowRight: { action: "look", vector: new THREE.Vector3(0, 1, 0), degrees: -30 },
      ArrowLeft: { action: "look", vector: new THREE.Vector3(0, 1, 0), degrees: 30 },
    };
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
    this.controls.addEventListener("lock", Drone.onPointerLock);
    this.controls.addEventListener("unlock", Drone.onPointerUnlock);
  }

  onKeyDown(event) {
    if (!this.controls.isLocked) return;

    if (!this.keymap[event.code]) return;

    this.controls.pressedKeys.add(event.code);
  }

  onKeyUp(event) {
    this.controls.pressedKeys.delete(event.code);
  }

  static onPointerLock() {
    Snackbar.show("Controls locked", 1000);
  }

  static onPointerUnlock() {
    Snackbar.show("Controls unlocked", 1000);
  }

  move(directionVector) {
    if (directionVector.length() === 0) {
      return;
    }

    const direction = directionVector.clone();

    const collidableObjects = [];

    this.world.scene.traverse((child) => {
      if (child instanceof Mesh && child.collidable) {
        collidableObjects.push(child);
      }
    });

    this.raycaster.set(this.camera.position, direction);
    const intersections = this.raycaster.intersectObjects(collidableObjects, true);

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

    const newPosition = this.camera.position.clone().add(directionVector);
    this.camera.position.copy(newPosition);
  }

  look(axis, degrees = 45) {
    const radians = (degrees * Math.PI) / 180;
    const effectiveRotation = radians * this.sensitivity;
    const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, effectiveRotation);
    this.camera.quaternion.multiplyQuaternions(quaternion, this.camera.quaternion);
  }

  updatePosition() {
    const pressedKeys = Array.from(this.controls.pressedKeys);

    // Look around
    pressedKeys
      .filter((key) => this.keymap[key] && this.keymap[key].action === "look")
      .forEach((key) => {
        const mapping = this.keymap[key];
        const vector = typeof mapping.vector === "function" ? mapping.vector() : mapping.vector;
        this.look(vector, mapping.degrees);
      });

    // Decelerate
    if (!pressedKeys.includes("KeyW") && !pressedKeys.includes("KeyS")) {
      if (this.velocity.z >= 0) {
        this.velocity.z = Math.max(0, this.velocity.z - this.deceleration);
      }
      if (this.velocity.z < 0) {
        this.velocity.z = Math.min(0, this.velocity.z + this.deceleration);
      }
    }
    if (!pressedKeys.includes("KeyA") && !pressedKeys.includes("KeyD")) {
      if (this.velocity.x >= 0) {
        this.velocity.x = Math.max(0, this.velocity.x - this.deceleration);
      }
      if (this.velocity.x < 0) {
        this.velocity.x = Math.min(0, this.velocity.x + this.deceleration);
      }
    }
    if (!pressedKeys.includes("KeyR") && !pressedKeys.includes("KeyF")) {
      if (this.velocity.y >= 0) {
        this.velocity.y = Math.max(0, this.velocity.y - this.deceleration);
      }
      if (this.velocity.y < 0) {
        this.velocity.y = Math.min(0, this.velocity.y + this.deceleration);
      }
    }

    // Accelerate
    pressedKeys.forEach((key) => {
      const mapping = this.keymap[key];
      if (mapping) {
        switch (mapping.direction) {
          case "z":
            this.velocity.z += mapping.sign * this.acceleration;
            break;
          case "x":
            this.velocity.x += mapping.sign * this.acceleration;
            break;
          case "y":
            this.velocity.y += mapping.sign * this.acceleration;
            break;
          default:
            break;
        }
      }
    });

    this.velocity.clamp(
      new THREE.Vector3(-1, -1, -1).multiplyScalar(this.maxSpeed),
      new THREE.Vector3(1, 1, 1).multiplyScalar(this.maxSpeed),
    );

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
    this.updateFlashlight();
  }

  updateFlashlight() {
    this.world.lightManager.getLight("flashLight").light.position.copy(this.camera.position);
    this.world.lightManager
      .getLight("flashLight")
      .light.target.position.copy(this.camera.getWorldDirection(new Vector3()).add(this.camera.position));
  }
}
