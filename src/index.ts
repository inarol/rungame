import './lib/weapp-adapter';
import './lib/weapp-adapter-extend';
import { preload } from './preload';
import Game from './Game';

(async () => {
  const { audio, audioJson } = await preload();
  new Game({
    /** 音频文件 */
    audio,
    /** 音频解析文件 */
    audioJson,
  });
})();
