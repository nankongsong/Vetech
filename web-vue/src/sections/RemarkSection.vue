<script setup lang="ts">
import { ref, watch } from 'vue'
import PanelHeader from '@/components/PanelHeader.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { useConfirm } from '@/composables/useConfirm'

const store = useReimbursementStore()
const confirm = useConfirm()

const text = ref('')
watch(() => store.remark, (v) => { text.value = v }, { immediate: true })

function onInput(v: string) {
  text.value = v.slice(0, 1000)
  store.setRemark(text.value)
}

async function onDelete() {
  const ok = await confirm.confirm({ type: 'warning', title: '确认删除', text: '确定要清空备注信息吗？' })
  if (ok) {
    text.value = ''
    store.setRemark('')
  }
}
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.remark }">
    <PanelHeader @toggle="store.togglePanel('remark')">
      <template #extra>
        <button class="btn-text" @click.stop="onDelete">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          删除备注
        </button>
      </template>
    </PanelHeader>
    <div class="panel-body">
      <div class="form-control textarea" style="width: 100%;">
        <textarea rows="4" maxlength="1000" placeholder="请输入" :value="text" @input="onInput(($event.target as HTMLTextAreaElement).value)"></textarea>
      </div>
      <div style="color: var(--color-text-placeholder); font-size: 12px; margin-top: 4px;">
        最多可输入 1000 字，当前 {{ text.length }} 字
      </div>
    </div>
  </section>
</template>
