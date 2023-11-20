import * as THREE from "three";

/**
 * Width of each grass blade.
 * @constant
 * @type {number}
 */
const BLADE_WIDTH = 0.1;

/**
 * Height of each grass blade.
 * @constant
 * @type {number}
 */
const BLADE_HEIGHT = 0.8;

/**
 * Variation in height for each grass blade.
 * @constant
 * @type {number}
 */
const BLADE_HEIGHT_VARIATION = 0.6;

/**
 * Number of vertices in each grass blade.
 * @constant
 * @type {number}
 */
const BLADE_VERTEX_COUNT = 5;

/**
 * Offset for the tip of each grass blade.
 * @constant
 * @type {number}
 */
const BLADE_TIP_OFFSET = 0.1;

/**
 * Interpolate a value from one range to another.
 * @function
 * @param {number} val - The value to interpolate.
 * @param {number} oldMin - The minimum value in the original range.
 * @param {number} oldMax - The maximum value in the original range.
 * @param {number} newMin - The minimum value in the target range.
 * @param {number} newMax - The maximum value in the target range.
 * @returns {number} - The interpolated value.
 */
function interpolate(val, oldMin, oldMax, newMin, newMax) {
  return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

/**
 * Custom Three.js BufferGeometry for rendering grass.
 * @class
 * @extends THREE.BufferGeometry
 */
class GrassGeometry extends THREE.BufferGeometry {
  /**
   * Create an instance of GrassGeometry.
   *
   * @constructor
   * @param {THREE.Vector3} position - The base position for the grass.
   * @param {number} sizeX - The size of the area in the X direction.
   * @param {number} sizeY - The size of the area in the Y direction.
   * @param {number} count - The number of grass instances.
   */
  constructor(position, sizeX, sizeY, count) {
    super();

    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i < count; i += 1) {
      const x = position.x + (Math.random() - 0.5) * sizeX;
      const { y } = position;
      const z = position.z + (Math.random() - 0.5) * sizeY;

      uvs.push(
        ...Array.from({ length: BLADE_VERTEX_COUNT }).flatMap(() => [
          interpolate(x, -sizeX / 2, sizeX / 2, 0, 1),
          interpolate(z, -sizeY / 2, sizeY / 2, 0, 1),
        ]),
      );

      const blade = GrassGeometry.computeBlade([x, y, z], i);
      positions.push(...blade.positions);
      indices.push(...blade.indices);
    }

    this.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    this.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
    this.setIndex(indices);
    this.computeVertexNormals();
  }

  /**
   * Compute the vertices and indices for a grass blade.
   *
   * @static
   * @function
   * @param {number[]} center - The center position of the grass blade.
   * @param {number} index - The index of the grass blade.
   * @returns {object} - Object containing positions and indices for the grass blade.
   */
  static computeBlade(center, index = 0) {
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION;
    const vIndex = index * BLADE_VERTEX_COUNT;

    const yaw = Math.random() * Math.PI * 2;
    const yawVec = [Math.sin(yaw), 0, -Math.cos(yaw)];
    const bend = Math.random() * Math.PI * 2;
    const bendVec = [Math.sin(bend), 0, -Math.cos(bend)];

    const bl = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) + center[i]);
    const br = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * -1 + center[i]);
    const tl = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) + center[i]);
    const tr = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * -1 + center[i]);
    const tc = bendVec.map((n, i) => n * BLADE_TIP_OFFSET + center[i]);

    tl[1] += height / 2;
    tr[1] += height / 2;
    tc[1] += height;

    return {
      positions: [...bl, ...br, ...tr, ...tl, ...tc],
      indices: [vIndex, vIndex + 1, vIndex + 2, vIndex + 2, vIndex + 4, vIndex + 3, vIndex + 3, vIndex, vIndex + 2],
    };
  }
}

export default GrassGeometry;
