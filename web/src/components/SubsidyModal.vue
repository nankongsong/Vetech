<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { money, weekdayCn } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'
import { useReimbursementStore } from '@/stores/reimbursement'
import type { Subsidy, SubsidyRow } from '@/types/models'

const store = useReimbursementStore()

const props = defineProps<{
  modelValue: boolean
  subsidy: Subsidy
  businessTypeName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', calendar: SubsidyRow[]): void
}>()

const confirm = useConfirm()

const calendar = ref<SubsidyRow[]>([])

watch(
  () => [props.modelValue, props.subsidy],
  () => {
    if (props.modelValue) {
      calendar.value = JSON.parse(JSON.stringify(props.subsidy.calendar || []))
    }
  },
  { immediate: true }
)

function close() { emit('update:modelValue', false) }

function sumStd() {
  let s = 0
  calendar.value.forEach(r => {
    if (r.meal.checked) s += r.meal.std
    if (r.traffic.checked) s += r.traffic.std
    if (r.comm.checked) s += r.comm.std
  })
  return s
}
function sumActual() {
  let s = 0
  calendar.value.forEach(r => {
    if (r.meal.checked) s += Number(r.meal.value || 0)
    if (r.traffic.checked) s += Number(r.traffic.value || 0)
    if (r.comm.checked) s += Number(r.comm.value || 0)
  })
  return s
}

function checkAllColumn(key: 'meal' | 'traffic' | 'comm') {
  return calendar.value.every(r => r[key].checked)
}
function checkAllRow(idx: number) {
  const r = calendar.value[idx]
  return r.meal.checked && r.traffic.checked && r.comm.checked
}
function anyChecked() {
  return calendar.value.some(r => r.meal.checked || r.traffic.checked || r.comm.checked)
}

function toggleAll() {
  const target = !['meal', 'traffic', 'comm'].every(k => checkAllColumn(k as 'meal' | 'traffic' | 'comm'))
  calendar.value.forEach(r => {
    r.meal.checked = target; r.traffic.checked = target; r.comm.checked = target
    if (target) {
      r.meal.value = r.meal.std
      r.traffic.value = r.traffic.std
      r.comm.value = r.comm.std
    } else {
      r.meal.value = 0; r.traffic.value = 0; r.comm.value = 0
    }
  })
}
function toggleCol(key: 'meal' | 'traffic' | 'comm') {
  const target = !checkAllColumn(key)
  calendar.value.forEach(r => {
    r[key].checked = target
    r[key].value = target ? r[key].std : 0
  })
}
function toggleRow(idx: number) {
  const target = !checkAllRow(idx)
  ;['meal', 'traffic', 'comm'].forEach(k => {
    const kk = k as 'meal' | 'traffic' | 'comm'
    calendar.value[idx][kk].checked = target
    calendar.value[idx][kk].value = target ? calendar.value[idx][kk].std : 0
  })
}

function onAmountInput(idx: number, key: 'meal' | 'traffic' | 'comm', v: string) {
  let n = Number(v || 0)
  if (n < 0) n = 0
  if (n > calendar.value[idx][key].std) n = calendar.value[idx][key].std
  calendar.value[idx][key].value = n
}

const startCity = computed(() => store.cities.find(c => c.cityNo === props.subsidy.startCity))
const endCity = computed(() => store.cities.find(c => c.cityNo === props.subsidy.endCity))
const subsidyCity = computed(() => store.cities.find(c => c.cityNo === props.subsidy.subsidyCity))
const trip = computed(() => `${startCity.value ? startCity.value.cityName : ''} - ${endCity.value ? endCity.value.cityName : ''}`)

const allChecked = ['meal', 'traffic', 'comm'].every(k => checkAllColumn(k as 'meal' | 'traffic' | 'comm'))
const partial = !allChecked && anyChecked()

async function onSave() {
  for (let i = 0; i < calendar.value.length; i++) {
    const r = calendar.value[i]
    if (r.meal.checked && Number(r.meal.value) > r.meal.std) {
      await confirm.alert(`第 ${i + 1} 行 餐费补助金额不能超过标准 ${money(r.meal.std)}`)
      return
    }
    if (r.traffic.checked && Number(r.traffic.value) > r.traffic.std) {
      await confirm.alert(`第 ${i + 1} 行 交通补助金额不能超过标准 ${money(r.traffic.std)}`)
      return
    }
    if (r.comm.checked && Number(r.comm.value) > r.comm.std) {
      await confirm.alert(`第 ${i + 1} 行 通讯补助金额不能超过标准 ${money(r.comm.std)}`)
      return
    }
  }
  emit('save', calendar.value)
  close()
}
</script>

