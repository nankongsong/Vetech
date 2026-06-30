<script setup lang="ts">
/**
 * 差旅报销单详情页面（统一入口）
 * 支持四种模式：
 *   add   — 新增报销单（路由 /reimburse/add）
 *   edit  — 编辑已有报销单（路由 /reimburse/:id/edit）
 *   push  — 手工推送确认页（路由 /reimburse/:id/push?mode=push）
 *   view  — 只读查看页（路由 /reimburse/:id/view）
 */
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReimbursementStore } from '@/stores/reimbursement'
import { fetchReimDetail, deleteTempAttachment } from '@/api/service'
import type { BackendReimDetail } from '@/api/types'
import type { Allocation, Trip } from '@/types/models'
import DocHeader from '@/sections/DocHeader.vue'
import DocFooter from '@/sections/DocFooter.vue'
import BasicInfo from '@/sections/BasicInfo.vue'
import TripSection from '@/sections/TripSection.vue'
import SubsidySection from '@/sections/SubsidySection.vue'
import TotalSection from '@/sections/TotalSection.vue'
import AllocationSection from '@/sections/AllocationSection.vue'
import RemarkSection from '@/sections/RemarkSection.vue'
import AttachmentSection from '@/sections/AttachmentSection.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useConfirm } from '@/composables/useConfirm'

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const store = useReimbursementStore()

const pageLoading = ref(false)
const isEdit = ref(false)
const isPush = ref(false)
const isView = ref(false)
const editVersion = ref(0)
const editStatus = ref(0) // 0=草稿 1=已完成 2=已作废
const docFooterRef = ref<InstanceType<typeof DocFooter> | null>(null)

onMounted(async () => {
  store.resetForNewForm()
  await store.loadBaseData()

  const idParam = route.params.id
  if (idParam && typeof idParam === 'string') {
    isEdit.value = true
    await loadDetail(Number(idParam))
  }

  if (route.query.mode === 'push') {
    isPush.value = true
  }
  // 检测只读查看模式
  if (route.name === 'reimburseView') {
    isView.value = true
    isEdit.value = false
    store.ui.readonly = true
  }
})

// 监听路由参数变化（组件复用时重新加载数据）
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId === oldId) return

    store.resetForNewForm()
    isPush.value = false
    isView.value = false
    editVersion.value = 0
    editStatus.value = 0
    store.ui.readonly = false

    if (newId && typeof newId === 'string') {
      isEdit.value = true
      await loadDetail(Number(newId))
    } else {
      isEdit.value = false
    }

    if (route.query.mode === 'push') {
      isPush.value = true
    }
    if (route.name === 'reimburseView') {
      isView.value = true
      isEdit.value = false
      store.ui.readonly = true
    }
  }
)

/** 加载已有报销单详情并映射到 store */
async function loadDetail(id: number) {
  pageLoading.value = true
  try {
    const detail: BackendReimDetail = await fetchReimDetail(id)
    mapDetailToStore(detail)
  } catch {
    // 加载失败返回列表页
    router.replace({ name: 'reimburseList' })
  } finally {
    pageLoading.value = false
  }
}

/** 后端 DTO → 前端 store 模型映射 */
function mapDetailToStore(detail: BackendReimDetail) {
  const m = detail.main
  editVersion.value = m.version || 0
  editStatus.value = m.status ?? 0

  // 基础信息映射（后端字段名 → store 字段名）
  store.setBasic({
    title: m.reimbursementTitle || '',
    reimbursement: m.reimburserId || '',
    department: m.reimDepartmentId || '',
    reimCompany: m.reimCompanyId || '',
    businessType: m.businessTypeId || '',
    reason: m.businessTripReason || '',
  })
  store.setRemark(m.remarks || '')

  // 行程映射
  store.trips = (detail.trips || []).map((t): Trip => ({
    id: String(t.id || t.travelerId),
    reimbursementId: t.travelerId,
    startCity: t.originCityId,
    endCity: t.destinationCityId,
    startDate: t.startDate,
    endDate: t.endDate,
    description: t.tripDesc || '',
  }))

  // 补助映射
  store.subsidies = (detail.subsidies || []).map(s => ({
    id: String(s.id),
    tripId: String(s.tripId || ''),
    reimbursementId: s.travelerId,
    startDate: s.startDate,
    endDate: s.endDate,
    days: s.subsidyDays,
    startCity: '',
    endCity: '',
    subsidyCity: s.subsidyCityId,
    applyAmount: s.applyAmount,
    subsidyAmount: s.subsidyAmount,
    calendar: [],
  }))

  // 根据 trips 修复/重建 subsidies（补齐 startCity/endCity/calendar 等字段）
  store.rebuildSubsidies()

  // 分摊映射（如果后端返回空数组，保持默认的一行分摊记录）
  const allocList = (detail.allocations || []).map((a): Allocation => ({
    id: String(a.id || a.companyId),
    company: a.companyId || a.companyName || '',
    project: a.projectId || a.projectName || '',
    ratio: a.allocationRatio || 0,
    amount: a.allocationAmount || 0,
  }))
  store.allocation = allocList.length > 0 ? allocList : [
    { id: 'a_default', company: m.reimCompanyId || '', project: '', ratio: 1.0, amount: 0 }
  ]
}

