/** 格式化 & 日期工具函数 */

/** 数字 → 千分位货币字符串（如 1234.5 → "1,234.50"） */
export function money(n: number): string {
  const parts = n.toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/** 日期字符串 → 中文星期几 */
const WEEKDAY_CN = ['日', '一', '二', '三', '四', '五', '六']
export function weekdayCn(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return WEEKDAY_CN[d.getDay()]
}

/** "YYYY-MM-DD" → Date */
export function parseDate(str: string): Date | null {
  const d = new Date(str + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}

/** Date → "YYYY-MM-DD" */
export function fmtDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 生成起止日期之间的所有日期（含两端），格式 "YYYY-MM-DD" */
export function dateRange(start: string, end: string): string[] {
  const s = parseDate(start)
  const e = parseDate(end)
  if (!s || !e) return []
  const result: string[] = []
  const cur = new Date(s)
  while (cur <= e) {
    result.push(fmtDate(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

/** 两个日期之间的天数差（含两端） */
export function diffDays(start: string, end: string): number {
  const s = parseDate(start)
  const e = parseDate(end)
  if (!s || !e) return 0
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1
}
