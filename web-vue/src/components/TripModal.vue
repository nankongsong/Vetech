<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseSelect from './BaseSelect.vue'
import { employees, cities } from '@/data/mock'
import { parseDate, fmtDate } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'
import type { Trip, TripMode } from '@/types/models'

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
        const inps = document.querySelectorAll<HTMLInputElement>('.modal-mask input[type="date"]')
        inps.forEach(i => (i.max = today))
      })
    }
  },
  { immediate: true }
)

const empOptions = employees.map(e => ({ id: e.reimburserId, name: `${e.reimburserName}/${e.reimburserNo}` }))
const cityOptions = cities.map(c => ({ id: c.cityNo, name: c.cityName }))

function close() { emit('update:modelValue', false) }

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
    <div class="tip-box">
      <b>提示：</b>仅可补录未从申请单带入或未产生费用的行程信息<br />
      跨天跨城行程填写说明：<br />
      出发城市-到达城市：武汉-北京；出发日期-到达日期：1号-5号；1号~5号补助按到达城市（北京）匹配。
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
      <span class="form-label">出发日期<span class="req">*</span></span>
      <div class="form-control">
        <input type="date" v-model="startDate" />
      </div>
    </div>
    <div class="modal-form-row">
      <span class="form-label">到达日期<span class="req">*</span></span>
      <div class="form-control">
        <input type="date" v-model="endDate" />
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
