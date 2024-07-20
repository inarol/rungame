import * as THREE from 'three';
import { CommandType } from '../../openDataContext/commandType';
import { CAMERA, EVENTS, RATIO, SCREEN_WIDTH } from '../constant';
import { IGame } from '../types';
import * as util from '../util';

export interface IRank {
  /** 3D模型 */
  mesh: THREE.Mesh;
}

export default class Rank implements IRank {
  /** 帧 */
  private frame = 0;
  /** rafId */
  private aniId = null;
  /** 游戏类 */
  private game: IGame;
  /** 字体 */
  private font;
  /** 宽度 */
  private width = 36;
  /** 高度 */
  private height = 66;
  /** 3D模型 */
  mesh: THREE.Mesh;
  constructor(params: { game: IGame }) {
    const { game } = params;
    this.game = game;
    this.font = game.font;
    this.mesh = this.render();
    this.addTapEvent();
    this.update();
  }
  /** 定时器，更新texture */
  private update() {
    this.frame += 1;
    if (this.frame % 30 === 0) {
      const texture = this.getTexture();
      const material = this.mesh.material as THREE.MeshStandardMaterial;
      material.map = texture;
    }
    this.aniId = window.requestAnimationFrame(this.update.bind(this));
  }
  /** 渲染 */
  private render() {
    const { width } = this;
    const { height } = this;
    const position = {
      x: 0,
      y: CAMERA.y + 4,
    };
    const texture = this.getTexture();
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      depthTest: false,
      transparent: true,
    });
    const geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, 0);
    return mesh;
  }
  /** 排行榜离屏画布 */
  private getTexture() {
    const openDataContext = wx.getOpenDataContext();
    const canvas2d = openDataContext.canvas;
    const sizeRatio = this.width / this.height;
    const ratio = RATIO;
    const width = SCREEN_WIDTH;
    const height = width / sizeRatio;
    canvas2d.width = width * ratio;
    canvas2d.height = height * ratio;
    const message = {
      cmd: CommandType.RANK_RENDER,
      data: {
        ratio,
        width,
        height,
        radius: 6,
        count: 10,
        titleFontSize: 30,
        titleHeight: 100,
        itemHeight: 52,
        itemFontSize: 22,
        orderFontSize: 26,
        scoreFontSize: 26,
        font: this.font,
        backgroundColor: '#333333',
        borderColor: '#444444',
        titleColor: '#ffffff',
        opacity: 0.9,
      },
    };
    util.sendCommandToOpenDataContext(message);
    const texture = new THREE.CanvasTexture(canvas2d as any);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }
  /** 添加关闭排行榜关闭的事件 */
  private addTapEvent() {
    this.game.emitter.once(EVENTS.TAP, () => {
      this.game.showMenu();
      this.game.closeRank();
      cancelAnimationFrame(this.aniId);
      util.sendCommandToOpenDataContext({
        cmd: CommandType.RANK_DESTROY,
        data: null,
      });
    });
  }
}
