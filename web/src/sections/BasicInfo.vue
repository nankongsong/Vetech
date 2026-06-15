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
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.basic }">
    <PanelHeader @toggle="store.togglePanel('basic')">
      <template #title>基础信息</template>
    </PanelHeader>
    <div class="panel-body">
      <div class="form-row right-align">
        <div class="form-field col-1">
          <span class="form-label">报销标题</span>
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
      <div class="form-row three-cols right-align">
        <div class="form-field">
          <span class="form-label">报销人</span>
          <BaseSelect v-model="store.basic.reimburser" :options="empOptions" />
        </div>
        <div class="form-field">
          <span class="form-label">报销部门</span>
          <BaseSelect v-model="store.basic.department" :options="deptOptions" />
        </div>
        <div class="form-field">
          <span class="form-label">费用归属公司<span class="req">*</span></span>
          <BaseSelect v-model="store.basic.reimCompany" :options="compOptions" />
        </div>
      </div>
      <div class="form-row three-cols right-align">
        <div class="form-field">
          <span class="form-label">业务类型<span class="req">*</span></span>
          <BusinessTypeSelect v-model="store.basic.businessType" />
        </div>
        <div class="form-field" style="flex: 0;"></div>
        <div class="form-field" style="flex: 0;"></div>
      </div>
      <div class="form-row right-align">
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
.right-align .form-field {
  justify-content: flex-end;
}
.right-align .form-label {
  justify-content: flex-end;
  text-align: right;
  padding-right: 12px;
}
.three-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.form-field.form-field-three {
  width: calc((100% - 20px * 2) / 3);
  flex: 0 0 calc((100% - 20px * 2) / 3);
  min-width: 0;
}
</style>
