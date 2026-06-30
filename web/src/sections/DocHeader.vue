<script setup lang="ts">
/**
 * 单据页面头部组件
 * 展示报销单标题、提单日期
 * - 新增模式：显示当天日期
 * - 编辑模式：显示已保存的提交日期
 */
import { computed } from 'vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { fmtDate } from '@/utils/format'

// mode: 'add' = 新增模式（默认当天）, 'edit' = 编辑模式（显示已保存日期）
const props = defineProps<{
  mode?: 'add' | 'edit'
}>()

// 报销单 Store 实例
const store = useReimbursementStore()

/**
 * 显示日期计算：
 * - 新增模式：返回当天日期（格式化）
 * - 编辑模式：返回 store 中已保存的提交日期
 */
const displayDate = computed(() => {
  if (props.mode === 'edit') return store.meta.submitDate
  return fmtDate(new Date())
})
</script>

<template>
  <!-- 单据头部：左侧占位 + 中间标题 + 右侧提单日期 -->
  <header class="doc-header">
    <div class="doc-header-spacer"></div>
    <!-- 报销单标题（如：XXXX差旅报销单） -->
    <h1 class="doc-title">{{ store.meta.title }}</h1>
    <!-- 提单日期 -->
    <div class="doc-date">
      <span class="date-label">提单日期</span>
      <span class="date-value">{{ displayDate }}</span>
    </div>
  </header>
</template>

<style scoped>
/* 三列 grid 布局实现标题居中 */
.doc-header {
  background: #fff; border-bottom: 1px solid #ebeef5;
  padding: 12px 24px;
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
/* 左侧占位（使标题居中） */
.doc-header-spacer { /* 占位保持标题居中 */ }
/* 标题样式：居中、加粗 */
.doc-title {
  font-size: 20px; font-weight: 700; color: #303133; margin: 0;
  text-align: center;
}
/* 日期区域：右对齐 */
.doc-date {
  font-size: 13px; color: #909399;
  text-align: right; white-space: nowrap;
}
.date-label { margin-right: 4px; }
.date-value { color: #303133; }
</style>
