<script setup lang="ts">
import { watch, nextTick } from 'vue'
import PanelHeader from '@/components/PanelHeader.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { money, percent } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'

const store = useReimbursementStore()
const confirm = useConfirm()

/** 重算每行 amount 与第一行 ratio */
function recompute() {
  const total = store.subsidyTotal
  const list = store.allocation
  list.forEach((row, i) => {
    if (i === 0) {
      const rest = list.slice(1).reduce((s, r) => s + Number(r.ratio || 0), 0)
      let ratio = Math.max(0, Math.min(1, 1 - rest))
      ratio = Math.round(ratio * 100) / 100
      row.ratio = ratio
    }
    row.amount = Math.round(total * Number(row.ratio || 0) * 100) / 100
  })
}

watch(
  () => [store.subsidyTotal, store.allocation.map(r => r.ratio).join(',')],
  () => {
    recompute()
  },
  { deep: true }
)

// 初次重算
recompute()

function onAdd() {
  store.addAllocationRow()
  nextTick(recompute)
}

async function onDel(idx: number) {
  if (store.allocation.length === 1) {
    await confirm.alert('至少保留一条分摊信息')
    return
  }
  const ok = await confirm.confirm({ type: 'warning', title: '确认删除', text: '确定要删除该分摊信息吗？' })
  if (ok) {
    store.allocation.splice(idx, 1)
    nextTick(recompute)
  }
}

function onRatioInput(idx: number, v: string) {
  if (idx === 0) return
  let n = Number(v || 0)
  if (n < 0) n = 0
  if (n > 100) n = 100
  const list = store.allocation
  list[idx].ratio = n / 100
  // 校验总和
  const rest = list.slice(1).reduce((s, r, i) => {
    if (i === idx - 1) return s
    return s + Number(r.ratio || 0)
  }, 0)
  if (rest + n / 100 > 1) {
    list[idx].ratio = 0
  }
  nextTick(recompute)
}

function average() {
  const list = store.allocation
  if (list.length === 0) return
  const avg = 1 / list.length
  const base = Math.floor(avg * 10000) / 10000
  const remainder = Math.round((1 - base * list.length) * 100) / 100
  list.forEach((r, i) => {
    r.ratio = i === 0 ? Math.round((base + remainder) * 100) / 100 : base
  })
  nextTick(recompute)
}
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.allocation }">
    <PanelHeader @toggle="store.togglePanel('allocation')">
      <template #title>
        费用归属及分摊<span class="title-tip">（分摊金额: {{ money(store.allocTotal) }}）</span>
      </template>
      <template #extra>
        <button class="btn-text" @click.stop="average" style="margin-right: 8px;">均摊</button>
      </template>
    </PanelHeader>
    <div class="panel-body">
      <table class="table">
        <thead>
          <tr>
            <th class="col-index">序号</th>
            <th>费用归属<span class="req">*</span></th>
            <th>项目</th>
            <th class="right">分摊比例<span class="req">*</span></th>
            <th class="right">分摊金额</th>
            <th class="col-action">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in store.allocation" :key="row.id">
            <td class="col-index">{{ i + 1 }}</td>
            <td>{{ row.company || '' }}</td>
            <td>{{ row.project || '-' }}</td>
            <td class="right">
              <div class="form-control" :style="{ display: 'inline-flex', minWidth: '110px', background: i === 0 ? '#f5f7fa' : '' }">
                <input type="number" min="0" max="100" step="0.01" :value="(row.ratio * 100).toFixed(2)" :readonly="i === 0"
                       @input="onRatioInput(i, ($event.target as HTMLInputElement).value)" />
                <span class="arrow">%</span>
              </div>
            </td>
            <td class="right">
              <div class="form-control" :style="{ display: 'inline-flex', minWidth: '110px', background: i === 0 ? '#f5f7fa' : '' }">
                <input type="number" min="0" step="0.01" :value="money(row.amount)" readonly />
              </div>
            </td>
            <td class="col-action">
              <span class="op-icon danger" @click="onDel(i)" title="删除">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </span>
            </td>
          </tr>
          <tr class="summary-row">
            <td colspan="3" class="right">合计</td>
            <td class="right">{{ percent(store.allocation.reduce((s, r) => s + Number(r.ratio || 0), 0)) }}</td>
            <td class="right">CNY {{ money(store.allocTotal) }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <button class="btn-link-add" @click="onAdd">
        <span style="color: #1d6fd8;">+ 添加一行</span>
      </button>
    </div>
  </section>
</template>
