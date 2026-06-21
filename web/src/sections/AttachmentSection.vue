<script setup lang="ts">
/**
 * 附件区域组件
 * 与后端 reim_attachment 表对齐，支持上传/列表/下载/删除
 *
 * 新建页面：选文件 → 暂存浏览器内存 → 保存草稿后自动上传到后端
 * 编辑页面：选文件 → 直接上传到后端
 * 附件不参与任何表单校验
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
const pendingFiles = ref<File[]>([])
const loading = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement>()

/** 加载已关联附件列表 */
async function loadList() {
  if (!props.mainId) return
  loading.value = true
  try {
    attachments.value = await fetchAttachments(props.mainId)
  } catch {
    attachments.value = []
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

  if (props.mainId) {
    // 已有主键 → 直接上传
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
  } else {
    // 新建页面 → 暂存到浏览器内存，保存后自动上传
    pendingFiles.value.push(file)
  }
}

/** 删除已关联附件 */
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

/** 移除暂存文件 */
function removePendingFile(idx: number) {
  pendingFiles.value.splice(idx, 1)
}

/** 下载附件 */
function handleDownload(attachId: number) {
  if (!props.mainId) return
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  window.open(`${baseUrl}/reim/${props.mainId}/attachment/${attachId}`, '_blank')
}

/** 触发文件选择 */
function triggerUpload() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleUpload(file)
  input.value = ''
}

/** 提交所有暂存文件（保存草稿后由 mainId 变化触发） */
async function flushPendingFiles() {
  if (!props.mainId || pendingFiles.value.length === 0) return
  uploading.value = true
  const list = [...pendingFiles.value]
  pendingFiles.value = []
  let successCount = 0
  for (const file of list) {
    try {
      await uploadAttachment(props.mainId, file)
      successCount++
    } catch {
      // 单个失败继续传下一个
    }
  }
  uploading.value = false
  if (successCount > 0) ElMessage.success(`已上传 ${successCount} 个附件`)
  if (successCount < list.length) ElMessage.warning(`${list.length - successCount} 个上传失败`)
  await loadList()
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

watch(() => props.mainId, async (newVal, oldVal) => {
  if (newVal && !oldVal) {
    // mainId 从 null → 有值（保存草稿后路由跳转触发）
    await flushPendingFiles()
  } else if (newVal) {
    attachments.value = []
    await loadList()
  } else {
    attachments.value = []
    pendingFiles.value = []
  }
})
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
      <!-- 加载中 -->
      <div v-if="loading" class="no-data">加载中…</div>

      <!-- 暂存文件列表（浏览器内存，未保存） -->
      <table v-if="pendingFiles.length > 0" class="table pending-table">
        <thead>
          <tr>
            <th>文件名</th>
            <th style="width:100px">文件大小</th>
            <th style="width:100px">状态</th>
            <th v-if="!store.ui.readonly" style="width:50px;text-align:center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(file, idx) in pendingFiles" :key="'p_' + idx">
            <td>
              <span class="pending-name" :title="file.name">{{ file.name }}</span>
            </td>
            <td>{{ formatSize(file.size) }}</td>
            <td><span class="pending-badge">待上传</span></td>
            <td v-if="!store.ui.readonly" class="col-action">
              <span class="op-icon danger" @click="removePendingFile(idx)" title="移除">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM8 9h8v10H8V9zm.5-5l-1-1h5l-1 1H5v2h14V4h-3.5z"/>
                </svg>
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 已上传附件列表 -->
      <table v-if="attachments.length > 0" class="table">
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
      <div v-if="attachments.length === 0 && pendingFiles.length === 0 && !loading" class="no-data">
        暂无附件
      </div>

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
.pending-table {
  margin-bottom: 0;
}
.pending-table tbody tr:last-child td {
  border-bottom: none;
}
.pending-name {
  color: #606266;
  word-break: break-all;
}
.pending-badge {
  display: inline-block;
  padding: 1px 8px;
  font-size: 12px;
  color: #e6a23c;
  background: #fdf6ec;
  border-radius: 3px;
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
