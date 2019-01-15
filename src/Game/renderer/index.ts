import * as THREE from 'three';
import { BACKGROUND_COLOR, RATIO, SCREEN_WIDTH, SCREEN_HEIGHT } from  '../constant';

/** WebGL渲染器 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.autoClear = false;
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
renderer.setPixelRatio(RATIO);
renderer.setClearColor(BACKGROUND_COLOR, 1);
export default renderer;
