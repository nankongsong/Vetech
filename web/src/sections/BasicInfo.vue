<script setup lang="ts">
import PanelHeader from '@/components/PanelHeader.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BusinessTypeSelect from '@/components/BusinessTypeSelect.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { computed } from 'vue'

const store = useReimbursementStore()

const empOptions = computed(() =>
  store.employees.map(e => ({ id: e.reimburserId, name: e.reimburserName }))
)
const deptOptions = computed(() =>
  store.departments.map(d => ({ id: d.reimDepartmentId, name: d.reimDepartmentName }))
)
const compOptions = computed(() =>
  store.companies.map(c => ({ id: c.reimCompanyId, name: c.reimCompanyName }))
)

function onTitle(v: string) { store.setBasic({ title: v.slice(0, 500) }) }
function onReason(v: string) { store.setBasic({ reason: v.slice(0, 500) }) }

const selectedBusinessTypeName = computed(() => {
  const bt = store.businessTypes.find(b => b.businessTypeId === store.basic.businessType)
  return bt ? bt.businessTypeName : ''
})
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
              placeholder="徐年年日常办公差旅报销单"
              :value="store.basic.title"
              @input="onTitle(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
      <div class="form-row three-cols">
        <div class="form-field">
          <span class="form-label">报销人<span class="req">*</span></span>
          <BaseSelect v-model="store.basic.reimburser" :options="empOptions" />
        </div>
        <div class="form-field">
          <span class="form-label">报销部门<span class="req">*</span></span>
          <BaseSelect v-model="store.basic.department" :options="deptOptions" />
        </div>
        <div class="form-field">
          <span class="form-label">费用归属公司<span class="req">*</span></span>
          <BaseSelect v-model="store.basic.reimCompany" :options="compOptions" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-field col-1">
          <span class="form-label">业务类型<span class="req">*</span></span>
          <div class="form-control business-type-input">
            <input
              type="text"
              :value="selectedBusinessTypeName"
              readonly
              style="background: #fff; cursor: default;"
            />
            <span class="business-type-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field col-1">
          <span class="form-label">出差事由</span>
          <div class="form-control textarea">
            <textarea
              rows="3"
              placeholder="请输入"
              :value="store.basic.reason"
              @input="onReason(($event.target as HTMLTextAreaElement).value)"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.three-cols .form-field { flex: 1; min-width: 0; }
.business-type-input {
  display: flex;
  align-items: center;
}
.business-type-input input {
  flex: 1;
}
.business-type-icon {
  position: absolute;
  right: 10px;
  color: #409eff;
  cursor: pointer;
}
</style>
