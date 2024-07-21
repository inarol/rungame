import Game from './Game';
import { preload } from './preload';

/** 获取用户openId */
const getOpenId = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: ({ result }) => {
        console.log('>', result);
        if (result.status === 200) {
          resolve(result.data.openId);
        }
      },
      fail: reject,
    });
  });
};

wx.cloud.init();

async function main() {
  const { audioList, audioListJson, font } = await preload();
  const game = new Game({
    /** 音频文件 */
    audioList,
    /** 音频解析文件 */
    audioListJson,
    /** 字体文件 */
    font,
  });
  game.openId = wx.getStorageSync('openId') || wx.setStorageSync('openId', await getOpenId());
  wx.onShow(() => {
    game.audio.play();
  });
}

main();
