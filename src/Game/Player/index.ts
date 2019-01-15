import * as THREE from 'three';
import { PLAYER } from  '../constant';

export interface IPlayer {
  /** 3D模型 */
  mesh: THREE.Mesh;
}

/** 游戏主角 */
export default class Player implements IPlayer {
  public mesh: THREE.Mesh;
  constructor() {
    this.mesh = this.render();
  }
  private render() {
    const boxGeometry = new THREE.BoxGeometry(PLAYER.width, PLAYER.height, PLAYER.depth);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0xe67e22,
      transparent: true,
      opacity: 0.75,
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    return box;
  }
}
