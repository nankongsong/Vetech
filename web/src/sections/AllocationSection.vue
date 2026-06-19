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
      <template #title>费用归属及分摊<span class="alloc-sub-title">&nbsp;&nbsp;(分摊金额: {{ money(store.subsidyTotal) }})</span></template>
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
                <img src="@/assets/分摊图标.svg" class="split-icon" />
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
                  type="text"
                  class="ratio-input"
                  inputmode="decimal"
                  :value="ratioPercent(a.ratio)"
                  :disabled="idx === 0"
                  :class="{ 'ratio-locked': idx === 0 }"
                  @input="onRatioInput(idx, ($event.target as HTMLInputElement).value)"
                />
                <span class="ratio-unit">%</span>
              </div>
            </td>
            <td class="right">
              <input type="text" class="amount-input" :value="money(a.amount)" readonly />
            </td>
            <td class="col-action">
              <span
                v-if="!store.ui.readonly"
                class="op-icon"
                @click="removeRow(idx)"
                title="删除"
              >
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12z" fill="#fff" stroke="#409eff" stroke-width="1.5"/>
                  <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#fff" stroke="#409eff" stroke-width="1.5"/>
                  <path d="M9.5 10v6M12 10v6M14.5 10v6M17 10v6" stroke="#409eff" stroke-width="1" fill="none"/>
                </svg>
              </span>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr v-if="!store.ui.readonly" class="add-row-tr">
            <td colspan="6" style="text-align: center; padding: 8px 0;">
              <button class="btn-text add-row-btn" @click="addRow">
                <span class="add-icon-circle">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/>
                  </svg>
                </span>
                添加一行
              </button>
            </td>
          </tr>
          <tr class="summary-row">
            <td colspan="3"><span class="summary-label">合计</span></td>
            <td class="right" :class="{ 'text-danger': !ratioValid }">
              <span class="summary-num">{{ ratioSumPercent }}%</span>
            </td>
            <td class="right" :class="{ 'text-danger': !allocMatchSubsidy }">
              <span class="summary-num">CNY {{ money(store.allocTotal) }}</span>
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
  width: 135px; height: 30px; text-align: right; padding: 0 6px;
  border: 1px solid #dcdfe6; border-radius: 3px; font-size: 14px;
  -moz-appearance: textfield;
}
.ratio-input::-webkit-inner-spin-button,
.ratio-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.ratio-input[type=text] { -moz-appearance: textfield; }
.ratio-input:focus { border-color: #409eff; outline: none; }
.ratio-input.ratio-locked { background: #f5f7fa; color: #909399; cursor: not-allowed; }
.amount-input {
  width: 150px; height: 30px; text-align: right; padding: 0 8px;
  border: 1px solid #dcdfe6; border-radius: 3px; font-size: 14px; color: #303133;
  background: #f5f7fa; cursor: default;
}
.ratio-unit {
  margin-left: 4px; font-size: 14px; color: #606266;
}

/* 必填星号 */
.req { color: #FF7673; font-weight: 400; position: relative; top: 2px; }

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
.split-icon { width: 14px; height: 14px; }

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
  color: #4e5b70; font-weight: 400; font-size: 14px;
}
.add-row-btn { justify-content: center; margin: 0 auto; gap: 6px; }
.add-icon-circle {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; color: #409eff;
  border: 1px solid #409eff;
}
.op-icon { color: #409eff; }
.op-icon:hover { background: #ecf5ff; }
.add-row-tr td { border-bottom: none !important; }

/* 合计行 */
.summary-row td {
  background: #fdf6ec; font-size: 14px;
  border-top: 1px solid #ebeef5;
}
.summary-label { color: #4e5b70; font-weight: 400; font-size: 14px; }
.summary-num { color: #e6a23c; font-weight: 400; }
</style>
