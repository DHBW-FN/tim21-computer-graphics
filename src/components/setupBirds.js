import { AnimationClip, AnimationMixer, VectorKeyframeTrack } from "three";
import storkAnimations from "./storkAnimations.json";

export default function setupModel(data, id) {
  const model = data.scene.children[0];
  const clip = data.animations[0];

  const positionKF = new VectorKeyframeTrack(".position", storkAnimations[id].time, storkAnimations[id].positions);

  const moveClip = new AnimationClip("move", -1, [positionKF]);

  const mixer = new AnimationMixer(model);
  const action1 = mixer.clipAction(clip);
  const action2 = mixer.clipAction(moveClip);
  action1.play();
  action2.play();

  model.tick = (delta) => mixer.update(delta);

  return model;
}
