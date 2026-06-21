<script setup lang="ts">
/**
 * 附件区域组件
 *
 * 上传即走后端 temp（status=0），保存/提交时确认（status=1）
 * 附件不参与任何表单校验
 */
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PanelHeader from '@/components/PanelHeader.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import {
  fetchAttachments,
  uploadTempAttachment,
  deleteAttachment,
  deleteTempAttachment,
} from '@/api/service'
import type { AttachmentItem } from '@/api/types'

const props = defineProps<{
  mainId: number | null
}>()

const store = useReimbursementStore()

const confirmedList = ref<AttachmentItem[]>([])
const tempList = ref<AttachmentItem[]>([])
const loading = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement>()

/** 混合列表：已确认 + 临时附件混排 */
const displayList = computed(() => {
  const items: { type: 'confirmed' | 'temp'; data: AttachmentItem }[] = []
  confirmedList.value.forEach(a => items.push({ type: 'confirmed', data: a }))
  tempList.value.forEach(a => items.push({ type: 'temp', data: a }))
  return items
})

/** 加载已确认附件 */
async function loadConfirmed() {
  if (!props.mainId) {
    confirmedList.value = []
    return
  }
  loading.value = true
  try {
    confirmedList.value = await fetchAttachments(props.mainId)
  } catch {
    confirmedList.value = []
  } finally {
    loading.value = false
  }
}

/** 处理文件选择 */
async function handleUpload(file: File) {
  if (!file) return
  if (file.name.length > 255) {
    ElMessage.warning('文件名过长，请重命名后上传')
    return
  }

  uploading.value = true
  try {
    const result = await uploadTempAttachment(file)
    tempList.value.push(result)
    store.addTempAttachmentId(result.id)
  } catch {
    // 错误已由拦截器处理
  } finally {
    uploading.value = false
  }
}

/** 删除附件（临时或已确认） */
async function handleRemove(item: { type: string; data: AttachmentItem }) {
  if (item.type === 'confirmed') {
    try {
      await ElMessageBox.confirm(`确定删除附件「${item.data.fileName}」？`, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      })
      if (!props.mainId) return
      await deleteAttachment(props.mainId, item.data.id)
      confirmedList.value = confirmedList.value.filter(a => a.id !== item.data.id)
    } catch {
      // 取消或错误
    }
  } else {
    // 临时附件：直接删除
    try {
      await deleteTempAttachment(item.data.id)
    } catch {
      // 忽略后端删除失败
    }
    store.removeTempAttachmentId(item.data.id)
    tempList.value = tempList.value.filter(a => a.id !== item.data.id)
  }
}

/** 下载已确认附件 */
function handleDownload(attachId: number) {
  if (!props.mainId) return
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  window.open(`${baseUrl}/reim/${props.mainId}/attachment/${attachId}`, '_blank')
}

function triggerUpload() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleUpload(file)
  input.value = ''
}

/** 保存成功后由父组件调用，刷新已确认列表 */
function refreshConfirmed() {
  loadConfirmed()
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const idx = Math.min(i, units.length - 1)
  return (bytes / Math.pow(k, idx)).toFixed(idx > 0 ? 1 : 0) + ' ' + units[idx]
}

defineExpose({ refreshConfirmed })

onMounted(loadConfirmed)
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.attachment }">
    <PanelHeader @toggle="store.togglePanel('attachment')">
      <template #title>附件</template>
      <template #extra>
        <button
          v-if="!store.ui.readonly"
          class="btn-text"
          :disabled="uploading"
          @click.stop="triggerUpload"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          上传附件
        </button>
        <input ref="fileInput" type="file" style="display:none" @change="onFileSelected" />
      </template>
    </PanelHeader>
    <div class="panel-body">
      <div v-if="loading" class="no-data">加载中…</div>

      <table v-if="displayList.length > 0" class="table">
        <thead>
          <tr>
            <th>文件名</th>
            <th style="width:100px">文件大小</th>
            <th v-if="!store.ui.readonly" style="width:70px;text-align:center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in displayList" :key="item.data.id">
            <!-- 已确认附件：可下载 -->
            <template v-if="item.type === 'confirmed'">
              <td>
                <span class="file-link" @click="handleDownload(item.data.id)" :title="item.data.fileName">
                  {{ item.data.fileName }}
                </span>
              </td>
              <td>{{ formatSize(item.data.fileSize) }}</td>
            </template>
            <!-- 临时附件：不可下载 -->
            <template v-else>
              <td>
                <span class="temp-name" :title="item.data.fileName">{{ item.data.fileName }}</span>
              </td>
              <td>{{ formatSize(item.data.fileSize) }}</td>
            </template>
            <td v-if="!store.ui.readonly" class="col-action">
              <span class="op-icon danger" @click="handleRemove(item)" title="删除">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM8 9h8v10H8V9zm.5-5l-1-1h5l-1 1H5v2h14V4h-3.5z"/>
                </svg>
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="displayList.length === 0 && !loading" class="no-data">暂无附件</div>

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
.file-link {
  color: #409eff;
  cursor: pointer;
  word-break: break-all;
}
.file-link:hover {
  text-decoration: underline;
}
.temp-name {
  color: #606266;
  word-break: break-all;
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
