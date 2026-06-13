// id 生成
export function uid(prefix: string = 'u'): string {
  return prefix + '_' + Math.random().toString(36).slice(2, 10)
}
