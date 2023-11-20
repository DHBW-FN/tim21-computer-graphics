import { AnimationClip, AnimationMixer, VectorKeyframeTrack } from "three";
import storkAnimations from "./stork-animations.json";

/**
 * Sets up a 3D model with animations and returns the model.
 *
 * @param {Object} data - The data object containing the 3D model and animations.
 * @param {string} id - The identifier for the specific animation data in storkAnimations.
 * @returns {Object3D} The 3D model with animations set up.
 */
export default function setupModel(data, id) {
  /**
   * The 3D model extracted from the data object.
   * @type {Object3D}
   */
  const model = data.scene.children[0];

  /**
   * The animation clip extracted from the data object.
   * @type {AnimationClip}
   */
  const clip = data.animations[0];

  /**
   * The keyframe track for animating the position of the model.
   * @type {VectorKeyframeTrack}
   */
  const positionKF = new VectorKeyframeTrack(".position", storkAnimations[id].time, storkAnimations[id].positions);

  /**
   * The animation clip for moving the model based on the keyframe track.
   * @type {AnimationClip}
   */
  const moveClip = new AnimationClip("move", -1, [positionKF]);

  /**
   * The animation mixer responsible for playing and updating animations on the model.
   * @type {AnimationMixer}
   */
  const mixer = new AnimationMixer(model);

  /**
   * The first animation action playing the original clip.
   * @type {AnimationAction}
   */
  const action1 = mixer.clipAction(clip);

  /**
   * The second animation action playing the moveClip for position animation.
   * @type {AnimationAction}
   */
  const action2 = mixer.clipAction(moveClip);

  // Play both animation actions
  action1.play();
  action2.play();

  /**
   * Updates the model's animations based on the elapsed time.
   * @param {number} delta - The time elapsed since the last frame.
   */
  model.tick = (delta) => mixer.update(delta);

  return model;
}
