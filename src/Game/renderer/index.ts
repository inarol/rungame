import * as THREE from 'three';
import { RATIO, SCREEN_WIDTH, SCREEN_HEIGHT } from  '../constant';

/** WebGL渲染器 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
renderer.setPixelRatio(RATIO);
export default renderer;
