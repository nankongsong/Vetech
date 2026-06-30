<script setup lang="ts">
/**
 * 备注信息组件
 * 提供备注文本输入、字数统计、清空功能
 */
import PanelHeader from '@/components/PanelHeader.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { useConfirm } from '@/composables/useConfirm'

const store = useReimbursementStore()
const confirm = useConfirm()

/**
 * 备注输入处理
 * 限制最大1000字符
 */
function onInput(val: string) {
  store.setRemark(val.slice(0, 1000))
}

/**
 * 清空备注：需二次确认防止误操作
 */
async function onClear() {
  const ok = await confirm.confirm({
    type: 'warning',
    title: '提示',
    text: '确认删除？',
  })
  if (ok) store.setRemark('')
}
</script>

<template>
  <!-- 备注信息面板（可折叠） -->
  <section class="panel" :class="{ collapsed: store.ui.collapsed.remark }">
    <PanelHeader @toggle="store.togglePanel('remark')">
      <template #title>备注信息</template>
      <!-- 清空备注按钮（非只读模式显示） -->
      <template #extra>
        <button v-if="!store.ui.readonly" class="btn-text delete-remark-btn" @click.stop="onClear">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12z" fill="#fff" stroke="#409eff" stroke-width="1.5"/>
            <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#fff" stroke="#409eff" stroke-width="1.5"/>
            <path d="M9.5 10v6M12 10v6M14.5 10v6M17 10v6" stroke="#409eff" stroke-width="1" fill="none"/>
          </svg>
          删除备注
        </button>
      </template>
    </PanelHeader>
    <!-- 备注输入区 -->
    <div class="panel-body">
      <textarea
        class="remark-textarea"
        :value="store.remark"
        :disabled="store.ui.readonly"
        @input="onInput(($event.target as HTMLTextAreaElement).value)"
        placeholder="请输入"
        maxlength="1000"
        rows="5"
      />
      <!-- 字数统计提示 -->
      <div class="remark-word-count">剩余{{ 1000 - (store.remark?.length || 0) }}字</div>
    </div>
  </section>
</template>

<style scoped>
/* 备注输入框样式 */
.remark-textarea {
  width: 100%; padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px;
  font-size: 14px; resize: vertical; box-sizing: border-box;
  line-height: 1.6; font-family: inherit;
}
/* 聚焦边框样式 */
.remark-textarea:focus { border-color: #409eff; outline: none; }
/* 字数统计样式 */
.remark-word-count { text-align: right; font-size: 12px; color: #909399; margin-top: 4px; }
/* 删除按钮蓝色 */
.delete-remark-btn { color: #409eff; }
</style>
