import * as THREE from 'three';
import { CommandType } from '../../openDataContext/commandType';
import Button, { IButton } from '../Button';
import { CAMERA, RATIO, SCREEN_WIDTH } from '../constant';
import { IGame } from '../types';
import * as util from '../util';

export interface ISettlement {
  /** 3D模型 */
  mesh: THREE.Group;
}

export default class Settlement implements ISettlement {
  /** 帧 */
  private frame = 0;
  /** rafId */
  private aniId = null;
  /** 3D模型 */
  mesh: THREE.Group;
  /** 游戏类 */
  private game: IGame;
  /** 字体 */
  private font;
  /** 分数 */
  private score: number;
  /** 宽度 */
  private width = 36;
  /** 高度 */
  private mainHeight = 38;
  /** 按钮部分高度 */
  private rankButtonHeight = 5;
  /** 结算区域网格 */
  private mainMesh: THREE.Mesh;
  /** 排行榜按钮 */
  private rankButton: IButton;
  /** 分享按钮 */
  private shareButton: IButton;
  /** 回到主菜单按钮 */
  private homeButton: IButton;
  constructor(params: {
    /** 游戏类 */
    game: IGame;
    /** 分数 */
    score: number;
  }) {
    const { game, score } = params;
    this.game = game;
    this.score = score;
    this.font = game.font;
    this.mesh = this.render();
    this.update();
  }
  /** 定时器，更新texture */
  private update() {
    this.frame += 1;
    if (this.frame % 30 === 0) {
      const texture = this.getMainTexture();
      const material = this.mainMesh.material as THREE.MeshStandardMaterial;
      material.map = texture;
    }
    this.aniId = window.requestAnimationFrame(this.update.bind(this));
  }
  /** 渲染 */
  private render() {
    const group = new THREE.Group();
    const maskMesh = this.renderMask();
    this.mainMesh = this.renderMain();
    this.rankButton = this.renderRankButton();
    this.shareButton = this.renderShareButton();
    this.homeButton = this.renderHomeButton();
    group.add(maskMesh);
    group.add(this.mainMesh);
    group.add(this.rankButton.mesh);
    group.add(this.shareButton.mesh);
    group.add(this.homeButton.mesh);
    return group;
  }
  /** 遮罩层 */
  private renderMask() {
    const visibleSize = util.getVisibleSize();
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.65,
      transparent: true,
      depthTest: false,
    });
    const geometry = new THREE.PlaneGeometry(visibleSize.width, visibleSize.height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = CAMERA.y;
    return mesh;
  }
  /** 渲染结算部分 */
  private renderMain() {
    const { width } = this;
    const height = this.mainHeight;
    const texture = this.getMainTexture();
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      depthTest: false,
      transparent: true,
    });
    const geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 42;
    return mesh;
  }
  /** 获取结算的离屏canvas */
  private getMainTexture() {
    const openDataContext = wx.getOpenDataContext();
    const canvas2d = openDataContext.canvas;
    const sizeRatio = this.width / this.mainHeight;
    const { score } = this;
    const ratio = RATIO;
    const width = SCREEN_WIDTH;
    const height = width / sizeRatio;
    canvas2d.width = width * ratio;
    canvas2d.height = height * ratio;
    const message = {
      cmd: CommandType.SETTLEMENT_RENDER,
      data: {
        ratio,
        width,
        height,
        font: this.font,
        openId: this.game.openId,
        title: {
          fontSize: 24,
          y: 10,
        },
        score: {
          value: score,
          fontSize: 60,
          y: 50,
        },
        rect: {
          height: 250,
          y: 150,
        },
        itemRect: {
          height: 250,
          width: width / 3,
          backgroundColor: '#333333',
          activeBackgroundColor: '#444444',
          y: 150,
          order: {
            fontSize: 30,
            y: 20,
            color: '#ffffff',
          },
          avatar: {
            x: 28,
            y: 70,
          },
          nickname: {
            y: 140,
            fontSize: 18,
            color: '#ffffff',
          },
          score: {
            y: 190,
            fontSize: 30,
            color: '#ffffff',
          },
        },
        tip: {
          fontSize: 24,
          y: 170,
        },
        backgroundColor: '#333333',
        borderColor: '#555555',
        opacity: 0.85,
      },
    };
    util.sendCommandToOpenDataContext(message);
    const texture = new THREE.CanvasTexture(canvas2d as any);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }
  /** 渲染按钮 */
  private renderRankButton() {
    const sizeRatio = this.width / this.rankButtonHeight;
    const { width } = this;
    const height = width / sizeRatio;
    return new Button({
      width,
      height,
      position: {
        x: 0,
        y: 20.5,
      },
      radius: 0,
      text: '\uE6F1\u00A0 查看排行榜',
      fontFamily: this.font,
      fontSize: 20,
      color: '#ffffff',
      backgroundColor: '#333333',
      borderColor: '#555555',
      opacity: 0.85,
      game: this.game,
      callback: () => {
        this.destroy();
        this.game.reset();
        this.game.showRank();
      },
    });
  }
  /** 分享按钮 */
  private renderShareButton() {
    return new Button({
      width: 16,
      height: 5,
      position: {
        x: 0,
        y: 10,
      },
      radius: 1,
      text: '\uE62A 召唤挑战者',
      fontFamily: this.font,
      fontSize: 46,
      color: '#ffffff',
      backgroundColor: '#e67e22',
      game: this.game,
      callback: () => {
        this.game.share();
      },
    });
  }
  /** 回到主菜单按钮 */
  private renderHomeButton() {
    return new Button({
      width: 16,
      height: 5,
      position: {
        x: 0,
        y: 3,
      },
      radius: 1,
      text: '\uE608 返回主菜单',
      fontFamily: this.font,
      fontSize: 46,
      borderColor: '#dedede',
      backgroundColor: '#dedede',
      game: this.game,
      callback: () => {
        this.destroy();
        this.game.reset();
        this.game.showMenu();
      },
    });
  }
  /** 销毁 */
  private destroy() {
    this.rankButton.destroy();
    this.shareButton.destroy();
    this.homeButton.destroy();
    this.removeOpenDataContext();
    this.removeMesh();
  }
  /** 销毁开放数据域 */
  private removeOpenDataContext() {
    cancelAnimationFrame(this.aniId);
    util.sendCommandToOpenDataContext({
      cmd: CommandType.SETTLEMENT_DESTROY,
      data: null,
    });
  }
  /** 移除网格 */
  private removeMesh() {
    const scene = this.mesh.parent;
    scene.remove(this.mesh);
  }
}
