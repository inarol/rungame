import * as THREE from 'three';
import { NPC as NPC_CONFIG } from '../constant';
import NPC, { ISize } from '../NPC';

export class ConeNPC extends NPC {
  /** 尺寸 */
  protected get size(): ISize {
    return {
      width: NPC_CONFIG.width / 3,
      height: NPC_CONFIG.height * 2,
      depth: NPC_CONFIG.width,
    };
  }
  constructor() {
    super();
  }
  /** 创建几何图形 */
  protected createGeometry() {
    const size = this.size;
    return new THREE.ConeGeometry(
      size.width,
      size.height,
      size.height / 2,
    );
  }
}
