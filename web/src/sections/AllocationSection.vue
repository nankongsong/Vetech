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
  if (idx === 0) return // 第一行不可删除
  const ok = await confirm.confirm({ type: 'warning', title: '确认删除', text: '确定要删除该分摊行吗？' })
  if (!ok) return
  const list = [...store.allocation]
  list.splice(idx, 1)
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
 */
function onRatioInput(idx: number, rawPercent: string) {
  if (idx === 0) return // 第一行比例自动计算，不可手动编辑
  const pct = Math.min(100, Math.max(0, Number(rawPercent) || 0))
  const list = store.allocation.map(a => ({ ...a }))

  // 更新当前行
  list[idx].ratio = pct / 100

  // 计算其他行（除第0行外）的比例之和
  let otherSum = 0
  list.forEach((a, i) => {
    if (i !== 0) otherSum += a.ratio
  })

  // 第一行比例 = 1 - 其余行之和（不小于0）
  list[0].ratio = Math.max(0, 1 - otherSum)

  // 同步每行金额
  const total = store.subsidyTotal
  list.forEach(a => { a.amount = a.ratio * total })

  store.setAllocation(list)
}

/** 均摊：总额平均分配给所有行，误差放首行 */
function onEqualSplit() {
  const n = store.allocation.length
  if (n <= 1) return

  const total = store.subsidyTotal
  const evenRatio = 1 / n
  // 每份基础比例（保留4位精度，再截断到2位）
  const baseRatio = Math.floor(evenRatio * 10000) / 10000

  const list = store.allocation.map((a, i) => {
    if (i === 0) {
      // 首行吸收误差
      const otherSum = (n - 1) * baseRatio
      const firstRatio = Math.max(0, 1 - otherSum)
      return { ...a, ratio: firstRatio, amount: firstRatio * total }
    }
    return { ...a, ratio: baseRatio, amount: baseRatio * total }
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
        <button class="btn-text" @click.stop="addRow">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/>
          </svg>
          新增分摊
        </button>
        <button
          v-if="store.allocation.length > 1"
          class="btn-text"
          @click.stop="onEqualSplit"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
          </svg>
          均摊
        </button>
      </template>
    </PanelHeader>
    <div class="panel-body">
      <table v-if="store.allocation.length > 0" class="table">
        <thead>
          <tr>
            <th class="col-index">序号</th>
            <th>费用归属公司</th>
            <th>项目</th>
            <th class="right">分摊比例(%)</th>
            <th class="right">分摊金额</th>
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
                :disabled="idx === 0"
                @update:model-value="(v: string) => onCompanyChange(idx, v)"
              />
            </td>
            <td>
              <BaseSelect
                :model-value="a.project"
                :options="projOptions"
                placeholder="请选择项目"
                :disabled="idx === 0"
                @update:model-value="(v: string) => onProjectChange(idx, v)"
              />
            </td>
            <td class="right">
              <input
                type="number"
                class="ratio-input"
                min="0" max="100" step="0.01"
                :value="ratioPercent(a.ratio)"
                :disabled="idx === 0"
                :class="{ 'ratio-locked': idx === 0 }"
                @input="onRatioInput(idx, ($event.target as HTMLInputElement).value)"
              />
            </td>
            <td class="right">{{ money(a.amount) }}</td>
            <td class="col-action">
              <span
                v-if="idx !== 0"
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
          <tr>
            <td colspan="3" class="right"><strong>合计</strong></td>
            <td class="right" :class="{ 'text-danger': !ratioValid }">
              <strong>{{ ratioSumPercent }}%</strong>
              <span v-if="!ratioValid" class="invalid-hint">（比例合计须为100%）</span>
            </td>
            <td class="right" :class="{ 'text-danger': !allocMatchSubsidy }">
              <strong>{{ money(store.allocTotal) }}</strong>
              <span v-if="!allocMatchSubsidy" class="invalid-hint">（须等于补助总金额）</span>
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
.ratio-input {
  width: 80px; height: 30px; text-align: right; padding: 0 6px;
  border: 1px solid #dcdfe6; border-radius: 3px; font-size: 14px;
}
.ratio-input:focus { border-color: #409eff; outline: none; }
.ratio-input.ratio-locked { background: #f5f7fa; color: #909399; cursor: not-allowed; }
.text-danger { color: #f56c6c; }
.invalid-hint { font-weight: 400; font-size: 12px; color: #f56c6c; margin-left: 4px; }
.empty-hint { text-align: center; color: #c0c4cc; padding: 24px 0; font-size: 14px; }
</style>
