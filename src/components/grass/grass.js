import * as THREE from "three";
import { UniformsLib } from "three";
import { fragmentShader, vertexShader } from "./grass-shaders";
import GrassGeometry from "./grass-geometry";

/**
 * Represents a grass mesh with a shader-based material.
 * @class
 * @extends THREE.Mesh
 */
class Grass extends THREE.Mesh {
  /**
   * Creates a Grass instance.
   * @param {THREE.Vector3} position - The position of the grass.
   * @param {number} sizeX - The size of the grass along the X-axis.
   * @param {number} sizeY - The size of the grass along the Y-axis.
   * @param {number} count - The number of grass blades.
   */
  constructor(position, sizeX, sizeY, count) {
    const geometry = new GrassGeometry(position, sizeX, sizeY, count);

    const combinedUniforms = {
      ...UniformsLib.lights,
      ...UniformsLib.fog,
      uCloud: { value: cloudTexture },
      uTime: { value: 0 },
      uLightIntensity: { value: 1 },
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
    this.receiveShadow = true;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(sizeX, sizeY, 1, 1).rotateX(Math.PI / 2), material);
    floor.collidable = true;
    floor.receiveShadow = true;
    floor.position.set(position.x, position.y, position.z);
    this.add(floor);
  }

  /**
   * Updates the grass animation and appearance.
   * @param {number} time - The current time.
   * @param {number} [lightIntensity=1] - The intensity of light affecting the grass.
   */
  update(time, lightIntensity = 1) {
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uLightIntensity.value = lightIntensity;
  }
}

export default Grass;
