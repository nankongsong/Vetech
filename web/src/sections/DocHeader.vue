<script setup lang="ts">
import { useReimbursementStore } from '@/stores/reimbursement'

const store = useReimbursementStore()
</script>

<template>
  <header class="doc-header">
    <h1 class="doc-title">{{ store.meta.title }}</h1>
    <div class="doc-meta">
      <span class="meta-label">提交日期：</span>
      <span class="meta-value">{{ store.meta.submitDate }}</span>
    </div>
  </header>
</template>

<style scoped>
.doc-header {
  background: #fff; border-bottom: 2px solid #409eff;
  padding: 20px 32px; display: flex; justify-content: space-between; align-items: center;
}
.doc-title {
  font-size: 20px; font-weight: 700; color: #303133; margin: 0;
}
.doc-meta { font-size: 14px; color: #909399; }
.meta-label { margin-right: 4px; }
.meta-value { color: #303133; }
</style>
