import cax from '../../lib/cax';

interface IOffScreenCanvas {
  /** cax舞台 */
  stage: any;
  /** canvas */
  canvas: any;
}

interface OffScreenCanvasParams {

}

class OffScreenCanvas implements IOffScreenCanvas {
  public stage: any;
  public canvas: any;
  constructor(params?: OffScreenCanvasParams) {
    this.stage = new cax.Stage();
    this.canvas = this.stage.canvas;
  }
}

export default new OffScreenCanvas();
