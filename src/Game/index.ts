import scene from './scene';
import camera from './camera';
import renderer from './renderer';
import axes from './helper/axes';
import Player, { IPlayer } from './Player';

/** 游戏类 */
export default class Game {
  /** 舞台 */
  private scene: THREE.Scene;
  /** 摄影机 */
  private camera: THREE.Camera;
  /** WebGL渲染器 */
  private renderer: THREE.WebGLRenderer;
  /** 游戏主角 */
  private player: IPlayer;
  /** 辅助坐标 */
  private axes: THREE.AxesHelper;
  constructor() {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.axes = axes;
    this.player = new Player();
    this.scene.add(this.player.mesh);
    this.scene.add(this.axes);
    this.update();
  }
  /** 渲染 */
  update() {
    this.renderer.render(this.scene, this.camera);
  }
}
