<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import BaseModal from './BaseModal.vue'
import { employees, cities } from '@/data/mock'
import { money, weekdayCn } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'
import type { Subsidy, SubsidyRow } from '@/types/models'

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

const startCity = cities.find(c => c.cityNo === props.subsidy.startCity)
const endCity = cities.find(c => c.cityNo === props.subsidy.endCity)
const trip = `${startCity ? startCity.cityName : ''}-${endCity ? endCity.cityName : ''}`
const emp = employees.find(e => e.reimburserId === props.subsidy.reimburserId)

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
             title="补助信息" large>
    <div class="calendar-info">
      <div class="row"><span class="lbl">出差类型：</span><span class="val">{{ props.businessTypeName || '-' }}</span></div>
      <div class="row"><span class="lbl">行程：</span><span class="val">{{ trip }}</span></div>
      <div class="row"><span class="lbl">开始日期：</span><span class="val">{{ props.subsidy.startDate }}</span></div>
      <div class="row"><span class="lbl">结束日期：</span><span class="val">{{ props.subsidy.endDate }}</span></div>
      <div class="row"><span class="lbl">天数：</span><span class="val">{{ calendar.length }} 天</span></div>
      <div class="row"><span class="lbl">出行人：</span><span class="val">{{ emp ? emp.reimburserName + '/' + emp.reimburserNo : '-' }}</span></div>
      <div class="row"><span class="lbl">标准总额：</span><span class="val hot">CNY {{ money(sumStd()) }}</span></div>
      <div class="row"><span class="lbl">补助金额：</span><span class="val hot">CNY {{ money(sumActual()) }}</span></div>
    </div>

    <table class="table calendar-table">
      <thead>
        <tr>
          <th class="col-index">
            <span class="checkbox" :class="{ checked: allChecked, partial }" @click="toggleAll"></span>
          </th>
          <th>出差日期</th>
          <th>
            <span class="checkbox"
                  :class="{ checked: checkAllColumn('meal'), partial: !checkAllColumn('meal') && calendar.some(r => r.meal.checked) }"
                  @click="toggleCol('meal')"></span>
            餐费补助
          </th>
          <th>
            <span class="checkbox"
                  :class="{ checked: checkAllColumn('traffic'), partial: !checkAllColumn('traffic') && calendar.some(r => r.traffic.checked) }"
                  @click="toggleCol('traffic')"></span>
            交通补助
          </th>
          <th>
            <span class="checkbox"
                  :class="{ checked: checkAllColumn('comm'), partial: !checkAllColumn('comm') && calendar.some(r => r.comm.checked) }"
                  @click="toggleCol('comm')"></span>
            通讯补助
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, idx) in calendar" :key="r.date">
          <td class="checkbox-cell">
            <span class="checkbox" :class="{ checked: checkAllRow(idx) }" @click="toggleRow(idx)"></span>
          </td>
          <td class="date-cell">
            {{ r.date.slice(5) }}<span class="week">星期{{ weekdayCn(r.date) }}</span>
          </td>
          <td class="amount-cell" :class="{ disabled: !r.meal.checked }">
            <span class="std">标准 {{ money(r.meal.std) }}</span>
            <input class="input" type="number" min="0" :max="r.meal.std" step="0.01"
                   :value="r.meal.value" :disabled="!r.meal.checked"
                   @input="onAmountInput(idx, 'meal', ($event.target as HTMLInputElement).value)" />
          </td>
          <td class="amount-cell" :class="{ disabled: !r.traffic.checked }">
            <span class="std">标准 {{ money(r.traffic.std) }}</span>
            <input class="input" type="number" min="0" :max="r.traffic.std" step="0.01"
                   :value="r.traffic.value" :disabled="!r.traffic.checked"
                   @input="onAmountInput(idx, 'traffic', ($event.target as HTMLInputElement).value)" />
          </td>
          <td class="amount-cell" :class="{ disabled: !r.comm.checked }">
            <span class="std">标准 {{ money(r.comm.std) }}</span>
            <input class="input" type="number" min="0" :max="r.comm.std" step="0.01"
                   :value="r.comm.value" :disabled="!r.comm.checked"
                   @input="onAmountInput(idx, 'comm', ($event.target as HTMLInputElement).value)" />
          </td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <button class="btn btn-default" @click="close">取消</button>
      <button class="btn btn-primary" @click="onSave">保存</button>
    </template>
  </BaseModal>
</template>
