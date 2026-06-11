/* 工具函数 */

window.U = {
  /** 金额格式化：保留两位小数 */
  money(n) {
    const v = Number(n || 0);
    return v.toFixed(2);
  },

  /** 百分比格式化：0~1 -> xx.xx% */
  percent(n) {
    return (Number(n || 0) * 100).toFixed(2) + '%';
  },

  /** 日期格式化：yyyy-MM-dd */
  fmtDate(d) {
    if (!d) return '';
    if (typeof d === 'string') return d;
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  /** 解析 yyyy-MM-dd */
  parseDate(s) {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  },

  /** 计算两个日期间天数（包含两端） */
  diffDays(start, end) {
    const a = this.parseDate(start);
    const b = this.parseDate(end);
    if (!a || !b) return 0;
    return Math.floor((b - a) / 86400000) + 1;
  },

  /** 生成日期范围数组（含两端） */
  dateRange(start, end) {
    const list = [];
    const a = this.parseDate(start);
    const b = this.parseDate(end);
    if (!a || !b || b < a) return list;
    const cur = new Date(a);
    while (cur <= b) {
      list.push(this.fmtDate(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return list;
  },

  /** 取星期几 */
  weekdayCn(d) {
    const dt = this.parseDate(d);
    if (!dt) return '';
    return ['日', '一', '二', '三', '四', '五', '六'][dt.getDay()];
  },

  /** 转义 HTML */
  esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /** 唯一 id */
  uid(prefix) {
    return (prefix || 'u') + '_' + Math.random().toString(36).slice(2, 10);
  },

  /** 深度克隆（JSON 安全） */
  clone(o) {
    return JSON.parse(JSON.stringify(o));
  }
};
