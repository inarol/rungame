import * as THREE from 'three';
import Button from '../Button';
import { IGame } from '../../Game';

export interface IMenu {
  /** 3D模型 */
  mesh: THREE.Group;
}

export default class Menu implements IMenu {
  /** 游戏类 */
  private game: IGame;
  /** 字体文件 */
  private font;
  /** 3D模型 */
  public mesh: THREE.Group;
  constructor(params: {
    game: IGame;
  }) {
    const { game } = params;
    this.font = game.font;
    this.game = game;
    this.mesh = this.render();
  }
  private render() {
    const group = new THREE.Group();
    const startButton = this.renderStartButton();
    const rankButton = this.renderRankButton();
    group.add(startButton);
    group.add(rankButton);
    return group;
  }
  /** 开始游戏按钮 */
  private renderStartButton() {
    return new Button(
      {
        game: this.game,
        callback: () => {
          console.log('start btn clicked');
          this.game.start();
          this.hide();
        },
      },
      {
        position: { x: 0, y: 45 },
        width: 16,
        height: 5,
        radius: 1,
        text: '\uE6DE\u00A0开始游戏',
        fontFamily: this.font,
        fontSize: 2.2,
        color: '#ffffff',
        backgroundColor: '#e67e22',
      },
    ).mesh;
  }
  /** 排行榜按钮 */
  private renderRankButton() {
    return new Button(
      {
        game: this.game,
        callback: () => {
          console.log('rank clicked');
        },
      },
      {
        position: { x: 0, y: 37 },
        width: 16,
        height: 5,
        radius: 1,
        text: '\uE6F1\u00A0排行榜',
        fontFamily: this.font,
        fontSize: 2.2,
        color: '#333333',
        backgroundColor: '#dedede',
      },
    ).mesh;
  }
  /** 隐藏按钮 */
  private hide() {
    this.mesh.visible = false;
  }
}
