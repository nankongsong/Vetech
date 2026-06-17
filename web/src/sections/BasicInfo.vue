<script setup lang="ts">
import PanelHeader from '@/components/PanelHeader.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BusinessTypeSelect from '@/components/BusinessTypeSelect.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { computed } from 'vue'

const store = useReimbursementStore()

const empOptions = computed(() =>
  store.employees.map(e => ({ id: e.reimbursementId, name: e.reimbursementName }))
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
              :disabled="store.ui.readonly"
              @input="onTitle(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
      <div class="form-row three-cols right-align">
        <div class="form-field">
          <span class="form-label">报销人</span>
          <BaseSelect v-model="store.basic.reimbursement" :options="empOptions" :disabled="store.ui.readonly" />
        </div>
        <div class="form-field">
          <span class="form-label">报销部门</span>
          <BaseSelect v-model="store.basic.department" :options="deptOptions" :disabled="store.ui.readonly" />
        </div>
      <div class="form-field has-req">
          <span class="form-label">费用归属公司</span><span class="form-req">*</span>
          <BaseSelect v-model="store.basic.reimCompany" :options="compOptions" :disabled="store.ui.readonly" />
        </div>
      </div>
      <div class="form-row three-cols right-align">
        <div class="form-field has-req">
          <span class="form-label">业务类型</span><span class="form-req">*</span>
          <BusinessTypeSelect v-model="store.basic.businessType" :disabled="store.ui.readonly" />
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
              :disabled="store.ui.readonly"
              @input="onReason(($event.target as HTMLTextAreaElement).value)"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.form-req {
  color: #FF7673;
  font-weight: 400;
}
.right-align .form-field:has(.textarea) {
  align-items: flex-start;
}
.right-align .form-field:has(.textarea) .form-label {
  padding-top: 8px;
}
.right-align .form-field:has(.textarea) textarea::placeholder {
  font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', sans-serif;
  color: #99939F;
}
.right-align .form-field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.right-align .form-label {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  white-space: nowrap;
  color: #4e5b70;
}
.right-align .form-control,
.right-align .custom-select-wrapper,
.right-align .business-type-select-wrapper {
  margin-left: 12px;
}
.right-align .form-field.has-req .form-req {
  position: absolute;
  top: calc(50% + 3px);
  transform: translateY(-50%);
  left: 90px;
  margin-left: 1px;
  pointer-events: none;
}
.right-align .form-field.has-req {
  position: relative;
}
.three-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.form-field.form-field-three {
  width: calc((100% - 20px * 2) / 3);
  flex: 0 0 calc((100% - 20px * 2) / 3);
  min-width: 0;
}
</style>
