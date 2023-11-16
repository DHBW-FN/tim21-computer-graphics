import * as THREE from "three";
import { fragmentShader, vertexShader } from "./GrassShaders";
import GrassGeometry from "./GrassGeometry";

const cloudTexture = new THREE.TextureLoader().load("/assets/cloud.jpg");
cloudTexture.wrapS = THREE.RepeatWrapping;
cloudTexture.wrapT = THREE.RepeatWrapping;

class Grass extends THREE.Mesh {
  constructor(position, sizeX, sizeY, count) {
    const geometry = new GrassGeometry(position, sizeX, sizeY, count);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uCloud: { value: cloudTexture },
        uTime: { value: 0 },
      },
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader,
    });
    super(geometry, material);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(sizeX, sizeY, 1, 1).rotateX(Math.PI / 2), material);
    floor.position.set(position.x, position.y, position.z);
    this.add(floor);
  }

  update(time) {
    this.material.uniforms.uTime.value = time;
  }
}

export default Grass;
