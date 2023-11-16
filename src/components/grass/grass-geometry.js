import * as THREE from "three";

const BLADE_WIDTH = 0.1;
const BLADE_HEIGHT = 0.8;
const BLADE_HEIGHT_VARIATION = 0.6;
const BLADE_VERTEX_COUNT = 5;
const BLADE_TIP_OFFSET = 0.1;

function interpolate(val, oldMin, oldMax, newMin, newMax) {
  return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

export default class GrassGeometry extends THREE.BufferGeometry {
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
