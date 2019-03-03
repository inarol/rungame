// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let { OPENID, APPID, UNIONID } = cloud.getWXContext();
    return {
      status: 200,
      data: {
        OPENID,
        APPID,
        UNIONID,
      },
    }
  } catch (error) {
    return {
      status: -1,
      data: {},
    };
  }
}