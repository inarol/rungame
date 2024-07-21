import { CAMERA, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constant';
import * as THREE from 'three';

/** 产生随机数 */
export const rnd = (start: number, end: number, isInt: boolean) => {
  if (isInt) {
    return Math.floor(Math.random() * (end + 1 - start) + start);
  }
  return Math.random() * (end + 1 - start) + start;
};

// 匹配中文字符和ASCII字符
export function normalizeFontText(text: string): string {
  return text.replace(/[^\u4e00-\u9fa5\x00-\x7F]/g, '');
}

// 是否是开发者工具
export function isDevTools() {
  return wx.getSystemInfoSync().platform === 'devtools';
}

/** 获取可视化区域大小 */
export const getVisibleSize = () => {
  const vFOV = (CAMERA.fov * Math.PI) / 180;
  const vH = Math.tan(vFOV / 2) * CAMERA.z * 2;
  return {
    width: (vH * SCREEN_WIDTH) / SCREEN_HEIGHT,
    height: vH,
  };
};

/** canvas转换为图片 */
export const canvas2image = (canvas) => {
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
};

/** 发送指令给开放数据域 */
export const sendCommandToOpenDataContext = (message: { cmd: string; data: Object }) => {
  const openDataContext = wx.getOpenDataContext();
  openDataContext.postMessage(message);
};

export function get2DPositionAndSize(mesh, camera) {
  // 获取 mesh 的位置
  const position = mesh.position.clone();
  const vector = position.project(camera);

  // 将3D坐标转换为2D坐标
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

  // 获取 mesh 的包围盒
  const boundingBox = new THREE.Box3().setFromObject(mesh);

  // 获取包围盒的最小和最大顶点
  const min = boundingBox.min.clone();
  const max = boundingBox.max.clone();

  // 投影包围盒的顶点到2D屏幕坐标
  const minVector = min.project(camera);
  const maxVector = max.project(camera);

  const minX = (minVector.x * 0.5 + 0.5) * window.innerWidth;
  const minY = (minVector.y * -0.5 + 0.5) * window.innerHeight;

  const maxX = (maxVector.x * 0.5 + 0.5) * window.innerWidth;
  const maxY = (maxVector.y * -0.5 + 0.5) * window.innerHeight;
  // 计算2D尺寸
  const width = Math.abs(maxX - minX);
  const height = Math.abs(maxY - minY);

  return {
    position: { x, y },
    size: { width, height },
  };
}
