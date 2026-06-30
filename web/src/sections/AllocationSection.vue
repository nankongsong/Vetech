<script setup lang="ts">
/**
 * 费用归属及分摊组件
 * 管理补助金额在公司和项目间的分摊比例和金额
 * 规则：第一行比例自动计算（1 - sum(row2+)），第2+行可手动输入
 */
import { computed, ref } from 'vue'
import PanelHeader from '@/components/PanelHeader.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { money } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'

const store = useReimbursementStore()
const confirm = useConfirm()

/** 正在编辑的比例原始值（commit 前允许清空和重新输入） */
const editingRatios = ref<Record<number, string>>({})

/**
 * 将比例值（0-1）转换为百分比字符串（保留2位小数）
 */
function ratioPercent(ratio: number): string {
  return (ratio * 100).toFixed(2)
}

/**
 * 第 2+ 行输入时，仅记录原始值，不立即提交
 */
function onRatioInput(idx: number, raw: string) {
  if (idx === 0) return
  editingRatios.value[idx] = raw
}

/**
 * 失去焦点或按 Enter 时提交，重算首行比例和金额
 */
function commitRatio(idx: number) {
  if (idx === 0) return
  const raw = editingRatios.value[idx]
  delete editingRatios.value[idx]
  if (raw === undefined) return

  const inputVal = raw === '' ? 0 : Number(raw)
  if (isNaN(inputVal)) return

  // 将百分比转换为比例（0-1范围）
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

  // 同步每行金额 = 比例 × 补助总金额
  const total = store.subsidyTotal
  list.forEach(a => { a.amount = Math.round(a.ratio * total * 100) / 100 })

  store.setAllocation(list)
}

// 公司选项（下拉选择）
const compOptions = computed(() =>
  store.companies.map(c => ({ id: c.reimCompanyId, name: `${c.reimCompanyName}/${c.reimCompanyNo}` }))
)
// 项目选项（下拉选择）
const projOptions = computed(() =>
  store.projects.map(p => ({ id: p.projectId, name: `${p.projectName}/${p.projectNo}` }))
)

/** 新增一行分摊记录 */
function addRow() { store.addAllocationRow() }

/**
 * 删除分摊行（至少保留一行）
 */
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

/** 公司选择变更 */
function onCompanyChange(idx: number, val: string) {
  const list = store.allocation.map((a, i) => (i === idx ? { ...a, company: val } : a))
  store.setAllocation(list)
}

/** 项目选择变更 */
function onProjectChange(idx: number, val: string) {
  const list = store.allocation.map((a, i) => (i === idx ? { ...a, project: val } : a))
  store.setAllocation(list)
}

/**
 * 均摊：总额平均分配给所有行，误差放首行
 */
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

/** 比例合计（百分比） */
const ratioSumPercent = computed(() => {
  const sum = store.allocation.reduce((s, r) => s + Number(r.ratio || 0), 0)
  return (sum * 100).toFixed(2)
})

/** 比例合计是否有效（等于100%） */
const ratioValid = computed(() => {
  const sum = store.allocation.reduce((s, r) => s + Number(r.ratio || 0), 0)
  return Math.abs(sum - 1) < 0.001 || store.allocation.length === 0
})

/** 分摊金额是否与补助总额匹配 */
const allocMatchSubsidy = computed(() => {
  return Math.abs(store.subsidyTotal - store.allocTotal) < 0.01
})
</script>

<template>
  <!-- 费用归属及分摊面板（可折叠） -->
  <section class="panel" :class="{ collapsed: store.ui.collapsed.allocation }">
    <PanelHeader @toggle="store.togglePanel('allocation')">
      <!-- 显示分摊总金额 -->
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
              <!-- 均摊按钮（非只读模式）：hover 显示"均摊"提示 -->
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
          <!-- 分摊行 -->
          <tr v-for="(a, idx) in store.allocation" :key="a.id">
            <td class="col-index">{{ idx + 1 }}</td>
            <!-- 费用归属公司下拉 -->
            <td>
              <BaseSelect
                :model-value="a.company"
                :options="compOptions"
                placeholder="请选择公司"
                icon-type="x"
                :disabled="store.ui.readonly"
                @update:model-value="(v: string) => onCompanyChange(idx, v)"
              />
            </td>
            <!-- 项目下拉 -->
            <td>
              <BaseSelect
                :model-value="a.project"
                :options="projOptions"
                placeholder="请选择项目"
                :disabled="store.ui.readonly"
                @update:model-value="(v: string) => onProjectChange(idx, v)"
              />
            </td>
            <!-- 分摊比例输入（第一行禁用，自动计算） -->
            <td class="right">
              <div class="ratio-cell">
                <div class="ratio-wrapper">
                  <input
                    type="number"
                    class="ratio-input"
                    min="0" max="100" step="0.01"
                    :value="idx in editingRatios ? editingRatios[idx] : ratioPercent(a.ratio)"
                    :disabled="idx === 0 || store.ui.readonly"
                    :class="{ 'ratio-locked': idx === 0 || store.ui.readonly }"
                    @input="onRatioInput(idx, ($event.target as HTMLInputElement).value)"
                    @blur="commitRatio(idx)"
                    @keydown.enter="commitRatio(idx)"
                  />
                  <span class="ratio-unit">%</span>
                </div>
              </div>
            </td>
            <!-- 分摊金额（只读自动计算） -->
            <td class="right">
              <input type="text" class="amount-input" :value="money(a.amount)" readonly />
            </td>
            <!-- 删除按钮（非只读模式） -->
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
          <!-- 添加行按钮（非只读模式） -->
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
          <!-- 合计行 -->
          <tr class="summary-row">
            <td colspan="3"><span class="summary-label">合计</span></td>
            <!-- 比例合计（红色警告如果不为100%） -->
            <td class="right" :class="{ 'text-danger': !ratioValid }">
              <span class="summary-num">{{ ratioSumPercent }}%</span>
            </td>
            <!-- 金额合计（红色警告如果不等于补助总额） -->
            <td class="right" :class="{ 'text-danger': !allocMatchSubsidy }">
              <span class="summary-num">CNY {{ money(store.allocTotal) }}</span>
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <!-- 无数据提示 -->
      <div v-else class="empty-hint">暂无分摊信息，请点击"新增分摊"添加</div>
    </div>
  </section>
