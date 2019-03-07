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
/** 3D边界值（坐标值） */
export const BOUNDARY = {
  /** z轴起始点 */
  zStart: CAMERA.z,
  /** z轴结束点，摄影机可视最远处（需要补偿摄影机的位移`CAMERA.z`） */
  zEnd: - CAMERA.far + CAMERA.z,
};
/** 背景色 */
export const BACKGROUND_COLOR = 0x33334c;
/** 速度初始值 */
export const INITIALIZED_SPEED = 0.3;
/** 主角参数 */
export const PLAYER = {
  /** 宽度 */
  width: 8,
  /** 高度 */
  height: 8,
  /** 深度 */
  depth: 8,
};
/** 跑道参数 */
const RACETRACK_SEGMENTS = 5;
export const SEGMENT_WIDTH = (PLAYER.width + 2);
export const RACETRACK = {
  /** 跑道宽度 */
  width: SEGMENT_WIDTH * RACETRACK_SEGMENTS,
  /** 跑道高度 */
  height: CAMERA.far,
  /** 跑道y坐标 */
  y: - PLAYER.height / 2,
  /** 跑道分段 */
  segments: RACETRACK_SEGMENTS,
  /** 单条跑道宽度 */
  segmentWidth: SEGMENT_WIDTH,
};
/** 雾化效果的可见区域 */
export const VISIBLE_AREA = {
  /** 起始点 */
  start: -PLAYER.depth / 2,
  /** 结束点 */
  end: Math.abs(BOUNDARY.zEnd),
};
/** NPC参数 */
export const NPC = {
  /** 宽度 */
  width: PLAYER.width,
  /** 深度 */
  height: PLAYER.height,
  /** 深度 */
  depth: PLAYER.depth,
  /** 类型 */
};
/** 事件 */
export const EVENTS = {
  /** 滑动 */
  SLIDE: 'SLIDE',
  /** 点击 */
  TAP: 'TAP',
};

/** 分数 */
export const SCORE = {
  /** 单个数字宽度 */
  width: 4,
  /** 位置 */
  y: 55,
};

/** 音频动画 */
export const MUSIC_FRAME = {
  /** 波形宽度 */
  width: 60,
  /** 波形高度 */
  height: 30,
  /** 波形间距 */
  padding: 8,
  /** 波形高峰值 */
  max: 255,
};
