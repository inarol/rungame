/** 音乐文件 */
export interface IAudioList {
  /** 开头音乐 */
  begin: InnerAudioContext;
  /** 游戏音乐 */
  bgm: InnerAudioContext;
}
const loadAudio = async (): Promise<IAudioList> => {
  const load = (url: string): Promise<InnerAudioContext> =>
    new Promise((resolve) => {
      const audio = wx.createInnerAudioContext();
      audio.src = url;
      audio.onCanplay(() => {
        resolve(audio);
      });
    });
  const audios = await Promise.all([load('assets/audio/begin.mp3'), load('assets/audio/bgm.mp3')]);
  return {
    begin: audios[0],
    bgm: audios[1],
  };
};

/** 音频解析文件 */
export interface IAudioJsonList {
  /** 开头音乐解析文件 */
  begin: JSON;
  /** 游戏音乐解析文件 */
  bgm: JSON;
}
const loadAudioJson = async (): Promise<IAudioJsonList> => {
  const load = (url: string): Promise<JSON> =>
    new Promise((resolve) => {
      const wxfile = wx.getFileSystemManager();
      wxfile.readFile({
        filePath: url,
        encoding: 'utf-8',
        success: (res: any) => {
          resolve(JSON.parse(res.data));
        },
      });
    });
  const jsons = await Promise.all([load('assets/audio/begin.json'), load('assets/audio/bgm.json')]);
  return {
    begin: jsons[0],
    bgm: jsons[1],
  };
};

/** 加载字体文件 */
const loadFont = (): Promise<any> => {
  if (wx.getSystemInfoSync().platform === 'devtools') {
    return Promise.resolve('arial');
  }
  return new Promise((resolve, reject) => {
    const font = wx.loadFont('assets/font/iconfont.ttf');
    if (font) {
      resolve(font);
    } else {
      reject('加载字体失败');
    }
  });
};

/** 资源加载 */
export const preload = async (): Promise<{
  /** 音频文件 */
  audioList: IAudioList;
  /** 音频解析 */
  audioListJson: IAudioJsonList;
  /** 字体文件 */
  font: string;
}> => {
  const audioList = await loadAudio();
  const audioListJson = await loadAudioJson();
  const font = await loadFont();
  return {
    audioList,
    audioListJson,
    font,
  };
};