/** 页面标题 */
const pageTitle = computed(() => {
  if (isView.value) return '查看报销单'
  if (isPush.value) return '手工推送 — 报销单'
  if (isEdit.value) return '编辑报销单'
  return '新增报销单'
})

/** 当前报销单主键ID（编辑/查看/推送模式有值，新增模式为 null） */
const reimId = computed(() => {
  const id = route.params.id
  return id && typeof id === 'string' ? Number(id) : null
})

/** 关闭页面 / 返回列表：统一弹窗 → 保存草稿／放弃修改／继续编辑 */
async function handleCloseOrBack() {
  // 只读查看页面：直接退出，不保存
  if (isView.value) {
    router.push({ name: 'reimburseList' })
    return
  }
  // 显示三按钮确认弹窗
  confirm.state.visible = true
  confirm.state.type = 'warning'
  confirm.state.title = '提示'
  confirm.state.text = '是否保存当前内容？'
  confirm.state.okText = '保存草稿'
  confirm.state.cancelText = '放弃修改'
}

/** 保存草稿并返回列表 */
async function onCloseSave() {
  confirm.state.visible = false
  if (docFooterRef.value) {
    await docFooterRef.value.saveDraft()
  }
  router.push({ name: 'reimburseList' })
}

/** 放弃修改，直接返回列表（清理临时附件） */
async function onCloseDiscard() {
  confirm.state.visible = false
  // 逐个删除临时附件
  const ids = [...store.tempAttachmentIds]
  store.clearTempAttachmentIds()
  for (const id of ids) {
    try { await deleteTempAttachment(id) } catch { /* 忽略 */ }
  }
  router.push({ name: 'reimburseList' })
}

/** 继续编辑，关闭弹窗留在当前页 */
function onCloseContinue() {
  confirm.state.visible = false
}
</script>

<template>
  <!-- 单据页面根容器 -->
  <div class="doc-page" v-loading="pageLoading">
    <!-- 固定在顶部的导航栏 + 单据头部 -->
    <div class="doc-sticky-header">
      <!-- 页面导航栏：标题 + 返回按钮 -->
      <div class="page-nav">
        <span class="page-nav-title">{{ pageTitle }}</span>
        <span class="page-nav-back" @click="handleCloseOrBack">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          返回列表
        </span>
      </div>
      <!-- 单据头部：标题 + 提单日期 -->
      <DocHeader :mode="isEdit ? 'edit' : 'add'" />
    </div>

    <!-- 单据主体内容区域 -->
    <main class="doc-main">
      <!-- 基础信息 -->
      <BasicInfo />
      <!-- 补录行程 -->
      <TripSection />
      <!-- 补助信息 -->
      <SubsidySection />
      <!-- 费用合计 -->
      <TotalSection />
      <!-- 费用归属及分摊 -->
      <AllocationSection />
      <!-- 备注信息 -->
      <RemarkSection />
      <!-- 附件 -->
      <AttachmentSection :main-id="reimId" />
    </main>

    <!-- 单据底部操作栏 -->
    <DocFooter
      ref="docFooterRef"
      :mode="isEdit ? 'edit' : 'add'"
      :reim-id="isEdit ? Number(route.params.id) : null"
      :edit-version="editVersion"
      :edit-status="editStatus"
      :readonly="isView"
      @close="handleCloseOrBack"
    />

    <!-- 三按钮确认对话框：保存草稿 / 放弃修改 / 继续编辑 -->
    <ConfirmModal
      :model-value="confirm.state.visible"
      :type="confirm.state.type"
      :title="confirm.state.title"
      :text="confirm.state.text"
      :ok-text="confirm.state.okText"
      :cancel-text="confirm.state.cancelText"
      third-text="继续编辑"
      @ok="onCloseSave"
      @cancel="onCloseDiscard"
      @third="onCloseContinue"
    />
  </div>
