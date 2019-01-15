import * as THREE from 'three';
import { CAMERA, SCORE } from '../constant';
import { IGame } from '../../Game';

export interface IScore {
  /** 3D模型 */
  mesh: THREE.Group;
  /** 渲染 */
  render: () => Promise<THREE.Group>;
  /** 分数值 */
  value: number;
  /** 更新 */
  update: () => void;
}

export default class Score implements IScore {
  /** 游戏类 */
  private game: IGame;
  /** 3D模型 */
  public mesh: THREE.Group;
  /** 分数值 */
  public value = 0;
  /** 分数递增值 */
  private increase = 10;
  constructor(params: {
    game: IGame;
  }) {
    const { game } = params;
    this.game = game;
  }
  /** 更新 */
  public update() {
    this.value += this.increase;
    // 分数每+2000，速度提升0.02
    if (this.value % 2000 === 0) {
      this.game.speed += 0.02;
    }
    this.updateTexture();
  }
  /** 渲染 */
  public async render(): Promise<THREE.Group> {
    return new Promise(async (resolve) => {
      const group = new THREE.Group();
      const { img, width, height } = await this.getNumberImage();
      const texture = this.getTexture(img);
      const numberWidth = SCORE.width;
      const numberHeight =  numberWidth * ((height / 10) / width);
      const scoreNumberArray = '0000000000'.split('');
      const totalWidthHalf = numberWidth * scoreNumberArray.length / 2;
      const geometry = new THREE.PlaneGeometry(numberWidth, numberHeight);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      scoreNumberArray.forEach((item, i) => {
        const newMaterial = material.clone();
        const newMesh = mesh.clone();
        newMaterial.map = texture.clone();
        newMaterial.map.needsUpdate = true;
        newMesh.material = newMaterial;
        newMesh.position.set(
          numberWidth * i - totalWidthHalf + numberWidth / 2,
          SCORE.y,
          0,
        );
        group.add(newMesh);
      });
      resolve(group);
    });
  }
  /** 获取数字图片 */
  private getNumberImage(): Promise<{
    /** 图片 */
    img: any,
    /** 宽度 */
    width: number;
    /** 高度 */
    height: number;
  }> {
    return new Promise((resolve) => {
      const image = wx.createImage();
      image.onload = () => {
        resolve({
          img: image,
          width: image.width,
          height: image.height,
        });
      };
      image.src = 'assets/img/number-texture.png';
    });
  }
  /** 获取纹理图片 */
  private getTexture(img): THREE.Texture {
    const texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    texture.repeat.set(1, 0.1);
    texture.offset.y = 0.9;
    texture.minFilter = THREE.NearestFilter;
    return texture;
  }
  /** 更新纹理图片 */
  private updateTexture() {
    if (this.mesh) {
      const score = this.value.toString();
      const scoreNumberArray = score.split('');
      const meshList = this.mesh.children;
      const numberWidth = SCORE.width;
      const meshWidthHalf = meshList.length * numberWidth / 2;
      const scoreWidthHalf = scoreNumberArray.length * numberWidth / 2;
      for (let i = scoreNumberArray.length - 1; i >= 0; i -= 1) {
        const number = Number(scoreNumberArray[i]);
        const mesh = meshList[i];
        const map: THREE.Texture = mesh['material'].map;
        mesh.visible = true;
        // 个位数不更新
        if (i === scoreNumberArray.length - 1) {
          continue;
        }
        map.offset.y = 1 - (number + 1) * 0.1;
      }
      // 居中meshGroup
      this.mesh.position.x = meshWidthHalf - scoreWidthHalf;
    }
  }
}
