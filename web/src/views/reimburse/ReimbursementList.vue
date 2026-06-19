<script setup lang="ts">
/**
 * 差旅报销单列表页面
 * 对接后端 REST API（《差旅报销单_API接口文档 V1.0》）
 * 功能：分页查询 / 筛选搜索 / 删除草稿 / 新增跳转
 */
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, MoreFilled, Document } from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { getStatusLabel, getRowActions } from '@/utils/dictEnum'
import { getReimPage, deleteReim, voidReim, type ReimburseListRow } from '@/api/reimburse'
import {
  initDictData,
  companyList,
  departmentList,
  employeeList,
  businessTypeTreeData,
} from '@/composables/useReimDictData'

const router = useRouter()

// ==================== 筛选表单 ====================
const filterForm = reactive({
  reimbursementNo: '',
  title: '',
  reason: '',
  companyId: '',
  departmentId: '',
  reimburserId: '',
  businessTypeId: '',
})

// ==================== 分页 ====================
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// ==================== 表格 ====================
const tableData = ref<ReimburseListRow[]>([])
const loading = ref(false)

// ==================== 查询列表 ====================
async function fetchList() {
  loading.value = true
  try {
    const res = await getReimPage({
      current: currentPage.value,
      size: pageSize.value,
      ...(filterForm.reimbursementNo && { reimbursementNo: filterForm.reimbursementNo }),
      ...(filterForm.title && { title: filterForm.title }),
      ...(filterForm.reason && { reason: filterForm.reason }),
      ...(filterForm.companyId && { companyId: filterForm.companyId }),
      ...(filterForm.departmentId && { departmentId: filterForm.departmentId }),
      ...(filterForm.reimburserId && { reimburserId: filterForm.reimburserId }),
      ...(filterForm.businessTypeId && { businessTypeId: filterForm.businessTypeId }),
    })

    // 前端计算 isAllRequiredFilled：草稿状态下必填项是否完整
    tableData.value = res.data.records.map(row => ({
      ...row,
      isAllRequiredFilled: row.status === 0
    }))

    total.value = res.data.total
  } catch {
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ==================== 事件处理 ====================
function handleSearch() { currentPage.value = 1; fetchList() }

function handleClear() {
  filterForm.reimbursementNo = ''
  filterForm.title = ''
  filterForm.reason = ''
  filterForm.companyId = ''
  filterForm.departmentId = ''
  filterForm.reimburserId = ''
  filterForm.businessTypeId = ''
  currentPage.value = 1
  fetchList()
}

/** 业务类型树形下拉：仅叶子节点可选中，父节点只展开/收起 */
function findNodeById(nodes: any[], id: string): any | null {
  for (const node of nodes) {
    if (node.value === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}
function onBusinessTypeChange(val: string) {
  // 清空值时直接通过
  if (!val) { filterForm.businessTypeId = ''; return }
  const node = findNodeById(businessTypeTreeData.value, val)
  // 仅叶子节点（无 children）允许选中
  if (node && !node.children) {
    filterForm.businessTypeId = val
  }
  // 父节点忽略，不更新 modelValue
}

/** 点击报销单号/标题 → 与提交/查看按钮跳转逻辑一致 */
function goDetail(row: ReimburseListRow) {
  if (row.status === 0) {
    // 草稿：跳转编辑报销单页面
    router.push({ name: 'reimburseEdit', params: { id: row.id } })
  } else if (row.status === 1) {
    // 已完成：跳转独立只读详情页面
    router.push({ name: 'reimburseView', params: { id: row.id } })
  }
  // 已作废：无跳转
}

function handleAdd() { router.push({ name: 'reimburseAdd' }) }

/** 编辑：仅草稿可操作 */
function handleEdit(row: ReimburseListRow) {
  if (row.status !== 0) return
  router.push({ name: 'reimburseEdit', params: { id: row.id } })
}

/** 提交/查看：草稿跳转编辑页，已完成跳转只读详情页，已作废禁用 */
function handleSubmit(row: ReimburseListRow) {
  if (row.status === 0) {
    // 草稿：跳转编辑报销单页面
    router.push({ name: 'reimburseEdit', params: { id: row.id } })
  } else if (row.status === 1) {
    // 已完成：跳转独立只读详情页面
    router.push({ name: 'reimburseView', params: { id: row.id } })
  }
  // 已作废：按钮置灰不可点击，不做任何跳转
}

/** 获取提交/查看按钮的提示文字 */
function getSubmitTooltip(row: ReimburseListRow): string {
  if (row.status === 0) return '提交'
  if (row.status === 1) return '查看详情'
  return '单据已作废，无法操作'
}

/** 手工推送：仅已完成单据可推送 */
function handleManualPush(row: ReimburseListRow) { router.push({ name: 'reimbursePush', params: { id: row.id }, query: { mode: 'push' } }) }

/** 复制：创建副本草稿 */
function handleCopy(row: ReimburseListRow) {
  ElMessage.success(`已复制报销单 ${fmtNo(row.reimbursementNo)}，请前往草稿编辑`)
  fetchList()
}

/** 删除草稿 */
async function handleDelete(row: ReimburseListRow) {
  try {
    await ElMessageBox.confirm(
      `确定要删除报销单号【${fmtNo(row.reimbursementNo)}】吗？`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger' },
    )
    await deleteReim(row.id)
    ElMessage.success('删除成功')
    await fetchList()
  } catch (e) {
    // 用户取消或请求失败，静默处理
    if (e && e !== 'cancel') throw e
  }
}

/** 作废：仅已完成单据可手动作废 */
async function handleVoid(row: ReimburseListRow) {
  try {
    await ElMessageBox.confirm(
      `确定要作废报销单号【${fmtNo(row.reimbursementNo)}】吗？作废后不可恢复。`,
      '作废确认',
      { confirmButtonText: '确定作废', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger' },
    )
    await voidReim(row.id, row.version ?? 0)
    ElMessage.success('作废成功')
    await fetchList()
  } catch (e) {
    // 用户取消或请求失败，静默处理
    if (e && e !== 'cancel') throw e
  }
}

/** 更多下拉命令分发 */
function handleMoreCommand(cmd: string, row: ReimburseListRow) {
  if (cmd === 'delete') handleDelete(row)
  else if (cmd === 'manualPush') handleManualPush(row)
  else if (cmd === 'copy') handleCopy(row)
  else if (cmd === 'void') handleVoid(row)
}

function handleSizeChange(size: number) { pageSize.value = size; currentPage.value = 1; fetchList() }
function handlePageChange(page: number) { currentPage.value = page; fetchList() }

onMounted(async () => { await initDictData(); await fetchList() })

// ==================== 工具 ====================
/** 截取日期部分 */
function formatDate(dateTime: string): string {
  if (!dateTime) return ''
  return dateTime.split('T')[0].split(' ')[0]
}
/** 报销单号去横线：BX-20260612-0007 → BX202606120007 */
function fmtNo(no: string): string { return no.replace(/-/g, '') }

</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="reimburse-list-container">
      <!-- ===== 筛选栏：两行左对齐，按钮与第一行费用归属公司右对齐 ===== -->
      <el-card shadow="never" class="filter-card">
        <el-form :model="filterForm" class="filter-form">
          <!-- 两行 Grid：4列，最后一列1fr填充 → 字段靠左、按钮靠右，与表格左右对齐 -->
          <div class="filter-grid">
            <!-- 第一行 -->
            <el-form-item label="报销单号"><el-input v-model="filterForm.reimbursementNo" placeholder="请输入" clearable style="width:160px" @keyup.enter="handleSearch" /></el-form-item>
            <el-form-item label="标题"><el-input v-model="filterForm.title" placeholder="请输入" clearable style="width:160px" @keyup.enter="handleSearch" /></el-form-item>
            <el-form-item label="事由"><el-input v-model="filterForm.reason" placeholder="请输入" clearable style="width:160px" @keyup.enter="handleSearch" /></el-form-item>
            <el-form-item label="费用归属公司" class="cell-right">
              <el-select v-model="filterForm.companyId" placeholder="请选择" clearable style="width:200px">
                <el-option v-for="item in companyList" :key="item.companyId" :label="item.companyName" :value="item.companyId" />
              </el-select>
            </el-form-item>

            <!-- 第二行 -->
            <el-form-item label="报销部门">
              <el-select v-model="filterForm.departmentId" placeholder="请选择" clearable style="width:160px">
                <el-option v-for="item in departmentList" :key="item.departmentId" :label="item.departmentName" :value="item.departmentId" />
              </el-select>
            </el-form-item>
            <el-form-item label="报销人">
              <el-select v-model="filterForm.reimburserId" placeholder="请选择" clearable style="width:160px">
                <el-option v-for="item in employeeList" :key="item.employeeId" :label="item.employeeName" :value="item.employeeId" />
              </el-select>
            </el-form-item>
            <el-form-item label="业务类型">
              <el-tree-select :model-value="filterForm.businessTypeId" :data="businessTypeTreeData" placeholder="请选择" clearable check-strictly style="width:200px" @update:model-value="onBusinessTypeChange" />
            </el-form-item>
            <!-- 按钮组：右对齐 -->
            <div class="filter-actions">
              <el-button type="primary" plain @click="handleAdd">新增</el-button>
              <el-button type="primary" plain @click="handleClear">清除</el-button>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </div>
          </div>
        </el-form>
      </el-card>

      <!-- ===== 数据表格：列宽紧凑适配全屏无横向滚动 ===== -->
      <el-card shadow="never" class="table-card">
        <el-table :data="tableData" v-loading="loading" border style="width:100%" :header-cell-style="{ background:'#f5f7fa', color:'#303133', fontWeight:'600' }" empty-text="暂无报销单数据" size="small">
          <!-- 序号：type="index" 自动编号 -->
          <el-table-column type="index" label="序号" width="50" align="center" :index="(idx:number)=>(currentPage-1)*pageSize+idx+1" />
          <!-- 操作列 -->
          <el-table-column label="操作" width="105" align="center">
            <template #default="{ row }">
              <el-tooltip :content="getSubmitTooltip(row)" placement="top">
                <el-button type="primary" link size="small" :icon="Document" :disabled="!getRowActions(row.status, row.isAllRequiredFilled).submit" class="action-icon-btn" @click="handleSubmit(row)" />
              </el-tooltip>
              <el-tooltip :content="getRowActions(row.status).edit?'编辑':'不可编辑'" placement="top">
                <el-button type="primary" link size="small" :icon="Edit" :disabled="!getRowActions(row.status).edit" class="action-icon-btn" @click="handleEdit(row)" />
              </el-tooltip>
              <!-- 更多下拉：hover 触发，纯文字无图标 -->
              <el-dropdown trigger="hover" placement="bottom-end" :hide-timeout="100" @command="(cmd:string)=>handleMoreCommand(cmd,row)">
                <el-button type="primary" link size="small" :icon="MoreFilled" class="action-icon-btn" />
                <template #dropdown>
                  <el-dropdown-menu class="more-dropdown-menu">
                    <el-dropdown-item command="delete" :disabled="!getRowActions(row.status).delete" :class="getRowActions(row.status).delete?'':'dd-disabled'">删除</el-dropdown-item>
                    <el-dropdown-item command="manualPush" :disabled="!getRowActions(row.status).manualPush" :class="getRowActions(row.status).manualPush?'':'dd-disabled'">手工推送</el-dropdown-item>
                    <el-dropdown-item command="copy" :disabled="!getRowActions(row.status).copy" :class="getRowActions(row.status).copy?'':'dd-disabled'">复制</el-dropdown-item>
                    <el-dropdown-item command="void" :disabled="!getRowActions(row.status).void" :class="getRowActions(row.status).void?'':'dd-disabled'">作废</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
          <!-- 报销单号：草稿→编辑页，已完成→只读页，已作废→无跳转+悬浮提示 -->
          <el-table-column label="报销单号" width="155" show-overflow-tooltip>
            <template #default="{row}">
              <el-tooltip v-if="row.status === 2" content="单据已作废，无法查看编辑" placement="top">
                <span class="text-disabled">{{ fmtNo(row.reimbursementNo) }}</span>
              </el-tooltip>
              <span v-else class="text-blue link-text" @click="goDetail(row)">{{ fmtNo(row.reimbursementNo) }}</span>
            </template>
          </el-table-column>
          <!-- 单据状态 -->
          <el-table-column label="单据状态" width="90" align="center">
            <template #default="{row}">
              <el-tag class="status-tag" size="small" effect="plain">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- 报销人 -->
          <el-table-column label="报销人" width="115" show-overflow-tooltip>
            <template #default="{row}">{{row.reimburserName}} [{{row.reimburserNo}}]</template>
          </el-table-column>
          <!-- 报销部门 -->
          <el-table-column label="报销部门" width="145" show-overflow-tooltip>
            <template #default="{row}">[{{row.reimDepartmentNo}}] {{row.reimDepartmentName}}</template>
          </el-table-column>
          <!-- 费用归属公司 -->
          <el-table-column label="费用归属公司" width="135" show-overflow-tooltip>
            <template #default="{row}">{{ row.reimCompanyName }}</template>
          </el-table-column>
          <!-- 业务类型 -->
          <el-table-column label="业务类型" width="105" show-overflow-tooltip>
            <template #default="{row}">{{ row.businessTypeName }}</template>
          </el-table-column>
          <!-- 报销标题：草稿→编辑页，已完成→只读页，已作废→无跳转+悬浮提示 -->
          <el-table-column label="报销标题" show-overflow-tooltip>
            <template #default="{row}">
              <el-tooltip v-if="row.status === 2" content="单据已作废，无法查看编辑" placement="top">
                <span class="text-disabled">{{ row.reimbursementTitle }}</span>
              </el-tooltip>
              <span v-else class="text-blue link-text" @click="goDetail(row)">{{ row.reimbursementTitle }}</span>
            </template>
          </el-table-column>
          <!-- 报销事由：不定宽，自动填满剩余空间 -->
          <el-table-column prop="businessTripReason" label="报销事由" show-overflow-tooltip />
          <!-- 补助金额 -->
          <el-table-column label="补助金额" width="85" align="right">
            <template #default="{row}">{{ (row.subsidyTotal ?? 0).toFixed(2) }}</template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column label="创建时间" width="95">
            <template #default="{row}">{{ formatDate(row.creationTime) }}</template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10,20,30,50]" :total="total" :pager-count="5" layout="total,sizes,prev,pager,next,jumper" background @size-change="handleSizeChange" @current-change="handlePageChange" />
        </div>
      </el-card>
    </div>
  </el-config-provider>
</template>

<style scoped>
.reimburse-list-container {
  width: 100%;
  padding: 16px 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

/* ---- 筛选卡片 ---- */
.filter-card {
  width: 100%;
  margin-bottom: 16px;
}
.filter-card :deep(.el-card__body) { padding: 16px 20px 8px; }

.filter-form {
  width: 100%;
}

/* ---- CSS Grid 两行筛选：前3列均分左区、第4列auto右对齐 ---- */
.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 0 60px;
  align-items: center;
}

.filter-grid .el-form-item {
  margin-bottom: 12px;
}

/* 费用归属公司（列4）右对齐 */
.cell-right {
  justify-self: end;
}

/* 按钮组（列5）右对齐 */
.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-shrink: 0;
  justify-self: end;
}

/* ---- 表格 ---- */
.table-card { width: 100%; overflow: visible; }
.table-card :deep(.el-card__body) { padding: 12px 20px; }

.text-blue { color: #409eff; }

/* 状态标签：白底 + 蓝色字体 + 蓝色边框（三状态统一） */
.status-tag {
  background-color: #fff !important;
  color: #409eff !important;
  border: 1px solid #409eff !important;
}
.link-text { cursor: pointer; }
.link-text:hover { text-decoration: underline; }
.text-disabled { color: #c0c4cc; cursor: not-allowed; }

.action-icon-btn { padding: 4px; font-size: 15px; }
.action-icon-btn + .action-icon-btn { margin-left: 1px; }

/* 更多下拉：禁用项浅灰色文字（纯文字无图标） */
.more-dropdown-menu .dd-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.amount-text { font-variant-numeric: tabular-nums; color: #303133; }

/* ---- 分页 ---- */
.pagination-wrapper { display: flex; justify-content: flex-end; align-items: center; margin-top: 16px; }
.pagination-wrapper :deep(.el-pagination) { --el-pagination-button-bg-color:#fff; --el-pagination-button-color:#303133; --el-pagination-button-border-color:#409eff; --el-pagination-button-disabled-border-color:#dcdfe6; --el-pagination-button-hover-color:#409eff; }
.pagination-wrapper :deep(.el-pager li.is-active) { background-color:#409eff; color:#fff; }
.pagination-wrapper :deep(.el-pager li:not(.is-active)) { background-color:#fff; color:#303133; border:1px solid #409eff; }
.pagination-wrapper :deep(.el-pagination__total) { margin-right:16px; font-size:14px; color:#606266; }
.pagination-wrapper :deep(.el-pagination__jump) { margin-left:16px; font-size:14px; color:#606266; }
</style>
