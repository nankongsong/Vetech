/** 简易唯一 ID 生成器（运行时递增 + 时间戳） */
let counter = 0

export function uid(prefix: string): string {
  return `${prefix}_${++counter}_${Date.now().toString(36)}`
}
