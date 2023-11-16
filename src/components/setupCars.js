import {
  AnimationMixer,
  AnimationClip,
  VectorKeyframeTrack,
  Vector3,
  Quaternion,
  QuaternionKeyframeTrack,
} from "three";
import carAnimations from "./carAnimations.json";

/** @type {Vector3} */
const yAxis = new Vector3(0, 1, 0);

/**
 * Sets up a 3D car model with animation using provided data.
 * @function
 * @param {Object} data - The data containing the car model scene.
 * @param {number} id - The ID used to fetch animation data from carAnimations.
 * @returns {Object} The configured car model with animation.
 */
export default function setupCar(data, id) {
  /** @type {Object} */
  const model = data.scene;

  /** @type {VectorKeyframeTrack} */
  const positionKF = new VectorKeyframeTrack(".position", carAnimations[id].time, carAnimations[id].positions);

  /** @type {number[]} */
  const quaternionKeyframes = [];

  for (let i = 0; i < carAnimations[id].rotation.length; i += 1) {
    const quaternion = new Quaternion().setFromAxisAngle(yAxis, carAnimations[id].rotation[i] * Math.PI);
    quaternionKeyframes.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }

  /** @type {QuaternionKeyframeTrack} */
  const quaternionKF = new QuaternionKeyframeTrack(".quaternion", carAnimations[id].time, quaternionKeyframes);

  /** @type {AnimationClip} */
  const moveClip = new AnimationClip("move", -1, [positionKF, quaternionKF]);

  /** @type {AnimationMixer} */
  const mixer = new AnimationMixer(model);

  /** @type {AnimationAction} */
  const action = mixer.clipAction(moveClip);
  action.play();

  // Define a tick function to update the animation mixer on each frame
  model.tick = (delta) => mixer.update(delta);

  return model;
}
