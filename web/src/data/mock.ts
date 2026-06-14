/**
 * 城市补助标准 Mock 数据
 * 城市类型：1=一线城市（北上广深等）2=二线城市 3=三线城市
 * 参考设计文档 5.3 节城市列表
 */

/** 一线城市列表 */
const TIER1_CITIES = new Set(['10119', '10458', '10529']) // 北京、上海、杭州

/** 每日餐费补助标准 */
export function cityMealStandard(cityNo: string): number {
  return TIER1_CITIES.has(cityNo) ? 100 : 70
}

/** 每日交通补助标准 */
export function cityTrafficStandard(): number {
  return 80
}

/** 每日通讯补助标准 */
export function cityCommStandard(): number {
  return 20
}
