<script setup lang="ts">
import { computed } from 'vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { fmtDate } from '@/utils/format'

const props = defineProps<{
  /** 'add' = 新增模式（默认当天）, 'edit' = 编辑模式（显示已保存日期） */
  mode?: 'add' | 'edit'
}>()

const store = useReimbursementStore()

/** 显示日期：新增模式用当天，编辑模式用 store 中已有日期 */
const displayDate = computed(() => {
  if (props.mode === 'edit') return store.meta.submitDate
  return fmtDate(new Date())
})
</script>

<template>
  <header class="doc-header">
    <div class="doc-header-spacer"></div>
    <h1 class="doc-title">{{ store.meta.title }}</h1>
    <div class="doc-date">
      <span class="date-label">提单日期</span>
      <span class="date-value">{{ displayDate }}</span>
    </div>
  </header>
</template>

<style scoped>
.doc-header {
  background: #fff; border-bottom: 1px solid #ebeef5;
  padding: 12px 24px;
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.doc-header-spacer { /* 占位保持标题居中 */ }
.doc-title {
  font-size: 18px; font-weight: 600; color: #303133; margin: 0;
  text-align: center;
}
.doc-date {
  font-size: 13px; color: #909399;
  text-align: right; white-space: nowrap;
}
.date-label { margin-right: 4px; }
.date-value { color: #303133; }
</style>
