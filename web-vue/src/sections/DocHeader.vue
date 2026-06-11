<script setup lang="ts">
import { useReimbursementStore } from '@/stores/reimbursement'
const store = useReimbursementStore()
</script>

<template>
  <header class="doc-header">
    <h1 class="doc-title">{{ store.meta.title }}</h1>
    <div class="doc-date">提交日期 <span>{{ store.meta.submitDate }}</span></div>
  </header>
</template>
