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
    console.log('getFriendList');
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

/** 获取相邻好友的数据 */
export const getNearFriendList = (openId: string): Promise<UserGameData[]> => {
  return new Promise(async (resolve, reject) => {
    console.log('getNearFriendList');
    console.log('current openId: ', openId);
    const list = sortScore(await getFriendList());
    console.log('nearFriendList', list);
    const nearListData = [];
    for (const [i, userData] of list.entries()) {
      if (userData.openid === openId) {
        const prevUserData = list[i - 1];
        const nextUserData = list[i + 1];
        if (prevUserData) {
          prevUserData['order'] = i - 1;
          nearListData.push(prevUserData);
        }
        userData['order'] = i;
        nearListData.push(userData);
        if (nextUserData) {
          nextUserData['order'] = i + 1;
          nearListData.push(nextUserData);
        }

        // 当前排名第一位或最后一位时，需要向前后向后补位
        const tailUserData = list[i + 2];
        const headUserData = list[i - 2];
        if (!prevUserData && tailUserData) {
          tailUserData['order'] = i + 2;
          nearListData.push(tailUserData);
        } else if (!nextUserData && headUserData) {
          headUserData['order'] = i - 2;
          nearListData.unshift(headUserData);
        }
      }
    }
    console.log('nearFriendList', nearListData);
    resolve(nearListData);
  });
};

/** 上传分数 */
export const uploadScore = async (score: number) => {
  // 设置分数
  const setScore = (newScore) => {
    return new Promise((resolve, reject) => {
      wx.setUserCloudStorage({
        KVDataList: [{
          key: 'score',
          value: newScore.toString(),
        }],
        success: resolve,
        fail: reject,
      });
    });
  };
  // 获取最大分数
  const getScore = () => {
    return new Promise((resolve, reject) => {
      wx.getUserCloudStorage({
        keyList: ['score'],
        success: ({ KVDataList }) => {
          if (KVDataList.length) {
            const lastScore = parseInt(KVDataList[0].value, 10);
            resolve(lastScore);
          } else {
            resolve(score);
          }
        },
        fail: reject,
      });
    });
  };
  try {
    const lastScore = await getScore();
    if (lastScore < score) {
      console.log('正在更新分数：', score);
      return setScore(score);
    }
    console.log('不需要更新分数：', lastScore);
    return Promise.resolve();
  } catch (error) {
    return Promise.reject('更新分数失败');
  }
};
