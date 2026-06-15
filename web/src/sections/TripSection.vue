<script setup lang="ts">
import { ref, computed } from 'vue'
import PanelHeader from '@/components/PanelHeader.vue'
import TripModal from '@/components/TripModal.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { parseDate } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'
import type { Trip, TripMode } from '@/types/models'

const store = useReimbursementStore()
const confirm = useConfirm()

const modalVisible = ref(false)
const modalMode = ref<TripMode>('add')
const modalData = ref<Partial<Trip>>({})
const modalExcludeId = ref<string | null>(null)

function openAdd() {
  modalMode.value = 'add'
  modalData.value = { reimburserId: store.basic.reimburser }
  modalExcludeId.value = null
  modalVisible.value = true
}
function openEdit(trip: Trip) {
  modalMode.value = 'edit'
  modalData.value = { ...trip }
  modalExcludeId.value = trip.id
  modalVisible.value = true
}
function openCopy(trip: Trip) {
  modalMode.value = 'copy'
  modalData.value = { ...trip }
  modalExcludeId.value = trip.id
  modalVisible.value = true
}

async function onDelete(trip: Trip) {
  const ok = await confirm.confirm({ type: 'warning', title: '确认删除', text: '确定要删除该行程吗？' })
  if (ok) store.deleteTrip(trip.id)
}

async function onSave(data: Omit<Trip, 'id'>) {
  // 人员+日期范围重复校验
  const conflict = store.trips.find(t => {
    if (t.id === modalExcludeId.value) return false
    if (t.reimburserId !== data.reimburserId) return false
    return !(parseDate(data.endDate)! < parseDate(t.startDate)! || parseDate(data.startDate)! > parseDate(t.endDate)!)
  })
  if (conflict) {
    const emp = store.employees.find(e => e.reimburserId === data.reimburserId)
    await confirm.alert(`出行人 ${emp ? emp.reimburserName : ''} 在 ${conflict.startDate} 至 ${conflict.endDate} 已存在行程，不可重复`)
    return
  }
  if (modalMode.value === 'edit' && modalData.value.id) {
    store.updateTrip(modalData.value.id, data)
  } else {
    store.addTrip(data)
  }
}

const empLabel = computed(() => (id: string) => {
  const e = store.employees.find(x => x.reimburserId === id)
  return e ? `${e.reimburserName}/${e.reimburserNo}` : '-'
})
const cityName = computed(() => (no: string) => {
  const c = store.cities.find(x => x.cityNo === no)
  return c ? c.cityName : '-'
})
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.trip }">
    <PanelHeader @toggle="store.togglePanel('trip')">
      <template #title>补录行程</template>
      <template #extra>
        <button class="btn-text" @click.stop="openAdd">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/>
          </svg>
          补录行程
        </button>
      </template>
    </PanelHeader>
    <div class="panel-body">
      <table class="table">
        <thead>
          <tr>
            <th class="col-index">序号</th>
            <th>出行人员</th>
            <th>出差日期</th>
            <th>行程</th>
            <th>行程说明</th>
            <th class="col-action">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.trips.length === 0">
            <td colspan="6" class="no-data">暂无数据</td>
          </tr>
          <tr v-for="(t, i) in store.trips" :key="t.id">
            <td class="col-index">{{ i + 1 }}</td>
            <td>{{ empLabel(t.reimburserId) }}</td>
            <td class="date-range">{{ t.startDate }} 至 {{ t.endDate }}</td>
            <td>{{ cityName(t.startCity) }}-{{ cityName(t.endCity) }}</td>
            <td>{{ t.description }}</td>
            <td class="col-action">
              <span class="op-icon danger" @click="onDelete(t)" title="删除">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </span>
              <span class="op-icon" @click="openEdit(t)" title="编辑">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </span>
              <span class="op-icon" @click="openCopy(t)" title="复制">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 1H4a2 2 0 00-2 2v14h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z"/></svg>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <TripModal v-model="modalVisible" :mode="modalMode" :data="modalData" :exclude-id="modalExcludeId" @save="onSave" />
  </section>
</template>

<style scoped>
.date-range { white-space: nowrap; }
</style>
