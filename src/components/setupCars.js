import {AnimationMixer, AnimationClip, VectorKeyframeTrack, Vector3, Quaternion, QuaternionKeyframeTrack} from "three";
import carAnimations from "./carAnimations.json";

const yAxis = new Vector3(0, 1, 0);

export default function setupCar(data, id) {
  const model = data.scene;

  console.log(carAnimations[id].rotation);
  console.log(carAnimations[id].rotation[0]);

  const q0 = new Quaternion().setFromAxisAngle(yAxis, carAnimations[id].rotation[0] * Math.PI);
  const q1 = new Quaternion().setFromAxisAngle(yAxis, carAnimations[id].rotation[1] * Math.PI);
  const q2 = new Quaternion().setFromAxisAngle(yAxis, carAnimations[id].rotation[2] * Math.PI);
  const q3 = new Quaternion().setFromAxisAngle(yAxis, carAnimations[id].rotation[3] * Math.PI);
  const q4 = new Quaternion().setFromAxisAngle(yAxis, carAnimations[id].rotation[4] * Math.PI);
  const q5 = new Quaternion().setFromAxisAngle(yAxis, carAnimations[id].rotation[5] * Math.PI);
  const q6 = new Quaternion().setFromAxisAngle(yAxis, carAnimations[id].rotation[6] * Math.PI);

  const positionKF = new VectorKeyframeTrack(".position", carAnimations[id].time, carAnimations[id].positions);
  const quaternionKF = new QuaternionKeyframeTrack('.quaternion', carAnimations[id].time, [q0.x, q0.y, q0.z, q0.w, q1.x, q1.y, q1.z, q1.w, q2.x, q2.y, q2.z, q2.w, q3.x, q3.y, q3.z, q3.w, q4.x, q4.y, q4.z, q4.w, q5.x, q5.y, q5.z, q5.w, q6.x, q6.y, q6.z, q6.w]);
  const moveClip = new AnimationClip("move", -1, [positionKF, quaternionKF]);

  const mixer = new AnimationMixer(model);
  const action1 = mixer.clipAction(moveClip);
  action1.play();

  model.tick = (delta) => mixer.update(delta);

  return model;
}
