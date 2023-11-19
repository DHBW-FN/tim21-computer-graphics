import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import * as THREE from "three";
import { Mesh, Raycaster, Vector3 } from "three";
import Snackbar from "../components/snackbar";

/**
 * Class representing a drone with controls for movement and interaction.
 * @class
 */
export default class Drone {
  /**
   * Create a drone instance.
   * @constructor
   * @param {Object} world - The world object containing the scene and other elements.
   */
  constructor(world) {
    /**
     * Reference to the world object containing the scene and other elements.
     * @type {Object}
     */
    this.world = world;

    /**
     * The camera used for the drone's perspective.
     * @type {THREE.PerspectiveCamera}
     */
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    /**
     * Controls for the drone using Pointer Lock API.
     * @type {PointerLockControls}
     */
    this.controls = new PointerLockControls(this.camera, document.body);
    this.controls.pressedKeys = new Set();

    /**
     * Maximum speed of the drone.
     * @type {number}
     */
    this.maxSpeed = 0.5;

    /**
     * Acceleration rate of the drone.
     * @type {number}
     */
    this.acceleration = this.maxSpeed / 100;

    /**
     * Deceleration rate of the drone.
     * @type {number}
     */
    this.deceleration = this.maxSpeed / 50;

    /**
     * Sensitivity of the drone's controls.
     * @type {number}
     */
    this.sensitivity = 0.02;

    /**
     * Minimum distance to maintain from collidable objects.
     * @type {number}
     */
    this.minDistance = 5;

    /**
     * Velocity vector representing the drone's movement.
     * @type {THREE.Vector3}
     */
    this.velocity = new THREE.Vector3(0, 0, 0);

    /**
     * Raycaster used for collision detection.
     * @type {THREE.Raycaster}
     */
    this.raycaster = new Raycaster(
      this.camera.position,
      this.camera.getWorldDirection(new Vector3()),
      0,
      this.maxSpeed + this.minDistance,
    );
    this.raycaster.firstHitOnly = true;

    // Set initial position and set up event listeners
    this.setStartPosition();

    // Add flashlight
    const flashlightIntensity = 2500;
    this.flashLight = new THREE.SpotLight(0xffffff, flashlightIntensity, 50, Math.PI / 7, 1);
    this.flashLight.castShadow = false;
    this.world.lightManager.addLight(this.flashLight, "flashLight", 0, flashlightIntensity);
    this.updateFlashlight();
    this.world.scene.add(this.world.lightManager.getLight("flashLight").light);
    this.world.scene.add(this.world.lightManager.getLight("flashLight").light.target);

    this.addEventListeners();

    /**
     * Keymap for drone controls.
     * @type {Object}
     */
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

  /**
   * Set the initial position of the drone.
   */
  setStartPosition() {
    this.camera.position.set(370, 1, -230);
    this.camera.lookAt(615, 0, -230);
  }

  /**
   * Add the drone's controls to the specified scene.
   * @param {THREE.Scene} scene - The scene to add the controls to.
   */
  addToScene(scene) {
    scene.add(this.controls.getObject());
  }

  /**
   * Add event listeners for keydown, keyup, pointer lock, and pointer unlock events.
   */
  addEventListeners() {
    document.addEventListener("keydown", (event) => this.onKeyDown(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
    this.controls.addEventListener("lock", Drone.onPointerLock);
    this.controls.addEventListener("unlock", Drone.onPointerUnlock);
  }

  /**
   * Handle keydown events for controlling the drone.
   * @param {KeyboardEvent} event - The keydown event.
   */
  onKeyDown(event) {
    if (!this.controls.isLocked) return;

    if (!this.keymap[event.code]) return;

    this.controls.pressedKeys.add(event.code);
  }

  /**
   * Handle keyup events for controlling the drone.
   * @param {KeyboardEvent} event - The keyup event.
   */
  onKeyUp(event) {
    this.controls.pressedKeys.delete(event.code);
  }

  /**
   * Static method called when the pointer is locked.
   * Shows a snackbar message indicating that controls are locked.
   */
  static onPointerLock() {
    Snackbar.show("Controls locked", 1000);
  }

  /**
   * Static method called when the pointer is unlocked.
   * Shows a snackbar message indicating that controls are unlocked.
   */
  static onPointerUnlock() {
    Snackbar.show("Controls unlocked", 1000);
  }

  /**
   * Move the drone in the specified direction, considering collisions.
   * @param {THREE.Vector3} directionVector - The direction vector to move the drone.
   */
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

  /**
   * Rotate the drone's camera view along a specified axis by a given angle in degrees.
   * @param {THREE.Vector3} axis - The axis of rotation.
   * @param {number} [degrees=45] - The angle of rotation in degrees.
   */
  look(axis, degrees = 45) {
    const radians = (degrees * Math.PI) / 180;
    const effectiveRotation = radians * this.sensitivity;
    const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, effectiveRotation);
    this.camera.quaternion.multiplyQuaternions(quaternion, this.camera.quaternion);
  }

  /**
   * Update the position of the drone based on user input and velocity.
   */
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
