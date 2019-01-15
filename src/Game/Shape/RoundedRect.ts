import * as THREE from 'three';

interface IRoundedRect {
  /** 渲染 */
  render: () => THREE.Shape;
}

interface IRoundedRectOptions {
  /** x坐标 */
  x: number;
  /** y坐标 */
  y: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 圆角半径 */
  radius: number;
}

export default class RoundedRect implements IRoundedRect {
  private options: IRoundedRectOptions;
  constructor(options: IRoundedRectOptions) {
    this.options = options;
  }
  public render () {
    const { x, y, width, height, radius } = this.options;
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
}
