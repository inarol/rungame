import Rank, { IRank } from './Rank';
import { CommandType } from './commandType';

class OpenDataContextCanvas {
  /** 排行榜 */
  private rank: IRank;
  constructor() {}
  /** 渲染排行榜 */
  public renderRank(data) {
    if (!this.rank) {
      this.rank = new Rank();
    }
    this.rank.render(data);
  }
  /** 移除排行榜 */
  public destroyRank() {
    this.rank.loaded = false;
    this.rank.destroy();
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
    default:
  }
});
