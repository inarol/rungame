import Rank, { IRank } from './Rank';
import Settlement, { ISettlement } from './Settlement';
import { CommandType } from './commandType';

class OpenDataContextCanvas {
  /** 排行榜 */
  private rank: IRank;
  /** 结算页 */
  private settlement: ISettlement;
  /** 渲染排行榜 */
  renderRank(data) {
    if (!this.rank) {
      this.rank = new Rank(data);
    }
    this.rank.render();
  }
  /** 移除排行榜 */
  destroyRank() {
    this.rank = null;
  }
  /** 渲染结算 */
  renderSettlement(data) {
    if (!this.settlement) {
      this.settlement = new Settlement(data);
    }
    this.settlement.render();
  }
  /** 移除结算 */
  destroySettlement() {
    this.settlement = null;
  }
}

const openDataContextCanvas = new OpenDataContextCanvas();

wx.onMessage(({ cmd, data }: { cmd: CommandType; data: any }) => {
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
