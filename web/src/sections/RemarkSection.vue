<script setup lang="ts">
import PanelHeader from '@/components/PanelHeader.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { useConfirm } from '@/composables/useConfirm'

const store = useReimbursementStore()
const confirm = useConfirm()

function onInput(val: string) {
  store.setRemark(val.slice(0, 1000))
}

/** 清空备注：需二次确认 */
async function onClear() {
  if (!store.remark) return
  const ok = await confirm.confirm({
    type: 'warning',
    title: '确认清空',
    text: '确定要清空备注内容吗？此操作不可撤销。',
  })
  if (ok) store.setRemark('')
}
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.remark }">
    <PanelHeader @toggle="store.togglePanel('remark')">
      <template #title>备注信息</template>
      <template #extra>
        <button v-if="store.remark" class="btn-text delete-remark-btn" @click.stop="onClear">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          删除备注
        </button>
      </template>
    </PanelHeader>
    <div class="panel-body">
      <textarea
        class="remark-textarea"
        :value="store.remark"
        @input="onInput(($event.target as HTMLTextAreaElement).value)"
        placeholder="请输入"
        maxlength="1000"
        rows="5"
      />
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
.delete-remark-btn { color: #409eff; }
</style>
