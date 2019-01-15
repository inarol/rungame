import * as THREE from 'three';
import { IGame } from '../../Game';
import { MUSIC_FRAME, RACETRACK, PLAYER, CAMERA } from '../constant';

export interface IMusicFrame {
  /** 3D模型 */
  mesh: THREE.Group;
  /** 更新 */
  update: () => void;
  /** 音乐时间 */
  time: number;
}

export default class MusicFrame implements IMusicFrame {
  /** 游戏类 */
  private game: IGame;
  /** 3D模型 */
  public mesh: THREE.Group;
  /** 音频解析文件 */
  private audioJson: JSON;
  /** 当前播放时间 */
  public time: number = 0;
  /** 更新 */
  public update() {
    // 每0.05秒更新音频的波形图
    if (this.game.frame % 3 === 0) {
      this.time += 0.05;
      this.updateFrame();
    }
    this.moveFrame();
  }
  constructor(params: {
    /** 游戏类 */
    game: IGame,
  }) {
    const { game } = params;
    this.game = game;
    this.audioJson = game.audioJson;
    this.time = game.audio.currentTime;
    this.mesh = this.render();
  }
  private render(): THREE.Group {
    const group = new THREE.Group();
    const width = MUSIC_FRAME.width;
    const height = MUSIC_FRAME.height;
    const padding = MUSIC_FRAME.padding;
    const max = MUSIC_FRAME.max;
    // 音频波形数据
    const frequencyArray:[] = this.audioJson[this.time.toFixed(2)].split(',');
    const meshGroup = new THREE.Group();
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      color: 0x2fcc71,
      transparent: true,
      opacity: 0.5,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = - RACETRACK.width / 2;
    mesh.rotation.set(0, THREE.Math.degToRad(90), 0);
    // mesh镜像
    const meshImage = mesh.clone();
    meshImage.position.x = RACETRACK.width / 2;
    meshImage.rotation.set(0, THREE.Math.degToRad(-90), 0);
    meshGroup.add(mesh);
    meshGroup.add(meshImage);
    for (let i = 0; i < frequencyArray.length; i += 1) {
      const meshGroupClone = meshGroup.clone();
      meshGroupClone.position.z = -(width + padding) * i;
      group.add(meshGroupClone);
    }
    return group;
  }
  /** 更新音频的波形图峰值 */
  private updateFrame() {
    // 音频波形数据
    const frequency = this.audioJson[this.time.toFixed(2)];
    if (frequency) {
      const frequencyArray:[] = frequency.split(',');
      const frameLength = frequencyArray.length;
      const height = MUSIC_FRAME.height;
      const max = MUSIC_FRAME.max;
      for (let i = 0; i < frameLength; i += 1) {
        const meshGroup = this.mesh.children[i];
        const frequencyValue = Number(frequencyArray[i]) || 1;
        const scaleValue = frequencyValue / max;
        meshGroup.scale.set(1, scaleValue, 1);
        meshGroup.position.y = RACETRACK.y + (scaleValue * height / 2);
      }
    }
  }
  /** 移动音频波形 */
  private moveFrame() {
    const width = MUSIC_FRAME.width;
    const padding = MUSIC_FRAME.padding;
    const eachFrameWidth = width + padding;
    this.mesh.position.z += this.game.speed * Math.abs(CAMERA.far) / this.game.fps;
    // 位移一个波形的距离后，重置位置，然后一直循环，作为音频波形前进的动画。
    if (this.mesh.position.z >= eachFrameWidth) {
      this.mesh.position.z = 0;
    }
  }
}
