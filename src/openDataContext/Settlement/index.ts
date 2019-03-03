import cax from '../../lib/cax';
import offScreenCanvas from  '../../Game/offScreenCanvas';
import * as util from '../util';

export interface ISettlement {
  /** 渲染 */
  render: () => any;
}

export default class Settlement implements ISettlement {
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
    this.getNearFriendList();
    this.stage = offScreenCanvas.stage;
    this.stage.empty();
    this.stage.scale = data.ratio;
    this.group = new cax.Group();
    this.stage.add(this.group);
  }
  /** 渲染 */
  public render() {
    this.group.empty();
    this.group.add(this.renderTitle());
    this.group.add(this.renderScore());
    this.group.add(this.renderRect());
    if (this.loading) {
      this.group.add(this.renderTip('结算中...'));
    } else {
      if (this.list.length) {
        this.renderAsyncNearFriend();
      } else {}
    }
    this.stage.update();
  }
  /** 排行榜标题 */
  private renderTitle() {
    const data = this.data;
    const fontSize = data.title.fontSize;
    const font = data.font;
    const width = data.width;
    const text = new cax.Text('\uE71B 本次分数 \uE71B', {
      font: `${fontSize}px ${font}`,
      color: '#ffffff',
      textAlign: 'center',
      textBaseline: 'middle',
    });
    text.x = width / 2;
    text.y = data.title.y;
    return text;
  }
  /** 渲染分数 */
  private renderScore() {
    const data = this.data;
    const score = data.score;
    const fontSize = data.score.fontSize;
    const font = data.font;
    const width = data.width;
    const text = new cax.Text(score.value.toString(), {
      font: `${fontSize}px ${font}`,
      color: '#ffffff',
      textAlign: 'center',
      textBaseline: 'middle',
    });
    text.x = width / 2;
    text.y = data.score.y;
    return text;
  }
  /** 排行榜框 */
  private renderRect() {
    const data = this.data;
    const width = data.width;
    const height = data.rect.height;
    const radius = data.radius;
    const roundedRect = new cax.RoundedRect(width, height, radius, {
      fillStyle: data.backgroundColor,
      strokeStyle: data.borderColor,
    });
    roundedRect.y = data.rect.y;
    roundedRect.alpha = data.opacity;
    return roundedRect;
  }
  /** 提示 */
  private renderTip(message: string) {
    const data = this.data;
    const fontSize = data.tip.fontSize;
    const width = data.width;
    const font = data.font;
    const text = new cax.Text(message, {
      font: `${fontSize}px ${font}`,
      color: '#dedede',
      textAlign: 'center',
      textBaseline: 'middle',
    });
    text.y = data.tip.y;
    text.x = width / 2;
    text.alpha = data.opacity;
    return text;
  }
  /** 渲染接近分数的好友 */
  private renderAsyncNearFriend() {
    const data = this.data;
    const openId = data.openId;
    const listGroup = new cax.Group();
    const font = data.font;
    const itemRect = data.itemRect;
    for (const [i, userData] of this.list.entries()) {
      const itemGroup = new cax.Group();
      itemGroup.x = itemRect.width * i;

      // 渲染框
      const rect = new cax.Rect(itemRect.width,  itemRect.height, {
        fillStyle: userData.openid === openId ?
                    itemRect.activeBackgroundColor :
                    itemRect.backgroundColor,
        strokeStyle: data.borderColor,
      });
      rect.alpha = data.opacity;

      // 渲染序号
      const order = userData['order'] + 1;
      const orderFontSize = itemRect.order.fontSize;
      const orderText = new cax.Text(order.toString(), {
        font: `${orderFontSize}px ${font}`,
        color: itemRect.order.color,
        textAlign: 'center',
        textBaseline: 'middle',
      });
      orderText.x = itemRect.width / 2;
      orderText.y = itemRect.order.y;

      // 渲染头像
      const { avatarUrl } = userData;
      const avatar = new cax.Bitmap(avatarUrl, () => {
        this.stage.update();
      });
      avatar.x = itemRect.avatar.x;
      avatar.y = itemRect.avatar.y;
      avatar.scale = 0.5;

      // 渲染昵称
      const { nickname } = userData;
      const nicknameText = new cax.Text(nickname, {
        font: `${itemRect.nickname.fontSize}px ${font}`,
        color: itemRect.nickname.color,
        textAlign: 'center',
        textBaseline: 'middle',
      });
      nicknameText.x = itemRect.width / 2;
      nicknameText.y = itemRect.nickname.y;

      // 渲染分数
      const { KVDataList } = userData;
      let scoreText;
      KVDataList.forEach(({ key, value }) => {
        if (key === 'score') {
          scoreText = new cax.Text(value, {
            font: `${itemRect.score.fontSize}px ${font}`,
            color: itemRect.score.color,
            textAlign: 'center',
            textBaseline: 'middle',
          });
          scoreText.x = itemRect.width / 2;
          scoreText.y = itemRect.score.y;
        }
      });
      itemGroup.add(rect);
      itemGroup.add(orderText);
      itemGroup.add(avatar);
      itemGroup.add(nicknameText);
      itemGroup.add(scoreText);
      listGroup.add(itemGroup);
    }
    listGroup.y = itemRect.y;
    this.group.add(listGroup);
  }
  private async getNearFriendList() {
    this.loading = true;
    const data = this.data;
    try {
      console.log('当前分数：', data.score.value);
      await util.uploadScore(data.score.value);
    } catch (error) {
      console.warn(error);
    }
    try {
      const friendList = await util.getNearFriendList(data.openId);
      this.loading = false;
      this.list = util.sortScore(friendList.slice(0, 3));
    } catch (err) {
      console.warn('请求结算列表失败，重新发起请求');
    }
  }
}
