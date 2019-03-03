import Rank, { IRank } from './Rank';
import Settlement, { ISettlement } from './Settlement';
import { CommandType } from './commandType';
import * as util from './util';

class OpenDataContextCanvas {
  /** 排行榜 */
  private rank: IRank;
  /** 结算页 */
  private settlement: ISettlement;
  constructor() {}
  /** 渲染排行榜 */
  public renderRank(data) {
    if (!this.rank) {
      this.rank = new Rank(data);
    }
    this.rank.render();
  }
  /** 移除排行榜 */
  public destroyRank() {
    this.rank = null;
  }
  /** 渲染结算 */
  public renderSettlement(data) {
    if (!this.settlement) {
      this.settlement = new Settlement(data);
    }
    this.settlement.render();
  }
  /** 移除结算 */
  public destroySettlement() {
    this.settlement = null;
  }
}

const openDataContextCanvas = new OpenDataContextCanvas();

wx.onMessage(({ cmd, data }: { cmd: CommandType, data: any }) => {
  console.log('收到开放数据域渲染指令: ', cmd);
  switch (cmd) {
    case CommandType.RANK_RENDER:
      openDataContextCanvas.renderRank(data);
      break;
    case CommandType.RANK_DESTROY:
      openDataContextCanvas.destroyRank();
      break;
    case CommandType.SETTLEMENT_RENDER:
      openDataContextCanvas.renderSettlement(data);
      break;
    case CommandType.SETTLEMENT_DESTROY:
      openDataContextCanvas.destroySettlement();
      break;
    default:
  }
});
