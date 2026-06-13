// 格式化工具
export function money(n: number | string | null | undefined): string {
  const v = Number(n || 0)
  return v.toFixed(2)
}

export function percent(n: number | string | null | undefined): string {
  return (Number(n || 0) * 100).toFixed(2) + '%'
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return ''
  if (typeof d === 'string') return d
  const dt = d
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 日期区间天数（包含两端） */
export function diffDays(start: string, end: string): number {
  const a = parseDate(start)
  const b = parseDate(end)
  if (!a || !b) return 0
  return Math.floor((b.getTime() - a.getTime()) / 86400000) + 1
}

/** 日期范围数组 */
export function dateRange(start: string, end: string): string[] {
  const list: string[] = []
  const a = parseDate(start)
  const b = parseDate(end)
  if (!a || !b || b < a) return list
  const cur = new Date(a)
  while (cur <= b) {
    list.push(fmtDate(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return list
}

export function weekdayCn(d: string): string {
  const dt = parseDate(d)
  if (!dt) return ''
  return ['日', '一', '二', '三', '四', '五', '六'][dt.getDay()]
}

/** HTML 转义 */
export function esc(str: unknown): string {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
