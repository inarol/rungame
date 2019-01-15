import * as THREE from 'three';
import Button, { IButton } from '../Button';
import { IGame } from '../../Game';

export interface IMenu {
  /** 3D模型 */
  mesh: THREE.Group;
  /** 渲染 */
  render: () => THREE.Group;
}

export default class Menu implements IMenu {
  /** 游戏类 */
  private game: IGame;
  /** 字体文件 */
  private font;
  /** 3D模型 */
  public mesh: THREE.Group;
  /** 开始游戏按钮 */
  private startButton: IButton;
  /** 排行榜按钮 */
  private rankButton: IButton;
  constructor(params: {
    game: IGame;
  }) {
    const { game } = params;
    this.font = game.font;
    this.game = game;
    this.mesh = this.render();
  }
  public render() {
    const group = new THREE.Group();
    this.startButton = this.renderStartButton();
    this.rankButton = this.renderRankButton();
    group.add(this.startButton.mesh);
    group.add(this.rankButton.mesh);
    return group;
  }
  /** 开始游戏按钮 */
  private renderStartButton() {
    return new Button({
      position: { x: 0, y: 45 },
      width: 16,
      height: 5,
      radius: 1,
      text: '\uE6DE\u00A0开始游戏',
      fontFamily: this.font,
      fontSize: 14,
      color: '#ffffff',
      backgroundColor: '#e67e22',
      game: this.game,
      callback: () => {
        this.game.start();
        this.destroy();
      },
    });
  }
  /** 排行榜按钮 */
  private renderRankButton() {
    return new Button({
      position: { x: 0, y: 37 },
      width: 16,
      height: 5,
      radius: 1,
      text: '\uE6F1\u00A0排行榜',
      fontFamily: this.font,
      fontSize: 14,
      color: '#333333',
      backgroundColor: '#dedede',
      game: this.game,
      callback: () => {
        console.log('进入排行榜');
        this.destroy();
      },
    });
  }
  /** 销毁按钮 */
  public destroy() {
    this.startButton.destroy();
    this.rankButton.destroy();
    this.removeMesh();
  }
  /** 移除网格 */
  private removeMesh() {
    const scene = this.mesh.parent;
    scene.remove(this.mesh);
  }
}
