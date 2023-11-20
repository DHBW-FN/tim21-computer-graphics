import {
  AnimationClip,
  AnimationMixer,
  Quaternion,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack,
} from "three";
import carAnimations from "./car-animations.json";

const yAxis = new Vector3(0, 1, 0);

/**
 * Sets up a 3D car model with animations and returns the model.
 *
 * @param {Object} data - The data object containing the 3D car model and animations.
 * @param {string} id - The identifier for the specific animation data in carAnimations.
 * @returns {Object3D} The 3D car model with animations set up.
 */
export default function setupCar(data, id) {
  /**
   * The 3D car model extracted from the data object.
   * @type {Object3D}
   */
  const model = data.scene;

  /**
   * The keyframe track for animating the position of the car model.
   * @type {VectorKeyframeTrack}
   */
  const positionKF = new VectorKeyframeTrack(".position", carAnimations[id].time, carAnimations[id].positions);

  /**
   * An array of quaternion keyframes for animating the rotation of the car model.
   * @type {number[]}
   */
  const quaternionKeyframes = [];

  for (let i = 0; i < carAnimations[id].rotation.length; i += 1) {
    const quaternion = new Quaternion().setFromAxisAngle(yAxis, carAnimations[id].rotation[i] * Math.PI);
    quaternionKeyframes.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }

  /**
   * The keyframe track for animating the quaternion rotation of the car model.
   * @type {QuaternionKeyframeTrack}
   */
  const quaternionKF = new QuaternionKeyframeTrack(".quaternion", carAnimations[id].time, quaternionKeyframes);

  /**
   * The animation clip for moving and rotating the car model.
   * @type {AnimationClip}
   */
  const moveClip = new AnimationClip("move", -1, [positionKF, quaternionKF]);

  /**
   * The animation mixer responsible for playing and updating animations on the car model.
   * @type {AnimationMixer}
   */
  const mixer = new AnimationMixer(model);

  /**
   * The animation action playing the moveClip for position and rotation animation.
   * @type {AnimationAction}
   */
  const action = mixer.clipAction(moveClip);

  // Play the animation action
  action.play();

  /**
   * Updates the car model's animations based on the elapsed time.
   * @param {number} delta - The time elapsed since the last frame.
   */
  model.tick = (delta) => mixer.update(delta);

  return model;
}
