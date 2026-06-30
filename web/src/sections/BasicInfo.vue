<script setup lang="ts">
// 引入面板头部组件
import PanelHeader from '@/components/PanelHeader.vue'
// 引入基础下拉选择组件
import BaseSelect from '@/components/BaseSelect.vue'
// 引入业务类型下拉选择组件
import BusinessTypeSelect from '@/components/BusinessTypeSelect.vue'
// 引入报销单 Store
import { useReimbursementStore } from '@/stores/reimbursement'
import { computed } from 'vue'

// 获取报销单 Store 实例
const store = useReimbursementStore()

// 从 Store 获取报销人选项列表（用于下拉选择）
const empOptions = computed(() =>
  store.employees.map(e => ({ id: e.reimbursementId, name: e.reimbursementName }))
)

// 从 Store 获取部门选项列表
const deptOptions = computed(() =>
  store.departments.map(d => ({ id: d.reimDepartmentId, name: d.reimDepartmentName }))
)

// 从 Store 获取公司选项列表
const compOptions = computed(() =>
  store.companies.map(c => ({ id: c.reimCompanyId, name: c.reimCompanyName }))
)

// 报销标题输入处理（限制最大500字符）
function onTitle(v: string) { store.setBasic({ title: v.slice(0, 500) }) }

// 出差事由输入处理（限制最大500字符）
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
              placeholder="例：徐年年日常办公差旅报销单"
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
/* 红色星号（必填标记）样式 */
.form-req {
  color: #FF7673;
  font-weight: 400;
}

/* 文本域字段左对齐（而不是居中对齐） */
.right-align .form-field:has(.textarea) {
  align-items: flex-start;
}

/* 文本域的标签增加上边距 */
.right-align .form-field:has(.textarea) .form-label {
  padding-top: 8px;
}

/* 文本域占位符样式 */
.right-align .form-field:has(.textarea) textarea::placeholder {
  font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', sans-serif;
  color: #99939F;
}

/* 右侧布局：表单项使用 flex 横向排列，标签居右 */
.right-align .form-field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 右侧布局：标签样式 */
.right-align .form-label {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  white-space: nowrap;
  color: #4e5b70;
}

/* 右侧布局：表单项与标签之间的间距 */
.right-align .form-control,
.right-align .custom-select-wrapper,
.right-align .business-type-select-wrapper {
  margin-left: 12px;
}

/* 必填字段红色星号的绝对定位：
   - 相对于父元素.has-req定位
   - top: 50% + 3px 配合 transform: translateY(-50%) 实现垂直居中，微调3px补偿视觉偏差
   - left: 90px 将星号定位在标签文字右侧
   - pointer-events: none 防止星号阻挡点击事件 */
.right-align .form-field.has-req .form-req {
  position: absolute;
  top: calc(50% + 3px);
  transform: translateY(-50%);
  left: 90px;
  margin-left: 1px;
  pointer-events: none;
}

/* 必填字段父元素需要设置 relative 作为星号定位参考 */
.right-align .form-field.has-req {
  position: relative;
}

/* 三列布局：均分三等份，列间距20px */
.three-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

/* 三列表单项宽度计算 */
.form-field.form-field-three {
  width: calc((100% - 20px * 2) / 3);
  flex: 0 0 calc((100% - 20px * 2) / 3);
  min-width: 0;
}
</style>
