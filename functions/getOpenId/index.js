// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

// 云函数入口函数
exports.main = async () => {
  try {
    const { OPENID, APPID, UNIONID } = cloud.getWXContext();
    return {
      status: 200,
      data: {
        openId: OPENID,
        appId: APPID,
        unionId: UNIONID,
      },
    };
  } catch (error) {
    return {
      status: -1,
      data: {},
    };
  }
};
