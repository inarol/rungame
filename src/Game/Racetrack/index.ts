import * as THREE from 'three';
import { RACETRACK, CAMERA, PLAYER } from '../constant';
import { IGame } from '../../Game';

export interface IRacetrack {
  /** 3D模型 */
  mesh: THREE.Mesh;
  /** 更新 */
  update: (params: {
    /** 游戏类 */
    game: IGame;
  }) => void;
}

/** 游戏跑道 */
export default class Racetrack implements IRacetrack {
  public mesh: THREE.Mesh;
  public update(params: {
    /** 游戏类 */
    game: IGame;
  }) {
    const game = params.game;
    const map = this.mesh.material['map'];
    const repeat = 10;
    // typical range is 0.0 to 1.0
    map.offset.y += game.speed * 1 / game.fps * repeat;
    map.repeat.y = repeat;
  }
  private render() {
    const texture = this.getTexture();
    const racetrackGeometry = new THREE.PlaneGeometry(RACETRACK.width, RACETRACK.height);
    const racetrackMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    /**
     * NearestFilter是openGL的概念，表示临近过滤，默认值是LinearFilter，会糊掉纹理图片
     * @see https://learnopengl-cn.github.io/01%20Getting%20started/06%20Textures/
     */
    racetrackMaterial.map.magFilter = THREE.NearestFilter;
    // 表示y轴的纹理回环方式
    racetrackMaterial.map.wrapT = THREE.RepeatWrapping;
    const plane = new THREE.Mesh(racetrackGeometry, racetrackMaterial);
    plane.rotation.set(THREE.Math.degToRad(-90), 0, 0);
    plane.position.set(0, RACETRACK.y, - RACETRACK.height / 2 + CAMERA.z);
    return plane;
  }
  constructor() {
    this.mesh = this.render();
  }
  private getTexture(): THREE.Texture {
    const image: any = wx.createImage();
    const texture = new THREE.Texture(image);
    image.onload = () => {
      texture.needsUpdate = true;
    };
    image.src = 'assets/img/racetrack-texture.png';
    return texture;
  }
}
