import { AnimationClip, AnimationMixer, VectorKeyframeTrack } from "three";
import storkAnimations from "./storkAnimations.json";

/**
 * Sets up a 3D model with animation using provided data.
 * @function
 * @param {Object} data - The data containing the 3D model and its animations.
 * @param {number} id - The ID used to fetch animation data from storkAnimations.
 * @returns {Object} The configured 3D model with animation.
 */
export default function setupModel(data, id) {
  /** @type {Object} */
  const model = data.scene.children[0];

  /** @type {AnimationClip} */
  const clip = data.animations[0];

  /** @type {VectorKeyframeTrack} */
  const positionKF = new VectorKeyframeTrack(".position", storkAnimations[id].time, storkAnimations[id].positions);

  /** @type {AnimationClip} */
  const moveClip = new AnimationClip("move", -1, [positionKF]);

  /** @type {AnimationMixer} */
  const mixer = new AnimationMixer(model);

  /** @type {AnimationAction} */
  const action1 = mixer.clipAction(clip);
  /** @type {AnimationAction} */
  const action2 = mixer.clipAction(moveClip);

  action1.play();
  action2.play();

  // Define a tick function to update the animation mixer on each frame
  model.tick = (delta) => mixer.update(delta);

  return model;
}
