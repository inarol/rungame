import * as util from './util';
import scene from './scene';
import camera from './camera';
import renderer from './renderer';
import axes from './helper/axes';
import orbitControls from './helper/orbitControls';
import Pool, { IPool } from './Pool';
import Player, { IPlayer } from './Player';
import Racetrack, { IRacetrack } from './Racetrack';
import { INPC } from './NPC';
import { BoxNPC } from  './NPC/box';
import { ConeNPC } from  './NPC/cone';

export interface IGame {
  /** 游戏速度 */
  speed: number;
  /** 游戏帧率 */
  fps: number;
  /** 玩家角色 */
  player: IPlayer;
  /** 游戏结束 */
  end: () => void;
}

/** 游戏类 */
export default class Game implements IGame{
  /** 舞台 */
  private scene: THREE.Scene;
  /** 摄影机 */
  private camera: THREE.Camera;
  /** WebGL渲染器 */
  private renderer: THREE.WebGLRenderer;
  /** 辅助坐标 */
  private axes: THREE.AxesHelper;
  /** 轨道控制器 */
  private orbitControls: THREE.OrbitControls;
  /** 对象池 */
  private pool:IPool = new Pool();
  /** 游戏主角 */
  public player: IPlayer;
  /** 跑道 */
  private racetrack: IRacetrack;
  /** npc类型 */
  private npcTypes = [BoxNPC, ConeNPC];
  /** npc */
  private npcs: INPC[] = [];
  /** 帧数（用于计时） */
  private frame: number = 0;
  /** 游戏速度 */
  private internalSpeed = 0.3;
  public get speed() {
    return this.internalSpeed;
  }
  /** 拦截速度设置，最大值为0.7 */
  public set speed(value: number) {
    const maxValue = 0.7;
    this.internalSpeed = value > maxValue ? maxValue : value;
  }
  /** 游戏帧率 */
  public fps: number = 60;
  /** 是否是游戏中 */
  private isPlaying: boolean = true;
  /** 静止（屏蔽一些动画）*/
  private silent: boolean = false;
  constructor() {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    // 辅助坐标系
    this.axes = axes;
    this.scene.add(this.axes);
    // 轨道控制器
    this.orbitControls = orbitControls(this.camera);
    // 游戏主角
    this.player = new Player();
    this.scene.add(this.player.mesh);
    // 跑道
    this.racetrack = new Racetrack();
    this.scene.add(this.racetrack.mesh);
    this.ticker();
    this.addNPC();
  }
  /** ticker */
  ticker() {
    this.frame += 1;
    this.update();
    if (!this.silent) {
      this.racetrack.update({
        game: this,
      });
    }
    if (this.isPlaying) {
      this.moveNPC();
    }
    window.requestAnimationFrame(this.ticker.bind(this));
  }
  /** 渲染 */
  update() {
    this.renderer.render(this.scene, this.camera);
    this.orbitControls.update();
  }
  /** 添加NPC */
  addNPC() {
    const rndNpc = this.npcTypes[util.rnd(0, this.npcTypes.length - 1, true)];
    const npc = this.pool.getItemByClass(rndNpc.name, rndNpc);
    this.scene.add(npc.mesh);
    this.npcs.push(npc);
  }
  /** 移动NPC */
  moveNPC() {
    this.npcs.forEach((npc, index) => {
      npc.move({
        game: this,
        add: () => {
          // 添加NPC
          this.addNPC();
        },
        out: () => {
          // 回收NPC对象
          npc.reset();
          this.pool.recover(npc.getConstructorName(), npc);
          this.npcs.splice(index, 1);
        },
      });
    });
  }
  /** 游戏结束 */
  end() {
    console.log('game end');
    this.isPlaying = false;
    this.silent = true;
  }
}
