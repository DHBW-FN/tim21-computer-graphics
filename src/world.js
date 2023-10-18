import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import Drone from "./drone";
import EiffelTower from "./eiffeltower";

export default class World {
  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.controls = new PointerLockControls(
      this.camera,
      this.renderer.domElement,
    );
    this.moveSpeed = 1;
    this.drone = new Drone(this.camera, this.renderer.domElement);
    this.drone.addToScene(this.scene);
    this.drone.addEventListeners();
    this.objects = [];
    this.objects.push(new EiffelTower(this.scene));

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0xaaaaaa);

    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 50, 0);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.drone.moveForward(this.drone.velocity.z);
    this.drone.moveRight(this.drone.velocity.x);
    this.drone.updatePosition();

    this.renderer.render(this.scene, this.camera);
  }
}
