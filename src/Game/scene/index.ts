import * as THREE from 'three';
import { BACKGROUND_COLOR, VISIBLE_AREA } from '../constant';

export const topScene = new THREE.Scene();

/** 舞台 */
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(BACKGROUND_COLOR, VISIBLE_AREA.start, VISIBLE_AREA.end);
export default scene;
