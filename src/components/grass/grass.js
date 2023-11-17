import * as THREE from "three";
import { UniformsLib } from "three";
import { fragmentShader, vertexShader } from "./grass-shaders";
import GrassGeometry from "./grass-geometry";

const cloudTexture = new THREE.TextureLoader().load("/assets/cloud.jpg");
cloudTexture.wrapS = THREE.RepeatWrapping;
cloudTexture.wrapT = THREE.RepeatWrapping;

class Grass extends THREE.Mesh {
  constructor(position, sizeX, sizeY, count) {
    const geometry = new GrassGeometry(position, sizeX, sizeY, count);

    const combinedUniforms = {
      ...UniformsLib.lights,
      ...UniformsLib.fog,
      uCloud: { value: cloudTexture },
      uTime: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms: combinedUniforms,
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader,
      fog: true,
      lights: true,
      dithering: true,
    });

    super(geometry, material);

    this.material.receiveShadow = true;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(sizeX, sizeY, 1, 1).rotateX(Math.PI / 2), material);
    floor.collidable = true;
    floor.receiveShadow = true;
    floor.position.set(position.x, position.y, position.z);
    this.add(floor);
  }

  update(time) {
    this.material.uniforms.uTime.value = time;
  }
}

export default Grass;
