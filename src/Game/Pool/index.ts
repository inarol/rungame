const __ = {
  poolDic: Symbol('poolDic'),
};

export interface IPool {
  /** 从对象池中获取对象 */
  getItemByClass: <T>(name: string, className: new () => T) => T;
  /** 将对象回收到对象池 */
  recover: (name: string, instance: object) => void;
}

/**
 * 简易的对象池实现
 * 用于对象的存贮和重复使用
 * 可以有效减少对象创建开销和避免频繁的垃圾回收
 * 提高游戏性能
 */
export default class Pool implements IPool {
  constructor() {
    this[__.poolDic] = {};
  }
  /**
   * 根据对象标识符
   * 获取对应的对象池
   */
  getPoolBySign(name) {
    let sign = this[__.poolDic][name];
    if (!sign) {
      this[__.poolDic][name] = [];
      sign = [];
    }
    return sign;
  }
  /**
   * 根据传入的对象标识符，查询对象池
   * 对象池为空创建新的类，否则从对象池中取
   */
  getItemByClass(name, ClsName) {
    const pool = this.getPoolBySign(name);
    return pool.length ? pool.shift() : new ClsName();
  }
  /**
   * 将对象回收到对象池
   * 方便后续继续使用
   */
  recover(name, instance) {
    this.getPoolBySign(name).push(instance);
  }
}
