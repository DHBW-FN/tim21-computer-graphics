import {
  AnimationMixer,
  AnimationClip,
  VectorKeyframeTrack,
  Vector3,
  Quaternion,
  QuaternionKeyframeTrack,
} from "three";
import carAnimations from "./carAnimations.json";

const yAxis = new Vector3(0, 1, 0);

export default function setupCar(data, id) {
  const model = data.scene;

  const positionKF = new VectorKeyframeTrack(".position", carAnimations[id].time, carAnimations[id].positions);

  const quaternionKeyframes = [];

  for (let i = 0; i < carAnimations[id].rotation.length; i += 1) {
    const quaternion = new Quaternion().setFromAxisAngle(yAxis, carAnimations[id].rotation[i] * Math.PI);
    quaternionKeyframes.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }

  const quaternionKF = new QuaternionKeyframeTrack(".quaternion", carAnimations[id].time, quaternionKeyframes);
  const moveClip = new AnimationClip("move", -1, [positionKF, quaternionKF]);

  const mixer = new AnimationMixer(model);
  const action1 = mixer.clipAction(moveClip);
  action1.play();

  model.tick = (delta) => mixer.update(delta);

  return model;
}
