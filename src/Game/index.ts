import * as THREE from 'three';
import * as util from './util';
import { IAudioList, IAudioJsonList } from '../preload';
import { EventEmitter } from 'fbemitter';
import { scene, topScene } from './scene';
import camera from './camera';
import renderer from './renderer';
import axes from './helper/axes';
// import orbitControls from './helper/orbitControls';
import Pool, { IPool } from './Pool';
import Gamepad from './Gamepad';
import Player, { IPlayer } from './Player';
import Racetrack, { IRacetrack } from './Racetrack';
import { INPC } from './NPC';
import { BoxNPC } from './NPC/box';
import { ConeNPC } from './NPC/cone';
import Score, { IScore } from './Score';
import MusicFrame, { IMusicFrame } from './MusicFrame';
import Menu, { IMenu } from './Menu';

export interface IGame {
  /** 音频文件 */
  audio: InnerAudioContext;
  /** 音频解析文件 */
  audioJson: JSON;
  /** 字体文件 */
  font: string;
  /** 事件总线 */
  emitter: EventEmitter;
  /** 摄影机 */
  camera: THREE.Camera;
  /** 游戏速度 */
  speed: number;
  /** 游戏帧率 */
  fps: number;
  /** 玩家角色 */
  player: IPlayer;
  /** 开始游戏 */
  start: () => void;
  /** 游戏结束 */
  end: () => void;
  /** 是否是游戏中 */
  isPlaying: boolean;
  /** 静止（屏蔽一些动画）*/
  silent: boolean;
  /** 帧数（用于计时） */
  frame: number;
}

/** 游戏类 */
export default class Game implements IGame {
  /** 音频文件 */
  private audioList: IAudioList;
  /** 音频解析 */
  private audioListJson: IAudioJsonList;
  /** 音频文件 */
  public audio: InnerAudioContext;
  /** 音频解析 */
  public audioJson: JSON;
  /** 字体文件 */
  public font;
  /** 舞台 */
  private scene: THREE.Scene;
  /** 舞台（放置顶层元素） */
  private topScene: THREE.Scene;
  /** 摄影机 */
  public camera: THREE.Camera;
  /** WebGL渲染器 */
  private renderer: THREE.WebGLRenderer;
  /** 事件总线 */
  public emitter: EventEmitter;
  /** 辅助坐标 */
  private axes: THREE.AxesHelper;
  /** 轨道控制器 */
  private orbitControls: THREE.OrbitControls;
  /** 游戏控制器 */
  private gamePad;
  /** 对象池 */
  private pool: IPool = new Pool();
  /** 菜单 */
  private menu: IMenu;
  /** 游戏主角 */
  public player: IPlayer;
  /** 跑道 */
  private racetrack: IRacetrack;
  /** npc类型 */
  private npcTypes = [BoxNPC, ConeNPC];
  /** npc */
  private npcs: INPC[] = [];
  /** 计分 */
  private score: IScore;
  /** 音乐动画 */
  private musicFrame: IMusicFrame;
  /** 帧数（用于计时） */
  public frame: number = 0;
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
  public isPlaying: boolean = false;
  /** 静止（屏蔽一些动画）*/
  public silent: boolean = false;
  constructor(params: {
    /** 音频文件 */
    audioList: IAudioList;
    /** 音频解析 */
    audioListJson: IAudioJsonList;
    /** 字体文件 */
    font: string;
  }) {
    const { audioList, audioListJson, font } = params;
    this.audioList = audioList;
    this.audioListJson = audioListJson;
    this.audio = audioList.begin;
    this.audioJson = audioListJson.begin;
    this.font = font;
    this.scene = scene;
    this.topScene = topScene;
    this.camera = camera;
    this.renderer = renderer;
    // 事件总线
    this.emitter = new EventEmitter();
    // 辅助坐标系
    this.axes = axes;
    this.scene.add(this.axes);
    // 轨道控制器
    // this.orbitControls = orbitControls(this.camera);
    // 游戏控制器
    this.gamePad = new Gamepad({
      game: this,
    });
    // 游戏菜单
    this.menu = new Menu({
      game: this,
    });
    this.topScene.add(this.menu.mesh);
    // 游戏主角
    this.player = new Player({
      game: this,
    });
    this.scene.add(this.player.mesh);
    // 跑道
    this.racetrack = new Racetrack();
    this.scene.add(this.racetrack.mesh);
    // 计分
    this.score = new Score({
      game: this,
    });
    // 音乐动画
    this.musicFrame = new MusicFrame({
      game: this,
    });
    this.scene.add(this.musicFrame.mesh);
    // ticker
    this.ticker();
    // 异步添加元素到舞台
    this.asyncAdd();
    // 播放音乐
    this.playAudio('begin');
    // 添加NPC
    this.addNPC();
  }
  /** 异步添加元素 */
  private async asyncAdd() {
    this.score.mesh = await this.score.render();
    this.topScene.add(this.score.mesh);
  }
  /** ticker */
  private ticker() {
    this.frame += 1;
    this.update();
    this.player.update();
    this.musicFrame.update();
    if (!this.silent) {
      this.racetrack.update({
        game: this,
      });
    }
    if (this.isPlaying) {
      this.moveNPC();
      this.count();
    }
    window.requestAnimationFrame(this.ticker.bind(this));
  }
  /** 渲染 */
  private update() {
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.render(this.topScene, this.camera);
    // this.orbitControls.update();
  }
  /** 添加NPC */
  private addNPC() {
    const rndNpc = this.npcTypes[util.rnd(0, this.npcTypes.length - 1, true)];
    const npc = this.pool.getItemByClass(rndNpc.name, rndNpc);
    this.scene.add(npc.mesh);
    this.npcs.push(npc);
  }
  /** 移动NPC */
  private moveNPC() {
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
  /** 开始游戏 */
  public start() {
    this.isPlaying = true;
    this.toggleAudio('bgm');
  }
  /** 游戏结束 */
  public end() {
    console.log('game end');
    this.stopAudio('bgm');
    this.isPlaying = false;
    this.silent = true;
  }
  /** 计分 */
  private count() {
    this.score.update();
  }
  /** 播放音乐 */
  private playAudio(type: string) {
    this.audio = this.audioList[type];
    this.audioJson = this.audioListJson[type];
    this.audio.play();
    this.musicFrame.time = 0;
    this.audio.onEnded(() => {
      this.audio.play();
      this.musicFrame.time = 0;
    });
  }
  /** 切换音乐 */
  private toggleAudio(type: string) {
    this.audio.stop();
    this.playAudio(type);
  }
  /** 停止播放音乐 */
  private stopAudio(type: string) {
    this.audio = this.audioList[type];
    this.audio.stop();
  }
}
