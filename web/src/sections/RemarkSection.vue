<script setup lang="ts">
import PanelHeader from '@/components/PanelHeader.vue'
import { useReimbursementStore } from '@/stores/reimbursement'

const store = useReimbursementStore()

function onInput(val: string) {
  store.setRemark(val.slice(0, 1000))
}
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.remark }">
    <PanelHeader @toggle="store.togglePanel('remark')">备注</PanelHeader>
    <div class="panel-body">
      <textarea
        class="remark-textarea"
        :value="store.remark"
        @input="onInput(($event.target as HTMLTextAreaElement).value)"
        placeholder="请输入备注信息（不超过1000字）"
        maxlength="1000"
        rows="4"
      />
      <div class="remark-count">{{ store.remark.length }}/1000</div>
    </div>
  </section>
</template>

<style scoped>
.remark-textarea {
  width: 100%; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px;
  font-size: 14px; resize: vertical; box-sizing: border-box;
  line-height: 1.6; font-family: inherit;
}
.remark-textarea:focus { border-color: #409eff; outline: none; }
.remark-count { text-align: right; color: #c0c4cc; font-size: 12px; margin-top: 4px; }
</style>
