<script setup lang="ts">
import { ref, computed } from 'vue'
import PanelHeader from '@/components/PanelHeader.vue'
import SubsidyModal from '@/components/SubsidyModal.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { money } from '@/utils/format'
import type { Subsidy, SubsidyRow } from '@/types/models'

const store = useReimbursementStore()

const modalVisible = ref(false)
const currentSub = ref<Subsidy | null>(null)
const btName = computed(() => {
  const bt = store.businessTypes.find(b => b.businessTypeId === store.basic.businessType)
  return bt ? bt.businessTypeName : ''
})

const reimburserName = computed(() => {
  const emp = store.employees.find(e => e.reimbursementId === store.basic.reimbursement)
  return emp ? emp.reimbursementName : ''
})

function openEdit(s: Subsidy) {
  currentSub.value = s
  modalVisible.value = true
}
function onSave(calendar: SubsidyRow[]) {
  if (currentSub.value) store.updateSubsidyCalendar(currentSub.value.id, calendar)
}
function empLabel(id: string) {
  const e = store.employees.find(x => x.reimbursementId === id)
  return e ? `${e.reimbursementName}/${e.reimbursementNo}` : '-'
}
function cityName(no: string) {
  const c = store.cities.find(x => x.cityNo === no)
  return c ? c.cityName : '-'
}
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.subsidy }">
    <PanelHeader @toggle="store.togglePanel('subsidy')">
      <template #title>
        补助信息<span class="subsidy-sub" v-if="reimburserName">&nbsp;&nbsp;{{ reimburserName }} {{ money(store.subsidyTotal) }}</span>
      </template>
    </PanelHeader>
    <div class="panel-body">
      <div class="alert">
        <span class="icon">!</span>
        <span class="text">1、请根据实际出差日期选择补助2、出差期间当日有用餐安排的请自行核减当日餐补3、出差期间当日有用车的，请自行核减当日交补</span>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th class="col-index">序号</th>
            <th>出行人</th>
            <th>出差日期</th>
            <th>补助天数</th>
            <th>行程</th>
            <th>补助城市</th>
            <th class="right">申请金额</th>
            <th class="right">补助金额</th>
            <th class="col-action">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.subsidies.length === 0">
            <td colspan="9" class="no-data">暂无数据</td>
          </tr>
          <tr v-for="(s, i) in store.subsidies" :key="s.id">
            <td class="col-index">{{ i + 1 }}</td>
            <td>{{ empLabel(s.reimbursementId) }}</td>
            <td>{{ s.startDate }} 至 {{ s.endDate }}</td>
            <td>{{ s.days }}</td>
            <td>{{ cityName(s.startCity) }}-{{ cityName(s.endCity) }}</td>
            <td>{{ cityName(s.subsidyCity) }}</td>
            <td class="right">{{ money(s.applyAmount) }}</td>
            <td class="right">{{ money(s.subsidyAmount) }}</td>
            <td class="col-action">
              <span v-if="!store.ui.readonly" class="op-icon" @click="openEdit(s)" title="编辑">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <SubsidyModal v-if="currentSub" v-model="modalVisible" :subsidy="currentSub" :business-type-name="btName" @save="onSave" />
  </section>
</template>

<style scoped>
.subsidy-sub {
  color: #4e5b70; font-weight: 400; font-size: 14px;
}
</style>
