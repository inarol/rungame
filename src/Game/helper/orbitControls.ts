import * as THREE from 'three';
import * as ThreeOrbitControls from 'three-orbit-controls';
import { CAMERA } from '../constant';

export default (camera: THREE.Camera): THREE.OrbitControls => {
  const orbitControls: THREE.OrbitControls = new (ThreeOrbitControls(THREE))(camera, window);
  orbitControls.target = new THREE.Vector3(CAMERA.lookAt.x, CAMERA.lookAt.y, CAMERA.lookAt.z);
  return orbitControls;
};
