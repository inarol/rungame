/** 设备像素比  */
export const RATIO = devicePixelRatio;
/** 屏幕宽度 */
export const SCREEN_WIDTH = window.innerWidth;
/** 屏幕高度 */
export const SCREEN_HEIGHT = window.innerHeight;
/** 摄影机参数 */
export const CAMERA = {
  /** 视野范围（角度） */
  fov: 75,
  /** 距离相机最近的位置，最小值为0.1 */
  near: 0.1,
  /** 距离相机最远的位置 */
  far: 800,
  /** 相机位置, x轴  */
  x: 0,
  /** 相机位置, y轴  */
  y: 30,
  /** 相机位置, z轴  */
  z: 60,
  /** 镜头朝向 */
  lookAt: {
    x: 0,
    y: 30,
    z: 0,
  },
};
/** 主角参数 */
export const PLAYER = {
  /** 宽度 */
  width: 8,
  /** 高度 */
  height: 8,
  /** 深度 */
  depth: 8,
};