<template>
  <BaseModal :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)"
             title="补助日历" fullscreen>
    <div class="subsidy-layout">
      <!-- ===== 左侧信息面板 ===== -->
      <div class="left-panel">
        <!-- Card 1: 基础信息 -->
        <div class="left-card">
          <div class="card-row">
            <span class="info-label">出差类型</span>
            <span class="biz-type">{{ props.businessTypeName || '-' }}</span>
          </div>
        </div>

        <!-- Card 2: 日期 + 补助日历图标 -->
        <div class="left-card date-card">
          <div class="date-row">
            <span class="date-label">开始日期</span>
            <svg class="cal-icon" viewBox="0 0 28 78" width="18" fill="none">
              <circle cx="14" cy="14" r="14" fill="#0089D2"/>
              <rect x="11" y="28" width="5" height="50" fill="#259BD8"/>
              <circle cx="14" cy="14" r="4" fill="#F9FAFA"/>
            </svg>
            <span class="date-value">{{ props.subsidy.startDate }}</span>
          </div>

          <div class="trip-bar">
            <span>行程天数</span>
            <span class="trip-text">{{ trip }}</span>
            <strong>{{ props.subsidy.days }}天</strong>
          </div>

          <div class="date-row">
            <span class="date-label">结束日期</span>
            <svg class="cal-icon flipped" viewBox="0 0 28 78" width="18" fill="none">
              <circle cx="14" cy="14" r="14" fill="#0089D2"/>
              <rect x="11" y="28" width="5" height="50" fill="#259BD8"/>
              <circle cx="14" cy="14" r="4" fill="#F9FAFA"/>
            </svg>
            <span class="date-value">{{ props.subsidy.endDate }}</span>
          </div>
        </div>

        <!-- Card 3: 金额汇总 -->
        <div class="left-card summary-card">
          <div class="summary-row">
            <span class="summary-label">补助金额</span>
            <span class="summary-amount orange">CNY {{ money(sumActual()) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">标准总额</span>
            <span class="summary-amount">CNY {{ money(sumStd()) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">补助金额</span>
            <span class="summary-amount">CNY {{ money(sumActual()) }}</span>
          </div>
        </div>
      </div>

      <!-- ===== 右侧补助表格 ===== -->
      <div class="right-table-panel">
        <div class="select-all-row">
          <span class="table-title">出差补助</span>
          <span class="custom-checkbox" :class="{ checked: allChecked, partial }" @click="toggleAll"></span>
          <span class="select-all-text">全选</span>
        </div>

        <div class="table-wrapper">
	        <table class="subsidy-table">
          <thead>
            <tr>
              <th class="col-date">出差日期</th>
              <th class="col-city">补助城市</th>
              <th class="col-amt">
                <span class="custom-checkbox"
                      :class="{ checked: checkAllColumn('meal'), partial: !checkAllColumn('meal') && calendar.some(r => r.meal.checked) }"
                      @click="toggleCol('meal')"></span>
                餐费补助
              </th>
              <th class="col-amt">
                <span class="custom-checkbox"
                      :class="{ checked: checkAllColumn('traffic'), partial: !checkAllColumn('traffic') && calendar.some(r => r.traffic.checked) }"
                      @click="toggleCol('traffic')"></span>
                交通补助
              </th>
              <th class="col-amt">
                <span class="custom-checkbox"
                      :class="{ checked: checkAllColumn('comm'), partial: !checkAllColumn('comm') && calendar.some(r => r.comm.checked) }"
                      @click="toggleCol('comm')"></span>
                通讯补助
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in calendar" :key="r.date">
              <td class="col-date">
                <div class="date-cell-content">
                  <span class="custom-checkbox" :class="{ checked: checkAllRow(idx) }" @click="toggleRow(idx)"></span>
                  <span>{{ r.date.slice(5) }} 星期{{ weekdayCn(r.date) }}</span>
                </div>
              </td>
              <td class="col-city">{{ subsidyCity ? subsidyCity.cityName : '-' }}</td>
              <td class="col-amt" :class="{ disabled: !r.meal.checked }">
                <span class="std">标准 {{ money(r.meal.std) }}</span>
                <input class="amt-input" type="number" min="0" :max="r.meal.std" step="0.01"
                       :value="r.meal.value" :disabled="!r.meal.checked"
                       @input="onAmountInput(idx, 'meal', ($event.target as HTMLInputElement).value)" />
              </td>
              <td class="col-amt" :class="{ disabled: !r.traffic.checked }">
                <span class="std">标准 {{ money(r.traffic.std) }}</span>
                <input class="amt-input" type="number" min="0" :max="r.traffic.std" step="0.01"
                       :value="r.traffic.value" :disabled="!r.traffic.checked"
                       @input="onAmountInput(idx, 'traffic', ($event.target as HTMLInputElement).value)" />
              </td>
              <td class="col-amt" :class="{ disabled: !r.comm.checked }">
                <span class="std">标准 {{ money(r.comm.std) }}</span>
                <input class="amt-input" type="number" min="0" :max="r.comm.std" step="0.01"
                       :value="r.comm.value" :disabled="!r.comm.checked"
                       @input="onAmountInput(idx, 'comm', ($event.target as HTMLInputElement).value)" />
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-default" @click="close">取消</button>
      <button class="btn btn-primary" @click="onSave">确定</button>
    </template>
  </BaseModal>
</template>

<style scoped>
/* ===== 整体两栏布局 ===== */
.subsidy-layout {
  display: flex;
  gap: 0;
  height: 100%;
  padding-left: 24px;
  --border-color: #e8e8e8;
  --border-width: 1px;
}
/* ===== 左侧面板 ===== */
.left-panel {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 卡片化分区 */
.left-card {
  border-radius: 6px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-row {
  display: flex;
  align-items: center;
}

.info-label {
  width: 64px;
  flex-shrink: 0;
  font-size: 15px;
  color: #666;
}
.info-value {
  font-size: 14px;
  color: #333;
}
.biz-type {
  font-size: 15px;
  color: #E6A23C;
  margin-left: 17px;
}

/* ===== 日期卡片 ===== */
.date-card {
  padding: 12px 16px;
  margin-top: -8px;
  background: #fff;
  border: var(--border-width) solid var(--border-color);
  border-radius: 0;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-label {
  font-size: 14px;
  color: #666;
  width: 64px;
  flex-shrink: 0;
}

.cal-icon {
  flex-shrink: 0;
  display: block;
}
.cal-icon.flipped {
  transform: scaleY(-1);
}

.date-value {
  font-size: 14px;
  color: #333;
  margin-left: 16px;
}

/* 蓝色行程条 */
.trip-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: lch(60.99% 40.66 258.29);
  color: #fff;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 0;
  margin: 10px 0;
}
.trip-bar strong {
  font-weight: 400;
  font-size: 14px;
  margin-left: 60px;
}
.trip-text {
  margin-left: 5px;
}

/* ===== 金额汇总 ===== */
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 2px 0;
}
.summary-label {
  color: #333;
}
.summary-amount {
  color: #999;
  font-variant-numeric: tabular-nums;
}
.summary-amount.orange {
  color: #E6A23C;
}
.summary-card {
  border: var(--border-width) solid var(--border-color);
  border-radius: 0;
  flex: 0.95;
  margin-top: 24px;
}

/* ===== 右侧表格面板 ===== */
.right-table-panel {
  flex: 1;
  padding-left: 14px;
  min-width: 0;
}
.table-wrapper {
  border: var(--border-width) solid var(--border-color);
}

.select-all-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: 12px;
  padding: 14px 0 8px 0;
}
.table-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-right: auto;
}
.select-all-text {
  font-size: 14px;
  color: #000000;
  user-select: none;
}

/* ===== 表格 ===== */
.subsidy-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.subsidy-table th {
  text-align: center;
  padding: 8px 6px;
  font-weight: 600;
  color: #333;
  border-bottom: var(--border-width) solid var(--border-color);
  border-right: var(--border-width) solid var(--border-color);
  white-space: nowrap;
  background: #fafafa;
}
.subsidy-table th:last-child,
.subsidy-table td:last-child {
  border-right: none;
}
.subsidy-table th .custom-checkbox {
  margin-right: 4px;
  vertical-align: middle;
}
.subsidy-table td {
  padding: 10px 8px;
  color: #333;
  border-bottom: var(--border-width) solid var(--border-color);
  border-right: var(--border-width) solid var(--border-color);
  vertical-align: middle;
  text-align: center;
}
.subsidy-table tbody tr:hover {
  background: #f5f7fa;
}

.col-date {
  white-space: nowrap;
  min-width: 120px;
}
.date-cell-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.col-city {
  white-space: nowrap;
  min-width: 80px;
}
.col-amt {
  min-width: 130px;
}
.col-amt.disabled {
  opacity: 0.45;
}
.col-amt .std {
  display: block;
  font-size: 12px;
  color: #c0c4cc;
  margin-bottom: 3px;
  white-space: nowrap;
}
.col-amt .amt-input {
  width: 88px;
  height: 30px;
  text-align: right;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.col-amt .amt-input:focus {
  border-color: #409eff;
}
.col-amt.disabled .amt-input {
  background: #f5f7fa;
  color: #c0c4cc;
}

/* ===== 自定义复选框 ===== */
.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1.5px solid #c0c4cc;
  border-radius: 3px;
  cursor: pointer;
  flex-shrink: 0;
  background: #fff;
  transition: background 0.15s, border-color 0.15s;
}
.custom-checkbox:hover {
  border-color: #409eff;
}
.custom-checkbox.checked {
  background: #409eff;
  border-color: #409eff;
}
.custom-checkbox.checked::after {
  content: '';
  display: block;
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -2px;
}
.custom-checkbox.partial {
  background: #fff;
  border-color: #409eff;
}
.custom-checkbox.partial::after {
  content: '';
  display: block;
  width: 8px;
  height: 2px;
  background: #409eff;
  border: none;
  transform: none;
  margin-top: 0;
}

:deep(.modal-title) {
  font-weight: 400;
}
</style>
