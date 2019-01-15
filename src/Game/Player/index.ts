import * as THREE from 'three';
import { PLAYER } from  '../constant';

interface ISize {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 深度 */
  depth: number;
}

export interface IPlayer {
  /** 尺寸 */
  size: ISize;
  /** 3D模型 */
  mesh: THREE.Group;
  /** 跑道序号 */
  racetrackIndex: number;
}

/** 游戏主角 */
export default class Player implements IPlayer {
  /** 尺寸 */
  public size: ISize = {
    width: PLAYER.width,
    height: PLAYER.height,
    depth: PLAYER.depth,
  };
  /** 3D模型 */
  public mesh: THREE.Group;
  public racetrackIndex = 0;
  public render() {
    const size = this.size;
    const group = new THREE.Group();
    const boxGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0xe67e22,
      transparent: true,
      opacity: 0.75,
    });
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
    });
    const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    const line = new THREE.LineSegments(edgesGeometry, lineMaterial);
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    group.add(line);
    group.add(box);
    return group;
  }
  constructor() {
    this.mesh = this.render();
  }
}
