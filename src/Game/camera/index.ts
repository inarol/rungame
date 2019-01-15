import * as THREE from 'three';
import { CAMERA, SCREEN_WIDTH, SCREEN_HEIGHT } from '../constant';

/** 摄影机 */
const camera = new THREE.PerspectiveCamera(
  CAMERA.fov,
  SCREEN_WIDTH / SCREEN_HEIGHT,
  CAMERA.near,
  CAMERA.far,
);
camera.position.set(CAMERA.x, CAMERA.y, CAMERA.z);
export default camera;
