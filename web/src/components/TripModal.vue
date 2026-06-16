<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseSelect from './BaseSelect.vue'
import { parseDate, fmtDate } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'
import { useReimbursementStore } from '@/stores/reimbursement'
import type { Trip, TripMode } from '@/types/models'

const store = useReimbursementStore()

const props = defineProps<{
  modelValue: boolean
  mode?: TripMode
  data?: Partial<Trip>
  excludeId?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', data: Omit<Trip, 'id'>): void
}>()

const confirm = useConfirm()

const reimburserId = ref('')
const startCity = ref('')
const endCity = ref('')
const startDate = ref('')
const endDate = ref('')
const description = ref('')

const titleMap: Record<TripMode, string> = {
  add: '补录行程',
  edit: '编辑行程',
  copy: '复制行程'
}

watch(
  () => [props.modelValue, props.data],
  () => {
    if (props.modelValue) {
      reimburserId.value = props.data?.reimburserId || ''
      startCity.value = props.data?.startCity || ''
      endCity.value = props.data?.endCity || ''
      startDate.value = props.data?.startDate || ''
      endDate.value = props.data?.endDate || ''
      description.value = props.data?.description || ''
      nextTick(() => {
        const today = fmtDate(new Date())
        document.querySelector<HTMLInputElement>('.modal-trip-start')?.setAttribute('max', today)
        document.querySelector<HTMLInputElement>('.modal-trip-end')?.setAttribute('max', today)
      })
    }
  },
  { immediate: true }
)

const empOptions = computed(() =>
  store.employees.map(e => ({ id: e.reimburserId, name: `${e.reimburserName}/${e.reimburserNo}` }))
)
const cityOptions = computed(() =>
  store.cities.map(c => ({ id: c.cityNo, name: c.cityName }))
)

function close() { emit('update:modelValue', false) }

const displayRange = computed(() => {
  const s = startDate.value
  const e = endDate.value
  if (!s && !e) return ''
  if (s && e) return `${s} 00:00:00 - ${e} 00:00:00`
  if (s) return `${s} 00:00:00 - ?`
  return `? - ${e} 00:00:00`
})

function onDateRangeClick() {
  const el = document.querySelector<HTMLInputElement>('.modal-trip-start')
  el?.showPicker()
}
function onStartChange() {
  if (startDate.value) {
    nextTick(() => {
      const el = document.querySelector<HTMLInputElement>('.modal-trip-end')
      el?.showPicker()
    })
  }
}
async function onSave() {
  const data: Omit<Trip, 'id'> = {
    reimburserId: reimburserId.value,
    startCity: startCity.value,
    endCity: endCity.value,
    startDate: startDate.value,
    endDate: endDate.value,
    description: description.value.trim()
  }

  if (!data.reimburserId) { await confirm.alert('请选择出行人'); return }
  if (!data.startCity) { await confirm.alert('请选择出发城市'); return }
  if (!data.endCity) { await confirm.alert('请选择到达城市'); return }
  if (!startDate.value) { await confirm.alert('请选择出发日期'); return }
  if (!endDate.value) { await confirm.alert('请选择到达日期'); return }
  if (parseDate(endDate.value)! < parseDate(startDate.value)!) { await confirm.alert('到达日期不可早于出发日期'); return }
  const today = fmtDate(new Date())
  if (endDate.value > today) { await confirm.alert('到达日期不可晚于当前日期'); return }
  if (!data.description) { await confirm.alert('请输入行程说明'); return }

  // 重复校验（由 store 调用方执行），此处仅做提示
  emit('save', data)
  close()
}
</script>

<template>
  <BaseModal :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)"
             :title="titleMap[props.mode || 'add']">
    <div class="alert trip-alert">
      <span class="icon">!</span>
      <span class="text">仅可补录未从申请单带入或未产生费用的行程信息<br />跨天跨城行程填写说明：出发城市-到达城市：武汉-北京；出发日期-到达日期：1号-5号；1号~5号补助按北京匹配；</span>
    </div>

    <div class="modal-form-row">
      <span class="form-label">出行人<span class="req">*</span></span>
      <BaseSelect v-model="reimburserId" :options="empOptions" />
    </div>
    <div class="modal-form-row">
      <span class="form-label">出发城市<span class="req">*</span></span>
      <BaseSelect v-model="startCity" :options="cityOptions" />
    </div>
    <div class="modal-form-row">
      <span class="form-label">到达城市<span class="req">*</span></span>
      <BaseSelect v-model="endCity" :options="cityOptions" />
    </div>
    <div class="modal-form-row">
      <span class="form-label">出发到达日期<span class="req">*</span></span>
      <div class="form-control date-range-control" @click="onDateRangeClick">
        <svg class="clock-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
        </svg>
        <span class="range-text" :class="{ placeholder: !displayRange }">{{ displayRange || '请选择日期时间' }}</span>
        <input type="date" class="modal-trip-start" v-model="startDate" @change="onStartChange" />
        <input type="date" class="modal-trip-end" v-model="endDate" />
      </div>
    </div>
    <div class="modal-form-row">
      <span class="form-label">行程说明<span class="req">*</span></span>
      <div class="form-control textarea" style="max-width: 560px;">
        <textarea rows="3" maxlength="500" v-model="description" placeholder="请输入"></textarea>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-default" @click="close">取消</button>
      <button class="btn btn-primary" @click="onSave">保存</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.trip-alert {
  margin-bottom: 16px;
}
.trip-alert .text {
  color: #303133;
}
.date-range-control {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  background: #fff;
  font-size: 14px;
  position: relative;
}
.date-range-control:hover {
  border-color: #c0c4cc;
}
.clock-icon {
  flex-shrink: 0;
  color: #909399;
}
.range-text {
  flex: 1;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.range-text.placeholder {
  color: #c0c4cc;
}
.modal-trip-start,
.modal-trip-end {
  width: 0;
  min-width: 0;
  padding: 0;
  border: none;
  outline: none;
  font-size: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
}
</style>
