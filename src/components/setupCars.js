import { AnimationMixer, AnimationClip, VectorKeyframeTrack } from "three";

const positionKF = new VectorKeyframeTrack(".position", [0, 3, 6], [0, 0, 0, 2, 2, 2, 0, 0, 0]);

const moveClip = new AnimationClip("move", -1, [positionKF]);

export default function setupModel(data) {
  const model = data.scene.children[0];

  const mixer = new AnimationMixer(model);
  const action = mixer.clipAction(moveClip);
  action.play();

  model.tick = (delta) => mixer.update(delta);

  return model;
}
