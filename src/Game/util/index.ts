import { SCREEN_HEIGHT, CAMERA, RATIO, SCREEN_WIDTH } from '../constant';

/** 产生随机数 */
export const rnd = (start: number, end: number, isInt: boolean) => {
  if (isInt) {
    return Math.floor(Math.random() * (end + 1 - start) + start);
  }
  return Math.random() * (end + 1 - start) + start;
};

/** 获取可视化区域大小 */
export const getVisibleSize = () => {
  const vFOV = CAMERA.fov * Math.PI / 180;
  const vH = Math.tan(vFOV / 2) * CAMERA.z * 2;
  return {
    width: vH * SCREEN_WIDTH / SCREEN_HEIGHT,
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
export const sendCommandToOpenDataContext = (message: { cmd: string; data: Object; }) => {
  const openDataContext = wx.getOpenDataContext();
  openDataContext.postMessage(message);
};
