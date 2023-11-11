import { AnimationMixer, AnimationClip, VectorKeyframeTrack } from "three";
import carAnimations from "./carAnimations.json";

export default function setupCar(data, id) {
  const model = data.scene;
  const positionKF = new VectorKeyframeTrack(".position", carAnimations[id].time, carAnimations[id].positions);
  const moveClip = new AnimationClip("move", -1, [positionKF]);

  const mixer = new AnimationMixer(model);
  const action = mixer.clipAction(moveClip);
  action.play();

  model.tick = (delta) => mixer.update(delta);

  return model;
}
