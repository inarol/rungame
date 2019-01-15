/** 排序分数 */
export const sortScore = (arr): UserGameData[] => {
  const len = arr.length;
  for (let i = 0; i < len; i += 1) {
    const data = arr[i];
    const klist = data.KVDataList;
    for (let j = 0; j < klist.length; j += 1) {
      const obj = klist[j];
      if (obj.key === 'score') {
        data[obj.key] = obj.value;
        break;
      }
    }
  }
  arr.sort((a, b) => parseInt(a.score, 10) >= parseInt(b.score, 10) ? -1 : 1);
  return arr;
};

/** 获取好友数据排行榜 */
export const getFriendList = (): Promise<UserGameData[]> => {
  return new Promise((resolve, reject) => {
    console.log('getFriendCloudStorage');
    wx.getFriendCloudStorage({
      keyList: ['score'],
      success: (res) => {
        const { data } = res;
        resolve(data);
      },
      fail: reject,
    });
  });
};
