<script setup lang="ts">
/**
 * 附件区域组件
 * 与后端 reim_attachment 表对齐，支持上传/列表/下载/删除
 */
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PanelHeader from '@/components/PanelHeader.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { fetchAttachments, uploadAttachment, deleteAttachment } from '@/api/service'
import type { AttachmentItem } from '@/api/types'

const props = defineProps<{
  mainId: number | null
}>()

const store = useReimbursementStore()

const attachments = ref<AttachmentItem[]>([])
const loading = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement>()

/** 加载附件列表 */
async function loadList() {
  if (!props.mainId) {
    attachments.value = []
    return
  }
  loading.value = true
  try {
    attachments.value = await fetchAttachments(props.mainId)
  } catch {
    attachments.value = []
  } finally {
    loading.value = false
  }
}

/** 上传文件 */
async function handleUpload(file: File) {
  if (!props.mainId || !file) return
  // 文件名限制
  if (file.name.length > 255) {
    ElMessage.warning('文件名过长，请重命名后上传')
    return
  }
  uploading.value = true
  try {
    await uploadAttachment(props.mainId, file)
    ElMessage.success('上传成功')
    await loadList()
  } catch {
    // 错误已由拦截器处理
  } finally {
    uploading.value = false
  }
}

/** 删除附件 */
async function handleDelete(attachId: number, fileName: string) {
  try {
    await ElMessageBox.confirm(`确定删除附件「${fileName}」？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    if (!props.mainId) return
    await deleteAttachment(props.mainId, attachId)
    ElMessage.success('删除成功')
    await loadList()
  } catch {
    // 取消或错误
  }
}

/** 下载附件 */
function handleDownload(attachId: number) {
  if (!props.mainId) return
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  window.open(`${baseUrl}/reim/${props.mainId}/attachment/${attachId}`, '_blank')
}

/** 文件选择后触发上传 */
function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    handleUpload(file)
  }
  // 重置 input 以便可以重新选择同一文件
  input.value = ''
}

/** 触发文件选择 */
function triggerUpload() {
  fileInput.value?.click()
}

/** 格式化文件大小 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const idx = Math.min(i, units.length - 1)
  return (bytes / Math.pow(k, idx)).toFixed(idx > 0 ? 1 : 0) + ' ' + units[idx]
}

onMounted(loadList)

watch(() => props.mainId, (newVal) => {
  if (newVal) {
    attachments.value = []
    loadList()
  } else {
    attachments.value = []
  }
})
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.attachment }">
    <PanelHeader @toggle="store.togglePanel('attachment')">
      <template #title>附件</template>
      <template #extra>
        <button
          v-if="!store.ui.readonly && mainId"
          class="btn-text"
          :disabled="uploading"
          @click.stop="triggerUpload"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          上传附件
        </button>
        <input
          ref="fileInput"
          type="file"
          style="display:none"
          @change="onFileSelected"
        />
      </template>
    </PanelHeader>
    <div class="panel-body">
      <!-- 未保存草稿时的提示 -->
      <div v-if="!mainId && !store.ui.readonly" class="tip-box">
        请先<strong>保存草稿</strong>后再上传附件
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="no-data">加载中…</div>

      <!-- 附件列表 -->
      <table v-else-if="attachments.length > 0" class="table">
        <thead>
          <tr>
            <th>文件名</th>
            <th style="width:100px">文件大小</th>
            <th style="width:170px">上传时间</th>
            <th v-if="!store.ui.readonly" style="width:70px;text-align:center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="att in attachments" :key="att.id">
            <td>
              <span class="file-link" @click="handleDownload(att.id)" :title="att.fileName">
                {{ att.fileName }}
              </span>
            </td>
            <td>{{ formatSize(att.fileSize) }}</td>
            <td class="date-cell">{{ att.creationTime }}</td>
            <td v-if="!store.ui.readonly" class="col-action">
              <span class="op-icon danger" @click="handleDelete(att.id, att.fileName)" title="删除">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM8 9h8v10H8V9zm.5-5l-1-1h5l-1 1H5v2h14V4h-3.5z"/>
                </svg>
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="no-data">暂无附件</div>

      <!-- 上传进度指示 -->
      <div v-if="uploading" class="upload-indicator">
        <span class="upload-spinner"></span>
        正在上传…
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-data {
  text-align: center;
  color: #c0c4cc;
  padding: 24px 0;
  font-size: 14px;
}
.date-cell {
  color: #909399;
  font-size: 13px;
}
.file-link {
  color: #409eff;
  cursor: pointer;
  word-break: break-all;
}
.file-link:hover {
  text-decoration: underline;
}
.upload-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  padding: 12px 0;
  font-size: 14px;
}
.upload-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #dcdfe6;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.btn-text:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
