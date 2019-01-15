import './lib/weapp-adapter';
import './lib/weapp-adapter-extend';
import './lib/threejs-shim';
import { preload } from './preload';
import Game from './Game';

(async () => {
  const { audioList, audioListJson, font } = await preload();
  new Game({
    /** 音频文件 */
    audioList,
    /** 音频解析文件 */
    audioListJson,
    /** 字体文件 */
    font,
  });
})();
