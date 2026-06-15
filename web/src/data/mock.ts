/**
 * 城市补助标准 Mock 数据
 * 城市类型：1=一线城市（北上杭）2=二线城市（武汉）3=三线城市（荆州）
 * 参考设计文档 5.3 节城市列表
 *
 * 餐费标准：
 *   一线城市 100 元/天
 *   二线城市  80 元/天
 *   三线城市  50 元/天
 * 交通标准：40 元/天
 * 通讯标准：40 元/天
 */

/** 每日餐费补助标准 — 按城市类型 */
export function cityMealStandard(cityType: '1' | '2' | '3'): number {
  if (cityType === '1') return 100
  if (cityType === '2') return 80
  return 50
}

/** 每日交通补助标准 */
export function cityTrafficStandard(): number {
  return 40
}

/** 每日通讯补助标准 */
export function cityCommStandard(): number {
  return 40
}
