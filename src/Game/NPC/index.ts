import * as THREE from 'three';
import { BOUNDARY, CAMERA, NPC as NPC_CONFIG, PLAYER, RACETRACK } from '../constant';
import { IGame } from '../types';
import * as util from '../util';

export interface ISize {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 深度 */
  depth: number;
}
export interface INPC {
  /** 3D模型 */
  mesh: THREE.Group;
  /** 获取构造器名称 */
  getConstructorName: () => string;
  /** 重置对象属性 */
  reset: () => void;
  /** 移动 */
  move: (params: {
    /** 游戏类 */
    game: IGame;
    /** 添加NPC回调 */
    add: () => void;
    /** 越界回调 */
    out: () => void;
  }) => any;
  /** 销毁 */
  destroy: () => void;
}

export default abstract class NPC implements INPC {
  /** 尺寸 */
  protected get size(): ISize {
    return {
      width: NPC_CONFIG.width,
      height: NPC_CONFIG.height,
      depth: NPC_CONFIG.depth,
    };
  }
  /** 跑道序号 */
  private racetrackIndex: number;
  /** 3D模型 */
  mesh: THREE.Group;
  /** 渲染 */
  render() {
    const group = new THREE.Group();
    const geometry = this.createGeometry();
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0x34495e,
      transparent: true,
      opacity: 0.75,
    });
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
    });
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edgesGeometry, lineMaterial);
    const box = new THREE.Mesh(geometry, boxMaterial);
    const position = this.generatePosition();
    group.add(line);
    group.add(box);
    group.position.set(position.x, position.y, position.z);
    console.log('npc render.');
    return group;
  }
  /** 移动 */
  move(params: {
    /** 游戏类 */
    game: IGame;
    /** 添加NPC回调 */
    add: () => void;
    /** 越界回调 */
    out: () => void;
  }) {
    const { game } = params;
    const addFn = params.add;
    const outFn = params.out;
    const { player } = game;
    const playerMesh = player.mesh;
    const npcMesh = this.mesh;
    const npcMeshPosition = npcMesh.position;
    const racetrackLength = RACETRACK.height;
    // 三分之一的z坐标
    const thirdPoint = -(racetrackLength - CAMERA.z) / 1.5;
    const moveDistance = (game.speed * Math.abs(racetrackLength)) / game.fps;
    npcMeshPosition.z += moveDistance;
    // 位移三分之一距离时，添加下一个NPC
    if (npcMeshPosition.z - moveDistance <= thirdPoint && npcMeshPosition.z > thirdPoint) {
      addFn();
    }
    // np的z坐标大于摄影机的z坐标，算越界
    if (npcMeshPosition.z >= CAMERA.z) {
      outFn();
    }
    /**
     * 碰撞检测
     * 同个赛道才需要检测碰撞，提高性能
     */
    if (player.racetrackIndex === this.racetrackIndex) {
      /**
       * AABB检测法
       */
      const npcAABB = new THREE.Box3().setFromObject(npcMesh);
      const playerAABB = new THREE.Box3().setFromObject(playerMesh);
      const crashedTest = this.testAABB(npcAABB, playerAABB);
      let crashedAtNextTicker = false;
      // 高速运动时，存在穿透的问题，需要预先计算下一帧会不会发生碰撞
      if (game.speed > 5 && npcAABB.max.z + moveDistance >= playerAABB.min.z) {
        crashedAtNextTicker = true;
      }
      // 发生碰撞
      if (crashedTest || crashedAtNextTicker) {
        // 纠正A、B之间的距离
        const rectifyDistance = playerAABB.min.z - npcAABB.max.z;
        npcMeshPosition.z += rectifyDistance;
        // 游戏结束
        game.end();
      }
    }
  }
  /** 重置对象属性 */
  reset() {
    const position = this.generatePosition();
    this.racetrackIndex = this.position2RacetrackIndex(position.x);
    this.mesh.position.set(position.x, position.y, position.z);
  }
  /** 获取类名 */
  getConstructorName() {
    return this.constructor.name;
  }
  constructor() {
    this.mesh = this.render();
    this.racetrackIndex = this.position2RacetrackIndex(this.mesh.position.x);
  }
  /** 创建几何图形 */
  protected createGeometry(): THREE.Geometry {
    const { size } = this;
    return new THREE.BoxGeometry(size.width, size.height, size.depth);
  }
  /** 生成npc位置信息 */
  private generatePosition() {
    const { size } = this;
    return {
      x: (RACETRACK.width / RACETRACK.segments) * util.rnd(-2, 2, true),
      y: size.height / 2 - PLAYER.height / 2,
      // 起始点边界外
      z: BOUNDARY.zEnd - size.depth / 2,
    };
  }
  /** 根据位置确定跑道序号 */
  private position2RacetrackIndex(x: number) {
    return x / (RACETRACK.width / RACETRACK.segments);
  }
  /**
   * AABB包围盒测试法
   * @see https://developer.mozilla.org/zh-CN/docs/Games/Techniques/3D_collision_detection
   */
  private testAABB(A, B) {
    return (
      A.min.x <= B.max.x &&
      A.max.x >= B.min.x &&
      A.min.y <= B.max.y &&
      A.max.y >= B.min.y &&
      A.min.z <= B.max.z &&
      A.max.z >= B.min.z
    );
  }
  /** 销毁 */
  destroy() {
    const scene = this.mesh.parent;
    scene.remove(this.mesh);
  }
}
