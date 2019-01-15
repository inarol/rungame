import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { IDirection } from '../Gamepad';
import { PLAYER, EVENTS, RACETRACK } from '../constant';
import { EventEmitter } from 'fbemitter';
import { IGame } from '..';

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
  /** 更新 */
  update: () => void;
}

/** 游戏主角 */
export default class Player implements IPlayer {
  /** 游戏类 */
  private game: IGame;
  /** 弹跳补间动画 */
  private bounceTween: TWEEN.Group = new TWEEN.Group();
  /** 跳跃补间动画 */
  private jumpTween: TWEEN.Group = new TWEEN.Group();
  /** 位移补间动画 */
  private moveTween: TWEEN.Group = new TWEEN.Group();
  /** 尺寸 */
  public size: ISize = {
    width: PLAYER.width,
    height: PLAYER.height,
    depth: PLAYER.depth,
  };
  /** 3D模型 */
  public mesh: THREE.Group;
  /** 跑道序号 */
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
  public update() {
    if (!this.game.silent) {
      this.bounceTween.update();
    }
    if (this.game.isPlaying) {
      this.jumpTween.update();
      this.moveTween.update();
    }
  }
  /** 弹跳 */
  private bounce() {
    const meshPosition = this.mesh.position;
    const bounceTween = this.bounceTween;
    const durations = 500;
    const jumpHeight = this.size.height;
    // 跳跃
    const bounceTweenStep1 = new TWEEN.Tween(meshPosition, bounceTween)
      .to({ y: jumpHeight }, durations / 2)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    const bounceTweenStep2 = new TWEEN.Tween(meshPosition, bounceTween)
      .to({ y: 0 }, durations / 2)
      .easing(TWEEN.Easing.Quadratic.In);
    bounceTweenStep1.chain(bounceTweenStep2);
    bounceTweenStep2.chain(bounceTweenStep1);
    bounceTweenStep1.start();
  }
  /** 跳跃 */
  private jump(params: {
    callback: () => any,
  }) {
    const meshPosition = this.mesh.position;
    const meshRotation = this.mesh.rotation;
    const bounceTween = this.bounceTween;
    const jumpTween = this.jumpTween;
    const jumpHeight = this.size.height * 3;
    const durations = 700;
    if (bounceTween.getAll().length) {
      bounceTween.removeAll();
    }
    if (jumpTween.getAll().length) {
      return;
    }
    // 翻转动画
    new TWEEN.Tween(meshRotation, jumpTween)
      .to({ x: meshRotation.x - Math.PI }, durations)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    // 跳跃
    new TWEEN.Tween(meshPosition, jumpTween)
      .to({ y: jumpHeight }, durations / 2)
      .chain(
        new TWEEN.Tween(meshPosition, jumpTween)
          .to({ y: 0 }, durations / 2)
          .easing(TWEEN.Easing.Quadratic.In)
          .onComplete(params.callback),
      )
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }
  /** 移动动画 */
  private move(params: {
    direction: IDirection;
    callback: () => any;
  }) {
    const { direction } = params;
    const meshPosition = this.mesh.position;
    const moveTween = this.moveTween;
    const durations = 200;
    let moveDistance = 0;
    if (direction === 'LEFT' && this.racetrackIndex > -2) {
      moveDistance = - RACETRACK.segmentWidth;
      this.racetrackIndex -= 1;
    } else if (direction === 'RIGHT' && this.racetrackIndex < 2) {
      moveDistance = RACETRACK.segmentWidth;
      this.racetrackIndex += 1;
    }
    new TWEEN.Tween(meshPosition, moveTween)
      .to({ x: meshPosition.x + moveDistance }, durations)
      .easing(TWEEN.Easing.Back.Out)
      .onComplete(params.callback)
      .start();
  }
  constructor(params: {
    game: IGame;
  }) {
    const { game } = params;
    this.mesh = this.render();
    this.bounce();
    this.game = game;
    this.game.emitter.addListener(EVENTS.SLIDE, ({ direction }) => {
      if (this.game.isPlaying) {
        this.move({
          direction,
          callback: () => {
            this.moveTween.removeAll();
            this.mesh.position.x = this.racetrackIndex2Position(this.racetrackIndex);
          },
        });
      }
    });
    this.game.emitter.addListener(EVENTS.TAP, () => {
      if (this.game.isPlaying) {
        this.jump({
          callback: () => {
            this.jumpTween.removeAll();
            this.bounce();
          },
        });
      }
    });
  }
  /** 根据位置确定跑道序号 */
  private racetrackIndex2Position(index: number) {
    return RACETRACK.width / RACETRACK.segments * index;
  }
}
