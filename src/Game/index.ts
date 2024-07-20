import { EventEmitter } from 'fbemitter';
import * as THREE from 'three';
import { IAudioJsonList, IAudioList } from '../preload';
import camera from './camera';
import axes from './helper/axes';
import renderer from './renderer';
import { scene, topScene } from './scene';
import * as util from './util';
// import orbitControls from './helper/orbitControls';
import Gamepad from './Gamepad';
import Menu, { IMenu } from './Menu';
import MusicFrame, { IMusicFrame } from './MusicFrame';
import { INPC } from './NPC';
import { BoxNPC } from './NPC/box';
import { ConeNPC } from './NPC/cone';
import type { IPlayer } from './Player';
import Player from './Player';
import Pool, { IPool } from './Pool';
import Racetrack, { IRacetrack } from './Racetrack';
import Rank, { IRank } from './Rank';
import Score, { IScore } from './Score';
import Settlement, { ISettlement } from './Settlement';
import { INITIALIZED_SPEED } from './constant';
import type { IGame } from './types';

/** 游戏类 */
export default class Game implements IGame {
  /** 音频文件 */
  private audioList: IAudioList;
  /** 音频解析 */
  private audioListJson: IAudioJsonList;
  /** 音频文件 */
  audio: InnerAudioContext;
  /** 音频解析 */
  audioJson: JSON;
  /** 字体文件 */
  font;
  /** 用户openId */
  openId: string;
  /** 舞台 */
  private scene: THREE.Scene;
  /** 舞台（放置顶层元素） */
  private topScene: THREE.Scene;
  /** 摄影机 */
  camera: THREE.Camera;
  /** WebGL渲染器 */
  private renderer: THREE.WebGLRenderer;
  /** 事件总线 */
  emitter: EventEmitter;
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
  /** 排行榜 */
  private rank: IRank;
  /** 结算页 */
  private settlement: ISettlement;
  /** 游戏主角 */
  player: IPlayer;
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
  frame = 0;
  /** 游戏速度 */
  private interiorSpeed = INITIALIZED_SPEED;
  get speed() {
    return this.interiorSpeed;
  }
  /** 拦截速度设置，最大值为0.7 */
  set speed(value: number) {
    const maxValue = 0.7;
    this.interiorSpeed = value > maxValue ? maxValue : value;
  }
  /** 游戏帧率 */
  fps = 60;
  /** 是否是游戏中 */
  isPlaying = false;
  /** 静止（屏蔽一些动画） */
  silent = false;
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
    if (wx.getSystemInfoSync().platform === 'devtools') {
      this.scene.add(axes);
    }
    // 轨道控制器
    // this.orbitControls = orbitControls(this.camera);
    // 初始化分享
    this.initShare();
    // 游戏控制器
    this.gamePad = new Gamepad({
      game: this,
    });
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
    // 播放音乐
    this.playAudio();
    // 显示菜单
    this.showMenu();
  }
  /** 显示分数 */
  private async showScore() {
    this.score.mesh = await this.score.render();
    this.topScene.add(this.score.mesh);
  }
  /** ticker */
  private ticker() {
    this.frame += 1;
    this.update();
    if (!this.silent) {
      this.musicFrame.update();
      this.player.update();
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
  /** 移除NPC */
  private removeNPC() {
    this.npcs.forEach((npc) => {
      npc.destroy();
    });
    this.npcs = [];
  }
  /** 开始游戏 */
  start() {
    this.isPlaying = true;
    // 添加NPC
    this.addNPC();
    // 显示分数
    this.showScore();
    this.toggleAudio('bgm');
  }
  /** 游戏结束 */
  end() {
    console.log('game end');
    // 长振动
    wx.vibrateLong();
    this.showSettlement();
    this.stopAudio('bgm');
    this.score.destroy();
    this.speed = INITIALIZED_SPEED;
    this.isPlaying = false;
    this.silent = true;
  }
  /** 重置游戏 */
  reset() {
    this.player.reset();
    this.silent = false;
    this.score.value = 0;
    this.playAudio('begin');
    this.removeNPC();
  }
  /** 显示菜单 */
  showMenu() {
    // 游戏菜单
    this.menu = new Menu({
      game: this,
    });
    this.topScene.add(this.menu.mesh);
  }
  /** 显示排行榜 */
  showRank() {
    this.rank = new Rank({
      game: this,
    });
    this.topScene.add(this.rank.mesh);
  }
  /** 显示结算页面 */
  private showSettlement() {
    this.settlement = new Settlement({
      game: this,
      score: this.score.value,
    });
    this.topScene.add(this.settlement.mesh);
  }
  /** 关闭排行榜 */
  closeRank() {
    this.topScene.remove(this.rank.mesh);
    this.rank = null;
  }
  /** 计分 */
  private count() {
    this.score.update();
  }
  /** 播放音乐 */
  private playAudio(type = 'begin') {
    this.audio = this.audioList[type];
    this.audioJson = this.audioListJson[type];
    this.audio.seek(0);
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
  /** 初始化分享 */
  private initShare() {
    wx.showShareMenu();
    wx.onShareAppMessage(() => {
      return {
        title: '还等什么？快来跟我一起玩有音乐节奏的跑酷游戏！',
        imageUrl: 'assets/img/share.png',
      };
    });
  }
  /** 分享 */
  share() {
    wx.shareAppMessage({
      title: `敢不敢来挑战我？这么有节奏的音乐让我跑了${this.score.value}m`,
      imageUrl: 'assets/img/share.png',
    });
  }
}