</template>

<style scoped>
/* 单据页面根容器 */
.doc-page {
  min-height: 100vh; background: #f0f2f5;
}
/* 固定顶部导航栏 */
.doc-sticky-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 99;
}
/* 页面导航栏样式 */
.page-nav {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px; background: #fff; border-bottom: 1px solid #ebeef5;
}
/* 页面标题 */
.page-nav-title { font-size: 20px; font-weight: 700; color: #303133; }
/* 返回按钮 */
.page-nav-back {
  display: flex; align-items: center; gap: 4px;
  font-size: 14px; color: #409eff; cursor: pointer;
}
.page-nav-back:hover { text-decoration: underline; }
/* 主体内容区：固定顶部导航 + 底部操作栏的间距 */
.doc-main {
  max-width: 1200px; margin: 0 auto; padding: 114px 20px 80px;
}
</style>

<!-- ========== 全局样式（未 scoped，供所有子 section/组件使用） ========== -->
<style>
/* ===== 面板（Panel）组件 ===== */
.panel {
  background: #fff; border: none; border-radius: 4px;
  margin-bottom: 0; overflow: visible;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
/* 折叠状态隐藏面板内容 */
.panel.collapsed .panel-body { display: none; }
/* 折叠图标旋转 */
.panel.collapsed .panel-header .toggle-icon { transform: rotate(180deg); }
/* 面板内容内边距 */
.panel-body { padding: 20px 24px; }

/* ===== 表格通用样式 ===== */
.table {
  width: 100%; border-collapse: collapse; font-size: 14px;
}
.table th, .table td {
  padding: 10px 12px; border-bottom: 1px solid #ebeef5; text-align: left;
}
.table th { background: #fafafa; color: #4e5b70; font-weight: 400; font-size: 14px; }
.table td { color: #303133; font-size: 14px; }
.table .col-index { width: 50px; text-align: center; }
.table .col-action { width: 100px; text-align: center; }
.table .right { text-align: right; }
.table .no-data { text-align: center; color: #c0c4cc; padding: 24px 0; }
.table tbody tr:hover { background: #f5f7fa; }

/* ===== 操作图标按钮 ===== */
.op-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; cursor: pointer; color: #409eff;
  border-radius: 3px; margin: 0 2px;
}
.op-icon:hover { background: #ecf5ff; }
.op-icon.danger { color: #f56c6c; }
.op-icon.danger:hover { background: #fef0f0; }

/* ===== 按钮通用样式 ===== */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 34px; padding: 0 20px; border: 1px solid #dcdfe6;
  border-radius: 4px; font-size: 14px; cursor: pointer;
  background: #fff; color: #606266;
}
.btn:hover { border-color: #c0c4cc; color: #409eff; }
.btn-primary {
  background: #409eff; border-color: #409eff; color: #fff;
}
.btn-primary:hover { background: #337ecc; border-color: #337ecc; color: #fff; }
.btn-default { background: #fff; color: #606266; }
.btn-outline { background: #fff; border-color: #409eff; color: #409eff; }
.btn-outline:hover { border-color: #337ecc; color: #337ecc; }
.btn-text {
  display: inline-flex; align-items: center; gap: 4px;
  background: none; border: none; color: #409eff; font-size: 14px;
  cursor: pointer; padding: 2px 4px;
}
.btn-text:hover { text-decoration: underline; }

/* ===== 表单行布局 ===== */
.form-row {
  display: flex; gap: 20px; margin-bottom: 16px;
}
.form-field {
  display: flex; align-items: center; flex: 1; min-width: 0;
}
.form-field.col-1 { flex: 1 1 100%; }
.form-label {
  width: 90px; flex-shrink: 0; font-size: 14px; color: #606266;
  display: flex; align-items: center;
}
.form-label .req { color: #f56c6c; margin-left: 2px; }
.form-label .help { margin-left: 4px; color: #e6a23c; cursor: help; }
.form-control {
  flex: 1; min-width: 0;
}
.form-control input[type="text"],
.form-control input[type="date"],
.form-control textarea {
  width: 100%; height: 34px; padding: 0 10px;
  border: 1px solid #dcdfe6; border-radius: 4px;
  font-size: 14px; box-sizing: border-box;
}
.form-control input:focus,
.form-control textarea:focus { border-color: #409eff; outline: none; }
.form-control.textarea textarea {
  height: auto; padding: 8px 10px; resize: vertical;
}

/* ===== 模态表单布局 ===== */
.modal-form-row {
  display: flex; align-items: center; margin-bottom: 14px;
}
.modal-form-row .form-label {
  width: 80px; flex-shrink: 0; font-size: 14px; color: #606266;
}
.modal-form-row .form-label .req { color: #f56c6c; margin-left: 2px; }
.modal-form-row .form-control {
  flex: 1; min-width: 0;
}

/* ===== 自定义复选框 ===== */
.checkbox {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border: 2px solid #dcdfe6; border-radius: 3px;
  cursor: pointer; position: relative; flex-shrink: 0;
}
.checkbox.checked { background: #409eff; border-color: #409eff; }
.checkbox.checked::after {
  content: ''; display: block; width: 5px; height: 9px;
  border: solid #fff; border-width: 0 2px 2px 0;
  transform: rotate(45deg); margin-top: -2px;
}
.checkbox.partial { background: #fff; border-color: #409eff; }
.checkbox.partial::after {
  content: ''; display: block; width: 8px; height: 2px;
  background: #409eff; border: none; transform: none; margin-top: 0;
}

/* ===== 补助日历表格 ===== */
.calendar-table { margin-top: 12px; }
.calendar-table .date-cell { white-space: nowrap; }
.calendar-table .date-cell .week { color: #909399; font-size: 12px; margin-left: 4px; }
.calendar-table .amount-cell { min-width: 130px; }
.calendar-table .amount-cell .std { display: block; font-size: 12px; color: #c0c4cc; margin-bottom: 2px; }
.calendar-table .amount-cell .input {
  width: 80px; height: 28px; text-align: right; padding: 0 6px;
  border: 1px solid #dcdfe6; border-radius: 3px; font-size: 14px;
}
.calendar-table .amount-cell.disabled .input { background: #f5f7fa; color: #c0c4cc; }
.calendar-table .amount-cell .input:focus { border-color: #409eff; outline: none; }
.calendar-table .checkbox-cell { text-align: center; }

/* ===== 日历信息摘要 ===== */
.calendar-info {
  background: #f5f7fa; border-radius: 4px; padding: 12px 16px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
  font-size: 14px; margin-bottom: 12px;
}
.calendar-info .row { display: flex; }
.calendar-info .lbl { color: #909399; width: 80px; flex-shrink: 0; }
.calendar-info .val { color: #303133; }
.calendar-info .val.hot { color: #409eff; font-weight: 600; }

/* ===== 提示框 ===== */
.tip-box {
  background: #fdf6ec; border: 1px solid #f5dab1; border-radius: 4px;
  padding: 10px 14px; font-size: 13px; color: #e6a23c; line-height: 1.8;
  margin-bottom: 16px;
}
.tip-box b { color: #e6a23c; }

/* ===== 警告条 ===== */
.alert {
  display: flex; align-items: flex-start; gap: 8px;
  background: #fdf6ec; border: 1px solid #f5dab1; border-radius: 4px;
  padding: 8px 12px; font-size: 13px; color: #e6a23c; margin-bottom: 12px;
  line-height: 1.6;
}
.alert .icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%;
  background: #e6a23c; color: #fff; font-weight: 700; font-size: 12px;
  flex-shrink: 0; margin-top: 1px;
}
.alert .text { flex: 1; }

/* ===== 标题附属文本 ===== */
.title-sub { color: #409eff; font-weight: 400; margin-left: 8px; }
.title-tip { color: #909399; font-weight: 400; font-size: 12px; margin-left: 6px; }

/* ===== 页脚 ===== */
.doc-footer {
  display: flex; justify-content: center; gap: 12px;
  padding: 16px 20px; background: #fff; border-top: 1px solid #ebeef5;
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
}
</style>
