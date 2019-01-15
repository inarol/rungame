/** 音乐文件 */
const loadAudio = (): Promise<InnerAudioContext> => {
  return new Promise((resolve) => {
    const audio = wx.createInnerAudioContext();
    audio.src = 'assets/audio/bgm.mp3';
    audio.onCanplay(() => {
      resolve(audio);
    });
  });
};

/** 音频解析文件 */
const loadAudioJson = (): Promise<JSON> => {
  return new Promise((resolve) => {
    const wxfile = wx.getFileSystemManager();
    wxfile.readFile({
      filePath: 'assets/audio/bgm.json',
      encoding: 'utf-8',
      success: (res: any) => {
        resolve(JSON.parse(res.data));
      },
    });
  });
};

/** 资源加载 */
export const preload = (): Promise<{
  /** 音频文件 */
  audio: InnerAudioContext;
  /** 音频解析 */
  audioJson: JSON;
}> => {
  return new Promise(async (resolve) => {
    const audio = await loadAudio();
    const audioJson = await loadAudioJson();
    resolve({
      audio,
      audioJson,
    });
  });
};
