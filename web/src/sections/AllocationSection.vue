<script setup lang="ts">
import { computed } from 'vue'
import PanelHeader from '@/components/PanelHeader.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { money } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'

const store = useReimbursementStore()
const confirm = useConfirm()

const compOptions = computed(() =>
  store.companies.map(c => ({ id: c.reimCompanyId, name: `${c.reimCompanyName}/${c.reimCompanyNo}` }))
)
const projOptions = computed(() =>
  store.projects.map(p => ({ id: p.projectId, name: `${p.projectName}/${p.projectNo}` }))
)

function addRow() { store.addAllocationRow() }

async function removeRow(idx: number) {
  if (store.allocation.length <= 1) {
    await confirm.alert('至少保留一条分摊记录')
    return
  }
  const ok = await confirm.confirm({ type: 'warning', title: '确认删除', text: '确定要删除该分摊行吗？' })
  if (!ok) return
  const list = [...store.allocation]
  list.splice(idx, 1)
  // 删除后重算首行比例 = 1 - sum(row2+)
  const otherSum = list.slice(1).reduce((s, a) => s + a.ratio, 0)
  list[0].ratio = Math.max(0, Math.min(1, 1 - otherSum))
  const total = store.subsidyTotal
  list.forEach(a => { a.amount = Math.round(a.ratio * total * 100) / 100 })
  store.setAllocation(list)
}

function onCompanyChange(idx: number, val: string) {
  const list = store.allocation.map((a, i) => (i === idx ? { ...a, company: val } : a))
  store.setAllocation(list)
}

function onProjectChange(idx: number, val: string) {
  const list = store.allocation.map((a, i) => (i === idx ? { ...a, project: val } : a))
  store.setAllocation(list)
}

/**
 * 当第 2 行及以后的比例被修改时：
 *   第一行比例 = 100% - 其余行比例之和
 *   若 ∑(第2+行) > 100%，清空当前输入值
 */
function onRatioInput(idx: number, rawPercent: string) {
  if (idx === 0) return // 第一行比例自动计算，不可手动编辑

  const inputVal = rawPercent === '' ? 0 : Number(rawPercent)
  if (isNaN(inputVal)) return

  const inputRatio = Math.min(1, Math.max(0, inputVal / 100))
  const list = store.allocation.map(a => ({ ...a }))

  // 计算其他第2+行的比例之和（不含当前行）
  let otherSum = 0
  list.forEach((a, i) => {
    if (i !== 0 && i !== idx) otherSum += a.ratio
  })

  // 若 ∑(第2+行) > 100%，清空当前输入（归零）
  if (otherSum + inputRatio > 1.0001) {
    list[idx].ratio = 0
  } else {
    list[idx].ratio = inputRatio
  }

  // 重算第一行比例 = 1 - 所有第2+行之和
  const allOtherSum = list.slice(1).reduce((s, a) => s + a.ratio, 0)
  list[0].ratio = Math.max(0, Math.min(1, 1 - allOtherSum))

  // 同步每行金额（四舍五入到分）
  const total = store.subsidyTotal
  list.forEach(a => { a.amount = Math.round(a.ratio * total * 100) / 100 })

  store.setAllocation(list)
}

/** 均摊：总额平均分配给所有行，误差放首行 */
function onEqualSplit() {
  const n = store.allocation.length
  if (n <= 1) return

  const total = store.subsidyTotal
  // 每份基础比例（保留4位精度后截断）
  const baseRatio = Math.floor((1 / n) * 10000) / 10000

  const list = store.allocation.map((a, i) => {
    if (i === 0) {
      // 首行吸收误差
      const otherSum = (n - 1) * baseRatio
      const firstRatio = Math.max(0, 1 - otherSum)
      return { ...a, ratio: firstRatio, amount: Math.round(firstRatio * total * 100) / 100 }
    }
    return { ...a, ratio: baseRatio, amount: Math.round(baseRatio * total * 100) / 100 }
  })

  store.setAllocation(list)
}

function ratioPercent(ratio: number): string {
  return (ratio * 100).toFixed(2)
}

const ratioSumPercent = computed(() => {
  const sum = store.allocation.reduce((s, r) => s + Number(r.ratio || 0), 0)
  return (sum * 100).toFixed(2)
})

const ratioValid = computed(() => {
  const sum = store.allocation.reduce((s, r) => s + Number(r.ratio || 0), 0)
  return Math.abs(sum - 1) < 0.001 || store.allocation.length === 0
})

