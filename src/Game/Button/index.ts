import * as THREE from 'three';
import { SCREEN_WIDTH, EVENTS, SCREEN_HEIGHT } from '../constant';
import { IGame } from '../../Game';

interface IButton {
  /** 3D模型 */
  mesh: THREE.Mesh;
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
  /** 3D模型 */
  public mesh: THREE.Mesh;
  constructor(
    params: {
      /** 游戏类 */
      game: IGame;
      /** 点击回调 */
      callback?: () => any;
    },
    options: {
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
    },
  ) {
    const {
      game,
      callback,
    } = params;
    const {
      position = { x: 0, y: 0 },
      width = 0,
      height = 0,
      radius = 0,
      text = '',
      fontSize = 12,
      fontFamily = 'arial',
      backgroundColor = '#ffffff',
      color = '#000000',
    } = options;
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
    const canvas = wx.createCanvas();
    const context = <CanvasRenderingContext2D>canvas.getContext('2d');
    const scale = SCREEN_WIDTH / this.width;
    const width = this.width * scale;
    const height = this.height * scale;
    const text = this.text;
    const fontSize = this.fontSize * scale;
    const fontFamily = this.fontFamily;
    const backgroundColor = this.backgroundColor;
    const color = this.color;
    canvas.width = width;
    canvas.height = height;
    context.save();
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    context.fillStyle = color;
    context.font = `${fontSize}px ${fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, width / 2, height / 2);
    context.restore();
    const texture = new THREE.CanvasTexture(<any>canvas);
    texture.minFilter = THREE.NearestFilter;
    return texture;
  }
  /** 自定义shape */
  private getShape() {
    const x = - this.width / 2;
    const y = - this.height / 2;
    const width = this.width;
    const height = this.height;
    const radius = this.radius;
    const roundedRectShape = new THREE.Shape();
    roundedRectShape.moveTo(x, y + radius);
    roundedRectShape.lineTo(x, y + height - radius);
    roundedRectShape.quadraticCurveTo(x, y + height, x + radius, y + height);
    roundedRectShape.lineTo(x + width - radius, y + height);
    roundedRectShape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    roundedRectShape.lineTo(x + width, y + radius);
    roundedRectShape.quadraticCurveTo(x + width, y, x + width - radius, y);
    roundedRectShape.lineTo(x + radius, y);
    roundedRectShape.quadraticCurveTo(x, y, x, y + radius);
    return roundedRectShape;
  }
  /** 给按钮添加Tap事件 */
  private addTapEvent() {
    if (this.callback) {
      this.game.emitter.addListener(EVENTS.TAP, ({ position }) => {
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
}