</template>

<style scoped>
/* 比例输入单元格：flex 布局右对齐 */
.ratio-cell {
  display: flex; align-items: center; justify-content: flex-end;
}
/* 比例输入包装：相对定位内嵌百分比符号 */
.ratio-wrapper { position: relative; display: inline-flex; align-items: center; }
/* 比例输入框：宽度固定，文字右对齐 */
.ratio-input {
  width: 155px; height: 30px; text-align: right; padding: 0 22px 0 6px;
  border: 1px solid #dcdfe6; border-radius: 3px; font-size: 14px;
  -moz-appearance: textfield;
}
/* 隐藏 number 输入框的上下箭头 */
.ratio-input::-webkit-inner-spin-button,
.ratio-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.ratio-input[type=number] { -moz-appearance: textfield; }
/* 聚焦边框样式 */
.ratio-input:focus { border-color: #409eff; outline: none; }
/* 锁定状态（第一行或只读）：灰色背景 */
.ratio-input.ratio-locked { background: #f5f7fa; color: #909399; cursor: not-allowed; }

/* 金额只读输入框样式 */
.amount-input {
  width: 150px; height: 30px; text-align: right; padding: 0 8px;
  border: 1px solid #dcdfe6; border-radius: 3px; font-size: 14px; color: #303133;
  background: #f5f7fa; cursor: default;
}

/* 百分比符号绝对定位在输入框右侧 */
.ratio-unit {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  font-size: 14px; color: #909399; pointer-events: none;
}

/* 红色星号（必填标记） */
.req { color: #FF7673; font-weight: 400; position: relative; top: 2px; }

/* 删除图标红色悬停 */
.op-icon.danger { color: #f53f3f; }
.op-icon.danger:hover { background: #fef0f0; }

/* 均摊按钮（表头内） */
.equal-split-btn {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: #ecf5ff; color: #409eff; cursor: pointer;
  margin-left: 6px; font-size: 12px; vertical-align: middle;
  transition: background 0.2s, color 0.2s;
}
/* 均摊图标样式 */
.split-icon { width: 14px; height: 14px; }

/* 蓝色悬浮气泡提示 */
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
/* 气泡下方小三角箭头 */
.split-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #409eff;
}
/* hover 时显示气泡 */
.equal-split-btn:hover .split-tooltip {
  opacity: 1;
}

/* 错误提示红色文字 */
.text-danger { color: #f56c6c; }
/* 错误提示样式 */
.invalid-hint { font-weight: 400; font-size: 12px; color: #f56c6c; margin-left: 4px; }
/* 空数据提示 */
.empty-hint { text-align: center; color: #c0c4cc; padding: 24px 0; font-size: 14px; }
/* 分摊副标题 */
.alloc-sub-title {
  color: #4e5b70; font-weight: 400; font-size: 14px;
}
/* 添加行按钮样式 */
.add-row-btn { justify-content: center; margin: 0 auto; gap: 6px; }
/* 添加图标圆形背景 */
.add-icon-circle {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; color: #409eff;
  border: 1px solid #409eff;
}
/* 操作图标蓝色 */
.op-icon { color: #409eff; }
.op-icon:hover { background: #ecf5ff; }
/* 操作列左对齐 */
.col-action { text-align: left !important; }
/* 添加行去掉底部边框 */
.add-row-tr td { border-bottom: none !important; }

/* 合计行样式：淡橙色背景 */
.summary-row td {
  background: #fdf6ec; font-size: 14px;
  border-top: 1px solid #ebeef5;
}
.summary-label { color: #4e5b70; font-weight: 400; font-size: 14px; }
.summary-num { color: #e6a23c; font-weight: 400; }
</style>
