<script setup lang="ts">
import PanelHeader from '@/components/PanelHeader.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BusinessTypeSelect from '@/components/BusinessTypeSelect.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { computed } from 'vue'

const store = useReimbursementStore()

const empOptions = computed(() =>
  store.employees.map(e => ({ id: e.reimburserId, name: `${e.reimburserName}/${e.reimburserNo}` }))
)
const deptOptions = computed(() =>
  store.departments.map(d => ({ id: d.reimDepartmentId, name: `${d.reimDepartmentName}/${d.reimDepartmentNo}` }))
)
const compOptions = computed(() =>
  store.companies.map(c => ({ id: c.reimCompanyId, name: `${c.reimCompanyName}/${c.reimCompanyNo}` }))
)

function onTitle(v: string) { store.setBasic({ title: v.slice(0, 500) }) }
function onReason(v: string) { store.setBasic({ reason: v.slice(0, 500) }) }
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.basic }">
    <PanelHeader @toggle="store.togglePanel('basic')">
      <template #title>基础信息</template>
    </PanelHeader>
    <div class="panel-body">
      <div class="form-row">
        <div class="form-field col-1">
          <span class="form-label">报销标题<span class="req">*</span></span>
          <div class="form-control">
            <input
              type="text"
              placeholder="请输入报销标题（最多500字）"
              :value="store.basic.title"
              @input="onTitle(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <span class="form-label">报销人<span class="req">*</span></span>
          <BaseSelect v-model="store.basic.reimburser" :options="empOptions" />
        </div>
        <div class="form-field">
          <span class="form-label">报销部门<span class="req">*</span></span>
          <BaseSelect v-model="store.basic.department" :options="deptOptions" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <span class="form-label">费用归属公司<span class="req">*</span></span>
          <BaseSelect v-model="store.basic.reimCompany" :options="compOptions" />
        </div>
        <div class="form-field">
          <span class="form-label">
            业务类型<span class="req">*</span>
          </span>
          <BusinessTypeSelect v-model="store.basic.businessType" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-field col-1">
          <span class="form-label">出差事由<span class="req">*</span></span>
          <div class="form-control textarea">
            <textarea
              rows="3"
              placeholder="请输入出差事由（最多500字）"
              :value="store.basic.reason"
              @input="onReason(($event.target as HTMLTextAreaElement).value)"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
