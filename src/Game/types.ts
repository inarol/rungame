import type { EventEmitter } from 'fbemitter';
import type { IPlayer } from './Player';

export interface IGame {
  /** 音频文件 */
  audio: InnerAudioContext;
  /** 音频解析文件 */
  audioJson: JSON;
  /** 字体文件 */
  font: string;
  /** 事件总线 */
  emitter: EventEmitter;
  /** 摄影机 */
  camera: THREE.Camera;
  /** 游戏速度 */
  speed: number;
  /** 游戏帧率 */
  fps: number;
  /** 玩家角色 */
  player: IPlayer;
  /** 开始游戏 */
  start: () => void;
  /** 游戏结束 */
  end: () => void;
  /** 重置游戏 */
  reset: () => void;
  /** 显示菜单 */
  showMenu: () => void;
  /** 显示排行榜 */
  showRank: () => void;
  /** 关闭排行榜 */
  closeRank: () => void;
  /** 分享 */
  share: () => void;
  /** 是否是游戏中 */
  isPlaying: boolean;
  /** 静止（屏蔽一些动画） */
  silent: boolean;
  /** 帧数（用于计时） */
  frame: number;
  /** 用户openId */
  openId: string;
}
