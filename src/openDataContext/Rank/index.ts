import cax from '../../lib/cax';
import offScreenCanvas from  '../../Game/offScreenCanvas';
import * as util from '../util';

export interface IRank {
  /** 渲染 */
  render: (data: any) => any;
  /** 销毁 */
  destroy: () => void;
  /** 数据是否加载完 */
  loaded: boolean;
}

export default class Rank implements IRank {
  /** 游戏主屏的数据 */
  private data;
  /** 排行榜数据 */
  private list: UserGameData[];
  /** 数据是否加载完 */
  public loaded = false;
  /** 数据加载中 */
  private loading = false;
  /** 舞台 */
  private stage: any;
  /** 元素的容器 */
  private group: any;
  constructor() {
    this.list = [];
  }
  /** 渲染 */
  public render(data) {
    this.data = data;
    this.stage = offScreenCanvas.stage;
    this.stage.scale = data.ratio;
    this.stage.children = [];
    this.getFriendList();
    this.group = new cax.Group();
    this.group.add(this.renderTitle());
    this.group.add(this.renderRect());
    if (this.loading) {
      this.group.add(this.renderTip('加载中...'));
    }
    if (this.loaded) {
      if (this.list.length) {
        this.renderAsyncRank();
      } else {
        this.group.add(this.renderTip('空空如也~'));
      }
    }
    this.stage.add(this.group);
    this.stage.update();
  }
  /** 排行榜标题 */
  private renderTitle() {
    const data = this.data;
    const fontSize = data.titleFontSize;
    const font = data.font;
    const width = data.titleWidth;
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
    const data = this.data;
    const width = data.width;
    const height = data.height - data.titleHeight;
    const radius = data.radius;
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
    const data = this.data;
    const fontSize = data.itemFontSize;
    const width = data.width;
    const font = data.font;
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
  /** 渲染空列表 */
  private renderEmptyList() {
    const data = this.data;
    const fontSize = data.itemFontSize;
    const width = data.width;
    const font = data.font;
    const text = new cax.Text('空空如也~', {
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
    const data = this.data;
    if (!this.loading && !this.loaded) {
      this.loading = true;
      try {
        const friendList = await util.getFriendList();
        this.loaded = true;
        this.loading = false;
        this.list = util.sortScore(friendList.slice(0, data.count));
      } catch (err) {
        console.warn('请求榜单列表失败，重新发起请求');
        this.loaded = false;
      }
    }
  }
  /** 渲染排行榜数据 */
  private renderAsyncRank() {
    const data = this.data;
    const itemFontSize = data.itemFontSize;
    const itemHeight = data.itemHeight;
    const font = data.font;
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
      const bitmap = new cax.Bitmap(avatarUrl, () => {
        this.stage.update();
      });
      bitmap.x = 60;
      bitmap.scale = 0.25;

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
      itemGroup.add(bitmap);
      itemGroup.add(nicknameText);
      itemGroup.add(scoreText);
      listGroup.add(itemGroup);
    }
    this.group.add(listGroup);
  }
  /** 销毁 */
  destroy() {
    // todo
  }
}
