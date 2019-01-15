import { EventEmitter } from 'fbemitter';
import { RATIO, EVENTS } from '../constant';
import { IGame } from '../../Game';

/** 坐标 */
interface IPoint {
  x: number;
  y: number;
}

/** 移动方向 */
export type IDirection = 'LEFT' | 'RIGHT';

/** 游戏手柄，控制主角跳跃，移动 */
interface IGamepad { }

/** 游戏手柄 */
export default class Gamepad implements IGamepad {
  private emitter: EventEmitter;
  constructor(params: {
    game: IGame;
  }) {
    const { game } = params;
    this.emitter = game.emitter;
    this.bindTouchEvent();
  }
  private bindTouchEvent() {
    let startPoint: IPoint = { x: 0, y: 0 };
    const touchStart = ({ touches }) => {
      startPoint = {
        x: touches[0].clientX,
        y: touches[0].clientY,
      };
    };
    const touchEnd = ({ changedTouches }) => {
      const { type, value } = this.getTouchResult(startPoint, {
        x: changedTouches[0].clientX,
        y: changedTouches[0].clientY,
      });
      if (type === 'SLIDE') {
        this.emitter.emit(EVENTS.SLIDE, {
          direction: value,
        });
        return;
      }
      if (type === 'TAP') {
        this.emitter.emit(EVENTS.TAP, {
          position: value,
        });
        return;
      }
    };
    wx.onTouchStart(touchStart);
    wx.onTouchEnd(touchEnd);
  }
  /** 获取点击行为 */
  private getTouchResult = (startPoint: IPoint, endPoint): {
    type: 'SLIDE' | 'TAP' | 'UNKNOW',
    value: IDirection | IPoint | '',
  } => {
    const { x: startX, y: startY } = startPoint;
    const { x: endX, y: endY } = endPoint;
    const angX = endX - startX;
    const angY = endY - startY;
    if (Math.abs(angX) >= 10) {
      const angle = Math.atan2(angY, angX) * 180 / Math.PI;
      if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
        return {
          type: 'SLIDE',
          value: 'LEFT',
        };
      }
      if (angle >= -45 && angle <= 45) {
        return {
          type: 'SLIDE',
          value: 'RIGHT',
        };
      }
      return {
        type: 'UNKNOW',
        value: '',
      };
    }
    return {
      type: 'TAP',
      value: endPoint,
    };
  }
}