const allocMatchSubsidy = computed(() => {
  return Math.abs(store.subsidyTotal - store.allocTotal) < 0.01
})
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.allocation }">
    <PanelHeader @toggle="store.togglePanel('allocation')">
      <template #title>费用归属及分摊</template>
      <template #extra>
        <span class="alloc-sub-title">(补助总金额: {{ money(store.subsidyTotal) }})</span>
      </template>
    </PanelHeader>
    <div class="panel-body">
      <table v-if="store.allocation.length > 0" class="table">
        <thead>
          <tr>
            <th class="col-index">序号</th>
            <th>费用归属<span class="req">*</span></th>
            <th>项目</th>
            <th class="right">
              分摊比例
              <span v-if="!store.ui.readonly" class="equal-split-btn" @click.stop="onEqualSplit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.5 2v6h-6"/>
                  <path d="M2.5 12a9 9 0 0 1 15-6.7l4 2.7"/>
                  <path d="M2.5 22v-6h6"/>
                  <path d="M21.5 12a9 9 0 0 1-15 6.7l-4 2.7"/>
                </svg>
                <span class="split-tooltip">均摊</span>
              </span>
              <span class="req">*</span>
            </th>
            <th class="right">分摊金额<span class="req">*</span></th>
            <th class="col-action">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(a, idx) in store.allocation" :key="a.id">
            <td class="col-index">{{ idx + 1 }}</td>
            <td>
              <BaseSelect
                :model-value="a.company"
                :options="compOptions"
                placeholder="请选择公司"
                @update:model-value="(v: string) => onCompanyChange(idx, v)"
              />
            </td>
            <td>
              <BaseSelect
                :model-value="a.project"
                :options="projOptions"
                placeholder="请选择项目"
                @update:model-value="(v: string) => onProjectChange(idx, v)"
              />
            </td>
            <td class="right">
              <div class="ratio-cell">
                <input
                  type="number"
                  class="ratio-input"
                  min="0" max="100" step="0.01"
                  :value="ratioPercent(a.ratio)"
                  :disabled="idx === 0"
                  :class="{ 'ratio-locked': idx === 0 }"
                  @input="onRatioInput(idx, ($event.target as HTMLInputElement).value)"
                />
                <span class="ratio-unit">%</span>
              </div>
            </td>
            <td class="right">{{ money(a.amount) }}</td>
            <td class="col-action">
              <span
                v-if="!store.ui.readonly"
                class="op-icon danger"
                @click="removeRow(idx)"
                title="删除"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </span>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr v-if="!store.ui.readonly" class="add-row-tr">
            <td colspan="6" style="text-align: center; padding: 8px 0;">
              <button class="btn-text add-row-btn" @click="addRow">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/>
                </svg>
                添加一行
              </button>
            </td>
          </tr>
          <tr class="summary-row">
            <td colspan="3"><strong class="summary-label">合计</strong></td>
            <td class="right" :class="{ 'text-danger': !ratioValid }">
              <strong class="summary-num">{{ ratioSumPercent }}%</strong>
            </td>
            <td class="right" :class="{ 'text-danger': !allocMatchSubsidy }">
              <strong class="summary-num">CNY {{ money(store.allocTotal) }}</strong>
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <div v-else class="empty-hint">暂无分摊信息，请点击"新增分摊"添加</div>
    </div>
  </section>
</template>

<style scoped>
.ratio-cell {
  display: flex; align-items: center; justify-content: flex-end;
}
.ratio-input {
  width: 80px; height: 30px; text-align: right; padding: 0 6px;
  border: 1px solid #dcdfe6; border-radius: 3px; font-size: 14px;
}
.ratio-input:focus { border-color: #409eff; outline: none; }
.ratio-input.ratio-locked { background: #f5f7fa; color: #909399; cursor: not-allowed; }
.ratio-unit {
  margin-left: 4px; font-size: 14px; color: #606266;
}

/* 必填星号 */
.req { color: #f53f3f; }

/* 删除图标 */
.op-icon.danger { color: #f53f3f; }
.op-icon.danger:hover { background: #fef0f0; }

/* 均摊按钮（表头） */
.equal-split-btn {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: #ecf5ff; color: #409eff; cursor: pointer;
  margin-left: 6px; font-size: 12px; vertical-align: middle;
  transition: background 0.2s, color 0.2s;
}
.equal-split-btn:hover { background: #409eff; color: #fff; }
.equal-split-btn svg { width: 14px; height: 14px; }

/* 蓝色悬浮气泡 */
.split-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: #409eff;
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 10;
}
/* 气泡下方尖角 */
.split-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #409eff;
}
.equal-split-btn:hover .split-tooltip {
  opacity: 1;
}

.text-danger { color: #f56c6c; }
.invalid-hint { font-weight: 400; font-size: 12px; color: #f56c6c; margin-left: 4px; }
.empty-hint { text-align: center; color: #c0c4cc; padding: 24px 0; font-size: 14px; }
.alloc-sub-title {
  font-size: 13px; color: #606266; font-weight: 400;
}
.add-row-btn { justify-content: center; margin: 0 auto; }
.add-row-tr td { border-bottom: none !important; }

/* 合计行 */
.summary-row td {
  background: #fdf6ec; font-size: 14px;
  border-top: 1px solid #ebeef5;
}
.summary-label { color: #c0c4cc; }
.summary-num { color: #e6a23c; }
</style>
