import offScreenCanvas from '../../Game/offScreenCanvas';
import cax from '../../lib/cax';
import * as util from '../util';

export interface IRank {
  /** 渲染 */
  render: () => any;
}

export default class Rank implements IRank {
  /** 游戏主屏的数据 */
  private data;
  /** 排行榜数据 */
  private list: UserGameData[] = [];
  /** 数据加载中 */
  private loading = false;
  /** 舞台 */
  private stage: any;
  /** 元素的容器 */
  private group: any;
  constructor(data) {
    this.data = data;
    this.getFriendList();
    this.stage = offScreenCanvas.stage;
    this.stage.empty();
    this.stage.scale = data.ratio;
    this.group = new cax.Group();
    this.stage.add(this.group);
  }
  /** 渲染 */
  render() {
    this.group.empty();
    this.group.add(this.renderTitle());
    this.group.add(this.renderRect());
    if (this.loading) {
      this.group.add(this.renderTip('加载中...'));
    } else if (this.list.length) {
      this.renderAsyncRank();
    } else {
      this.group.add(this.renderTip('空空如也~'));
    }
    this.stage.update();
  }
  /** 排行榜标题 */
  private renderTitle() {
    const { data } = this;
    const fontSize = data.titleFontSize;
    const { font } = data;
    const { width } = data;
    const height = data.titleHeight;
    const text = new cax.Text('\uE610 排行榜', {
      font: `${fontSize}px ${font}`,
      color: '#ffffff',
      textAlign: 'center',
      textBaseline: 'middle',
    });
    text.x = width / 2;
    text.y = height / 2;
    return text;
  }
  /** 排行榜框 */
  private renderRect() {
    const { data } = this;
    const { width } = data;
    const height = data.height - data.titleHeight;
    const { radius } = data;
    const roundedRect = new cax.RoundedRect(width, height, radius, {
      fillStyle: data.backgroundColor,
      strokeStyle: data.borderColor,
    });
    roundedRect.y = data.titleHeight;
    roundedRect.alpha = data.opacity;
    return roundedRect;
  }
  /** 提示 */
  private renderTip(message: string) {
    const { data } = this;
    const fontSize = data.itemFontSize;
    const { width } = data;
    const { font } = data;
    const text = new cax.Text(message, {
      font: `${fontSize}px ${font}`,
      color: '#ffffff',
      textAlign: 'center',
      textBaseline: 'middle',
    });
    const paddingTop = 30;
    text.y = data.titleHeight + paddingTop;
    text.x = width / 2;
    return text;
  }
  private async getFriendList() {
    const { data } = this;
    try {
      this.loading = true;
      const friendList = await util.getFriendList();
      this.loading = false;
      this.list = util.sortScore(friendList.slice(0, data.count));
    } catch (err) {
      console.warn('请求榜单列表失败，重新发起请求', err);
    }
  }
  /** 渲染排行榜数据 */
  private renderAsyncRank() {
    const { data } = this;
    const { itemFontSize } = data;
    const { itemHeight } = data;
    const { font } = data;
    const colorArray = ['#de7c00', '#e2ac4b', '#d6c541'];
    const defaultColor = '#ffffff';
    const paddingTop = 30;
    const listGroup = new cax.Group();
    listGroup.y = data.titleHeight + paddingTop;
    for (const [i, userData] of this.list.entries()) {
      const itemGroup = new cax.Group();
      itemGroup.y = itemHeight * i;

      // 渲染排行榜序号
      const orderText = new cax.Text((i + 1).toString(), {
        font: `${data.orderFontSize}px ${font}`,
        color: colorArray[i] || defaultColor,
        textAlign: 'right',
        textBaseline: 'middle',
      });
      orderText.x = 50;
      orderText.y = 2;

      // 渲染排行榜头像
      const { avatarUrl } = userData;
      const avatar = new cax.Bitmap(avatarUrl);
      avatar.x = 60;
      avatar.scale = 0.25;

      // 渲染排行榜昵称
      const { nickname } = userData;
      const nicknameText = new cax.Text(nickname, {
        font: `${itemFontSize}px ${font}`,
        color: colorArray[i] || defaultColor,
        textAlign: 'start',
        textBaseline: 'middle',
      });
      nicknameText.x = 106;
      nicknameText.y = 4;

      // 渲染分数
      const { KVDataList } = userData;
      let scoreText;
      KVDataList.forEach(({ key, value }) => {
        if (key === 'score') {
          scoreText = new cax.Text(value, {
            font: `${data.scoreFontSize}px ${font}`,
            color: '#ffffff',
            textAlign: 'right',
            textBaseline: 'middle',
          });
          scoreText.x = 350;
          scoreText.y = 4;
        }
      });

      itemGroup.add(orderText);
      itemGroup.add(avatar);
      itemGroup.add(nicknameText);
      itemGroup.add(scoreText);
      listGroup.add(itemGroup);
    }
    listGroup.alpha = data.opacity;
    this.group.add(listGroup);
  }
}
