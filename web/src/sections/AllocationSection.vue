<script setup lang="ts">
import { computed } from 'vue'
import PanelHeader from '@/components/PanelHeader.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { money } from '@/utils/format'

const store = useReimbursementStore()

const compOptions = computed(() =>
  store.companies.map(c => ({ id: c.reimCompanyId, name: `${c.reimCompanyName}/${c.reimCompanyNo}` }))
)
const projOptions = computed(() =>
  store.projects.map(p => ({ id: p.projectId, name: `${p.projectName}/${p.projectNo}` }))
)

function addRow() { store.addAllocationRow() }

function removeRow(idx: number) {
  const list = [...store.allocation]
  list.splice(idx, 1)
  store.setAllocation(list)
}

function onCompanyChange(idx: number, val: string) {
  const list = [...store.allocation]
  list[idx] = { ...list[idx], company: val }
  store.setAllocation(list)
}

function onProjectChange(idx: number, val: string) {
  const list = [...store.allocation]
  list[idx] = { ...list[idx], project: val }
  store.setAllocation(list)
}

function onRatioInput(idx: number, val: string) {
  const n = Math.min(1, Math.max(0, Number(val) / 100))
  const list = [...store.allocation]
  list[idx] = { ...list[idx], ratio: n, amount: n * store.subsidyTotal }
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
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.allocation }">
    <PanelHeader @toggle="store.togglePanel('allocation')">
      <template #extra>
        <button class="btn-text" @click.stop="addRow">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/>
          </svg>
          新增分摊
        </button>
      </template>
      费用归属及分摊
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
              <input
                type="number"
                class="ratio-input"
                min="0" max="100" step="0.01"
                :value="ratioPercent(a.ratio)"
                @input="onRatioInput(idx, ($event.target as HTMLInputElement).value)"
              />
            </td>
            <td class="right">{{ money(a.amount) }}</td>
            <td class="col-action">
              <span class="op-icon danger" @click="removeRow(idx)" title="删除">
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
              <span v-if="!ratioValid" class="invalid-tip">（比例合计须为100%）</span>
            </td>
            <td class="right"><strong>{{ money(store.allocTotal) }}</strong></td>
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
.text-danger { color: #f56c6c; }
.invalid-tip { font-weight: 400; font-size: 12px; color: #f56c6c; margin-left: 4px; }
.empty-hint { text-align: center; color: #c0c4cc; padding: 24px 0; font-size: 14px; }
</style>
