import * as THREE from 'three';
import { CAMERA, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constant';

/** 摄影机 */
const camera = new THREE.PerspectiveCamera(
  CAMERA.fov,
  SCREEN_WIDTH / SCREEN_HEIGHT,
  CAMERA.near,
  CAMERA.far,
);
camera.position.set(CAMERA.x, CAMERA.y, CAMERA.z);
camera.lookAt(CAMERA.lookAt.x, CAMERA.lookAt.y, CAMERA.lookAt.z);
export default camera;
