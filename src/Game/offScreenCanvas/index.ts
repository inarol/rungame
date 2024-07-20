import cax from '../../lib/cax';

interface IOffScreenCanvas {
  /** cax舞台 */
  stage: any;
  /** canvas */
  canvas: any;
}

class OffScreenCanvas implements IOffScreenCanvas {
  stage: any;
  canvas: any;
  constructor() {
    this.stage = new cax.Stage();
    this.canvas = this.stage.canvas;
  }
}

export default new OffScreenCanvas();
