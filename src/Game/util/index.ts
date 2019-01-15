/** 产生随机数 */
export const rnd = (start: number, end: number, isInt: boolean) => {
  if (isInt) {
    return Math.floor(Math.random() * (end + 1 - start) + start);
  }
  return Math.random() * (end + 1 - start) + start;
};
