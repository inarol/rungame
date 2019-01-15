import * as THREE from 'three';
import cax from '../../lib/cax';
import offScreenCanvas from '../offScreenCanvas';
import RoundedRect from '../Shape/RoundedRect';
import { SCREEN_WIDTH, EVENTS, SCREEN_HEIGHT, RATIO } from '../constant';
import { IGame } from '../../Game';
import { EventSubscription } from 'fbemitter';
import * as util from '../util';

export  interface IButton {
  /** 3D模型 */
  mesh: THREE.Mesh;
  /** tap事件 */
  tapEvent: EventSubscription;
  /** 销毁 */
  destroy: () => void;
}

interface IPosition {
  /** x坐标 */
  x: number;
  /** y坐标 */
  y: number;
}

export default class Button implements IButton {
  /** 游戏类 */
  private game: IGame;
  /** 点击回调 */
  private callback: () => any;
  /** 位置 */
  private position: IPosition;
  /** 宽度 */
  private width;
  /** 高度 */
  private height;
  /** 圆角 */
  private radius;
  /** 文本 */
  private text;
  /** 字体大小 */
  private fontSize;
  /** 字体 */
  private fontFamily;
  /** 背景色 */
  private backgroundColor;
  /** 文本颜色 */
  private color;
  /** tap事件 */
  public tapEvent: EventSubscription;
  /** 3D模型 */
  public mesh: THREE.Mesh;
  constructor(params: {
    /** 位置 */
    position: IPosition;
    /** 宽度 */
    width: number;
    /** 高度 */
    height: number;
    /** 圆角 */
    radius: number;
    /** 文本 */
    text: string;
    /** 字体大小 */
    fontSize?: number;
    /** 字体 */
    fontFamily: string;
    /** 文本颜色 */
    color?: string;
    /** 背景色 */
    backgroundColor?: string;
    /** 游戏类 */
    game: IGame;
    /** 点击回调 */
    callback?: () => any;
  }) {
    const {
      game,
      callback,
      position = { x: 0, y: 0 },
      width = 0,
      height = 0,
      radius = 0,
      text = '',
      fontSize = 12,
      fontFamily = 'arial',
      backgroundColor = '#ffffff',
      color = '#000000',
    } = params;
    this.game = game;
    this.callback = callback;
    this.position = position;
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.text = text;
    this.backgroundColor = backgroundColor;
    this.color = color;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.mesh = this.render();
    this.addTapEvent();
  }
  /** 渲染 */
  private render() {
    const position = this.position;
    const texture = this.getTexture();
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      depthTest: false,
    });
    const shape = this.getShape();
    const shapeGeometry: any = new THREE.ShapeGeometry(shape);
    // 为自定义图形添加uv坐标
    shapeGeometry.assignUVs();
    const mesh = new THREE.Mesh(shapeGeometry, material);
    mesh.position.set(position.x, position.y, 0);
    return mesh;
  }
  /** 按钮纹理贴图 */
  private getTexture(): THREE.Texture {
    const stage = offScreenCanvas.stage;
    const canvas = offScreenCanvas.canvas;
    const ratio = RATIO;
    const sizeRatio = this.width / this.height;
    const width = 100;
    const height = width / sizeRatio;
    const text = this.text;
    const fontSize = this.fontSize;
    const fontFamily = this.fontFamily;
    const backgroundColor = this.backgroundColor;
    const color = this.color;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const buttonText = new cax.Text(text, {
      color,
      font: `${fontSize}px ${fontFamily}`,
      textAlign: 'center',
      baseline: 'middle',
    });
    const rect = new cax.Rect(width, height, {
      fillStyle: backgroundColor,
    });
    buttonText.x = width / 2;
    buttonText.y = height / 2;
    stage.scale = ratio;
    stage.add(rect);
    stage.add(buttonText);
    stage.update();
    /**
     * 重要！这里的CanvasTexture不可直接接收canvas，
     * 因为微信小游戏只支持一个离屏canvas，如果不把canvas保存下来的话，
     * 会导致canvas为覆盖的问题。
     */
    const image = util.canvas2image(canvas);
    const texture = new THREE.CanvasTexture(image);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }
  /** 自定义shape */
  private getShape() {
    const x = - this.width / 2;
    const y = - this.height / 2;
    const width = this.width;
    const height = this.height;
    const radius = this.radius;
    const roundedRect = new RoundedRect({
      x,
      y,
      width,
      height,
      radius,
    }).render();
    return roundedRect;
  }
  /** 给按钮添加Tap事件 */
  private addTapEvent() {
    if (this.callback) {
      this.tapEvent = this.game.emitter.addListener(EVENTS.TAP, ({ position }) => {
        const raycaster = new THREE.Raycaster();
        const x = 1 - (position.x / (SCREEN_WIDTH / 2));
        const y = 1 - (position.y / (SCREEN_HEIGHT / 2));
        const mouse = new THREE.Vector2(x, y);
        raycaster.setFromCamera(mouse, this.game.camera);
        const intersect = raycaster.intersectObject(this.mesh);
        if (intersect.length) {
          this.callback();
        }
      });
    }
  }
  /** 销毁按钮 */
  public destroy() {
    this.removeTapEvent();
  }
  /** 注销按钮上的Tap事件 */
  private removeTapEvent() {
    this.tapEvent.remove();
  }
}
