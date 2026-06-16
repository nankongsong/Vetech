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
const trip = computed(() => `${startCity.value ? startCity.value.cityName : ''}-${endCity.value ? endCity.value.cityName : ''}`)
const emp = computed(() => store.employees.find(e => e.reimburserId === props.subsidy.reimburserId))

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
             title="补助日历" width="960px">
    <div class="subsidy-layout">
      <!-- ===== 左侧信息面板 ===== -->
      <div class="left-panel">
        <div class="info-row">
          <span class="info-label">出差类型</span>
          <span class="biz-type">{{ props.businessTypeName || '-' }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">出行人</span>
          <span class="info-value">{{ emp ? emp.reimburserName : '-' }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">开始日期</span>
          <input type="text" class="date-display" :value="props.subsidy.startDate" readonly />
        </div>
        <div class="info-row">
          <span class="info-label">结束日期</span>
          <input type="text" class="date-display" :value="props.subsidy.endDate" readonly />
        </div>

        <div class="trip-bar">
          <span class="trip-label">行程天数</span>
          <span>{{ trip }}</span>
          <span class="trip-days"> {{ props.subsidy.days }}天</span>
        </div>

        <div class="summary">
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
          <span class="custom-checkbox" :class="{ checked: allChecked, partial }" @click="toggleAll"></span>
          <span class="select-all-text">全选</span>
        </div>

        <table class="subsidy-table">
          <thead>
            <tr>
              <th class="col-index"></th>
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
              <td class="col-index">
                <span class="custom-checkbox" :class="{ checked: checkAllRow(idx) }" @click="toggleRow(idx)"></span>
              </td>
              <td class="col-date">
                {{ r.date.slice(5) }}<span class="week">星期{{ weekdayCn(r.date) }}</span>
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

    <template #footer>
      <button class="btn btn-default" @click="close">取消</button>
      <button class="btn btn-primary" @click="onSave">保存</button>
    </template>
  </BaseModal>
</template>

<style scoped>
/* ===== 整体两栏布局 ===== */
.subsidy-layout {
  display: flex;
  gap: 0;
  min-height: 300px;
}

/* ===== 左侧面板 ===== */
.left-panel {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid #ebeef5;
  padding-right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
}
.info-label {
  width: 64px;
  flex-shrink: 0;
  font-size: 14px;
  color: #303133;
}
.info-value {
  font-size: 14px;
  color: #303133;
}
.biz-type {
  font-size: 14px;
  color: #FF6600;
}

.date-display {
  width: 140px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #303133;
  background: #fff;
  cursor: default;
  outline: none;
}

/* 蓝色行程条 */
.trip-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #4A90D9;
  color: #fff;
  font-size: 14px;
  padding: 8px 14px;
  border-radius: 6px;
}
.trip-label {
  flex-shrink: 0;
}
.trip-days {
  font-weight: 700;
}

/* 金额汇总 */
.summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
.summary-label {
  color: #303133;
}
.summary-amount {
  color: #303133;
  font-variant-numeric: tabular-nums;
}
.summary-amount.orange {
  color: #FF6600;
}

/* ===== 右侧表格面板 ===== */
.right-table-panel {
  flex: 1;
  padding-left: 20px;
  min-width: 0;
  overflow-x: auto;
}

.select-all-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}
.select-all-text {
  font-size: 14px;
  color: #303133;
  user-select: none;
}

/* ===== 表格 ===== */
.subsidy-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.subsidy-table th {
  text-align: left;
  padding: 6px 8px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  white-space: nowrap;
}
.subsidy-table th .custom-checkbox {
  margin-right: 4px;
  vertical-align: middle;
}
.subsidy-table td {
  padding: 8px 8px;
  color: #303133;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
}
.subsidy-table tbody tr:hover {
  background: #fafafa;
}

.col-index {
  width: 32px;
  text-align: center;
}
.col-date {
  white-space: nowrap;
  min-width: 80px;
}
.col-date .week {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}
.col-city {
  white-space: nowrap;
  min-width: 70px;
}
.col-amt {
  min-width: 120px;
}
.col-amt.disabled {
  opacity: 0.5;
}
.col-amt .std {
  display: block;
  font-size: 12px;
  color: #c0c4cc;
  margin-bottom: 2px;
  white-space: nowrap;
}
.col-amt .amt-input {
  width: 80px;
  height: 28px;
  text-align: right;
  padding: 0 6px;
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
</style>
