import './lib/weapp-adapter';
import './lib/weapp-adapter-extend';
import './lib/threejs-shim';
import { preload } from './preload';
import Game from './Game';

/** 获取用户openId */
const getOpenId = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    wx['cloud'].callFunction({
      name: 'getOpenId',
      success: ({ result }) => {
        if (result.status === 200) {
          resolve(result.data.OPENID);
        }
      },
      fail: reject,
    });
  });
};

/** 初始化云函数 */
wx['cloud'].init();

(async () => {
  const { audioList, audioListJson, font } = await preload();
  const game = new Game({
    /** 音频文件 */
    audioList,
    /** 音频解析文件 */
    audioListJson,
    /** 字体文件 */
    font,
  });
  game.openId = await getOpenId();
  wx.onShow(() => {
    game.audio.play();
  });
})()