<script setup lang="ts">
/**
 * 差旅报销单编辑页面（基础信息分区 + 补录行程弹窗 + 费用分摊区域）
 * 下拉组件规范：业务类型=el-tree-select，其余=el-select
 * 数据源：优先 API，降级静态数据（composable 自动处理）
 */
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Delete } from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import {
  getReimDetail,
  createReim,
  updateReim,
  type ReimburseSaveBody,
} from '@/api/reimburse'
import {
  initDictData,
  dictLoading,
  companyList,
  departmentList,
  employeeList,
  businessTypeTreeData,
  cityList,
  projectList,
} from '@/composables/useReimDictData'

const route = useRoute()
const router = useRouter()

// ==================== 页面模式 ====================
const isEdit = ref(false)                // true=编辑已有草稿, false=新增
const mainId = ref<number | null>(null)  // 编辑时存 id
const pageLoading = ref(false)

// ==================== 基础信息表单 ====================
const basicForm = reactive<ReimburseSaveBody>({
  reimbursementTitle: '',
  businessTripReason: '',
  reimburserId: '',
  reimburserNo: '',
  reimburserName: '',
  reimDepartmentId: '',
  reimDepartmentNo: '',
  reimDepartmentName: '',
  reimCompanyId: '',
  reimCompanyNo: '',
  reimCompanyName: '',
  businessTypeId: '',
  businessTypeNo: '',
  businessTypeName: '',
  remarks: '',
})

// ==================== 补录行程弹窗 ====================
const tripDialogVisible = ref(false)

interface TripForm {
  travelerId: string
  travelerNo: string
  travelerName: string
  originCityId: string
  originCityName: string
  destinationCityId: string
  destinationCityName: string
  startDate: string
  endDate: string
  tripDesc: string
}

const tripForm = reactive<TripForm>({
  travelerId: '',
  travelerNo: '',
  travelerName: '',
  originCityId: '',
  originCityName: '',
  destinationCityId: '',
  destinationCityName: '',
  startDate: '',
  endDate: '',
  tripDesc: '',
})

/** 新增的行程列表（暂存，提交时一起发送） */
const tripList = ref<TripForm[]>([])

// ==================== 费用分摊 ====================
interface AllocationForm {
  companyId: string
  companyName: string
  projectId: string
  projectName: string
  allocationRatio: number
}

const allocationList = ref<AllocationForm[]>([])

// ==================== 初始化 ====================
onMounted(async () => {
  await initDictData()

  // 路由参数含 id → 编辑模式
  const idParam = route.params.id
  if (idParam) {
    isEdit.value = true
    mainId.value = Number(idParam)
    await loadDetail(mainId.value)
  }
})

/** 加载报销单详情（编辑模式） */
async function loadDetail(id: number) {
  pageLoading.value = true
  try {
    const res = await getReimDetail(id)
    const m = res.data.main
    Object.assign(basicForm, {
      reimbursementTitle: m.reimbursementTitle,
      businessTripReason: m.businessTripReason,
      reimburserId: m.reimburserId,
      reimburserNo: m.reimburserNo,
      reimburserName: m.reimburserName,
      reimDepartmentId: m.reimDepartmentId,
      reimDepartmentNo: m.reimDepartmentNo,
      reimDepartmentName: m.reimDepartmentName,
      reimCompanyId: m.reimCompanyId,
      reimCompanyNo: m.reimCompanyNo,
      reimCompanyName: m.reimCompanyName,
      businessTypeId: m.businessTypeId,
      businessTypeNo: m.businessTypeNo,
      businessTypeName: m.businessTypeName,
      remarks: m.remarks,
      version: m.version,
    })
  } catch {
    // 错误已由拦截器处理
  } finally {
    pageLoading.value = false
  }
}

// ==================== 下拉联动（选中后同步 name/no） ====================

/** 选中报销人时联动填充工号和姓名 */
function onReimburserSelect(employeeId: string) {
  const emp = employeeList.value.find((e) => e.employeeId === employeeId)
  if (emp) {
    basicForm.reimburserNo = emp.employeeNo
    basicForm.reimburserName = emp.employeeName
  }
}

/** 选中部门时联动填充编号和名称 */
function onDepartmentSelect(deptId: string) {
  const dept = departmentList.value.find((d) => d.departmentId === deptId)
  if (dept) {
    basicForm.reimDepartmentNo = dept.departmentNo
    basicForm.reimDepartmentName = dept.departmentName
  }
}

/** 选中公司时联动填充编号和名称 */
function onCompanySelect(companyId: string) {
  const comp = companyList.value.find((c) => c.companyId === companyId)
  if (comp) {
    basicForm.reimCompanyNo = comp.companyNo
    basicForm.reimCompanyName = comp.companyName
  }
}

/** 选中业务类型时联动填充编号和名称 */
function onBusinessTypeSelect(bizTypeId: string) {
  // 从树形数据中递归查找
  function findNode(nodes: typeof businessTypeTreeData.value, id: string): any {
    for (const node of nodes) {
      if (node.value === id) return node._raw
      if (node.children) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return null
  }
  const raw = findNode(businessTypeTreeData.value, bizTypeId)
  if (raw) {
    basicForm.businessTypeNo = raw.businessTypeNo || ''
    basicForm.businessTypeName = raw.businessTypeName || ''
  }
}

// ==================== 补录行程弹窗 ====================

function openTripDialog() {
  // 重置表单
  Object.assign(tripForm, {
    travelerId: '', travelerNo: '', travelerName: '',
    originCityId: '', originCityName: '',
    destinationCityId: '', destinationCityName: '',
    startDate: '', endDate: '', tripDesc: '',
  })
  tripDialogVisible.value = true
}

/** 出行人选中联动 */
function onTravelerSelect(empId: string) {
  const emp = employeeList.value.find((e) => e.employeeId === empId)
  if (emp) {
    tripForm.travelerNo = emp.employeeNo
    tripForm.travelerName = emp.employeeName
  }
}

/** 出发城市选中联动 */
function onOriginCitySelect(cityNo: string) {
  const city = cityList.value.find((c) => c.cityNo === cityNo)
  if (city) tripForm.originCityName = city.cityName
}

/** 到达城市选中联动 */
function onDestCitySelect(cityNo: string) {
  const city = cityList.value.find((c) => c.cityNo === cityNo)
  if (city) tripForm.destinationCityName = city.cityName
}

function addTrip() {
  if (!tripForm.travelerId || !tripForm.originCityId || !tripForm.destinationCityId || !tripForm.startDate || !tripForm.endDate) {
    ElMessage.warning('请填写完整的行程信息')
    return
  }
  if (tripForm.endDate < tripForm.startDate) {
    ElMessage.warning('到达日期不可早于出发日期')
    return
  }
  tripList.value.push({ ...tripForm })
  tripDialogVisible.value = false
  ElMessage.success('行程添加成功')
}

function removeTrip(index: number) {
  tripList.value.splice(index, 1)
}

// ==================== 费用分摊 ====================

function addAllocationRow() {
  allocationList.value.push({
    companyId: '',
    companyName: '',
    projectId: '',
    projectName: '',
    allocationRatio: 0,
  })
}

function onAllocCompanySelect(idx: number, companyId: string) {
  const comp = companyList.value.find((c) => c.companyId === companyId)
  if (comp) allocationList.value[idx].companyName = comp.companyName
}

function onAllocProjectSelect(idx: number, projectId: string) {
  const proj = projectList.value.find((p) => p.projectId === projectId)
  if (proj) allocationList.value[idx].projectName = proj.projectName
}

function removeAllocationRow(idx: number) {
  allocationList.value.splice(idx, 1)
}

// ==================== 保存草稿 ====================
const saving = ref(false)

async function handleSaveDraft() {
  if (!basicForm.reimbursementTitle) {
    ElMessage.warning('请输入报销标题')
    return
  }
  saving.value = true
  try {
    if (isEdit.value && mainId.value) {
      await updateReim(mainId.value, basicForm)
      ElMessage.success('草稿已更新')
    } else {
      const res = await createReim(basicForm)
      mainId.value = res.data.id
      isEdit.value = true
      ElMessage.success('草稿已保存')
    }
  } catch {
    // 错误已由拦截器处理
  } finally {
    saving.value = false
  }
}

function handleBack() {
  router.push({ name: 'reimburseList' })
}
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="edit-container" v-loading="pageLoading || dictLoading">
      <!-- ===== 顶部导航 ===== -->
      <div class="page-header">
        <el-button :icon="ArrowLeft" @click="handleBack">返回列表</el-button>
        <span class="page-title">{{ isEdit ? '编辑报销单' : '新增报销单' }}</span>
      </div>

      <!-- ===== 基础信息分区 ===== -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">基础信息</span>
        </template>

        <el-form :model="basicForm" label-width="120px" class="basic-form">
          <el-row :gutter="20">
            <!-- 报销标题 -->
            <el-col :span="12">
              <el-form-item label="报销标题" required>
                <el-input
                  v-model="basicForm.reimbursementTitle"
                  placeholder="请输入报销标题（不超过200字）"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-col>

            <!-- 业务类型：树形下拉选择器（el-tree-select） -->
            <el-col :span="12">
              <el-form-item label="业务类型" required>
                <el-tree-select
                  v-model="basicForm.businessTypeId"
                  :data="businessTypeTreeData"
                  placeholder="请选择"
                  check-strictly
                  default-expand-all
                  style="width: 100%"
                  @update:model-value="onBusinessTypeSelect"
                />
              </el-form-item>
            </el-col>

            <!-- 费用归属公司：普通下拉 el-select -->
            <el-col :span="12">
              <el-form-item label="费用归属公司" required>
                <el-select
                  v-model="basicForm.reimCompanyId"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  @change="onCompanySelect"
                >
                  <el-option
                    v-for="item in companyList"
                    :key="item.companyId"
                    :label="item.companyName"
                    :value="item.companyId"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <!-- 报销部门 -->
            <el-col :span="12">
              <el-form-item label="报销部门" required>
                <el-select
                  v-model="basicForm.reimDepartmentId"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  @change="onDepartmentSelect"
                >
                  <el-option
                    v-for="item in departmentList"
                    :key="item.departmentId"
                    :label="item.departmentName"
                    :value="item.departmentId"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <!-- 报销人 -->
            <el-col :span="12">
              <el-form-item label="报销人" required>
                <el-select
                  v-model="basicForm.reimburserId"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  @change="onReimburserSelect"
                >
                  <el-option
                    v-for="item in employeeList"
                    :key="item.employeeId"
                    :label="item.employeeName"
                    :value="item.employeeId"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <!-- 出差事由 -->
            <el-col :span="12">
              <el-form-item label="出差事由">
                <el-input
                  v-model="basicForm.businessTripReason"
                  placeholder="请输入出差事由（不超过500字）"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
            </el-col>

            <!-- 备注 -->
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input
                  v-model="basicForm.remarks"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注信息（不超过1000字）"
                  maxlength="1000"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="form-actions">
            <el-button type="primary" :loading="saving" @click="handleSaveDraft">
              保存草稿
            </el-button>
          </div>
        </el-form>
      </el-card>

      <!-- ===== 补录行程分区 ===== -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <div class="section-header">
            <span class="section-title">补录行程</span>
            <el-button type="primary" :icon="Plus" size="small" @click="openTripDialog">
              新增行程
            </el-button>
          </div>
        </template>

        <!-- 已添加行程列表 -->
        <el-table v-if="tripList.length > 0" :data="tripList" border size="small">
          <el-table-column type="index" label="序号" width="50" />
          <el-table-column prop="travelerName" label="出行人" width="100" />
          <el-table-column prop="originCityName" label="出发城市" width="120" />
          <el-table-column prop="destinationCityName" label="到达城市" width="120" />
          <el-table-column prop="startDate" label="出发日期" width="120" />
          <el-table-column prop="endDate" label="到达日期" width="120" />
          <el-table-column prop="tripDesc" label="行程说明" min-width="160" show-overflow-tooltip />
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" :icon="Delete" @click="removeTrip($index)" />
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无行程，请点击「新增行程」添加" :image-size="60" />
      </el-card>

      <!-- ===== 费用归属及分摊分区 ===== -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <div class="section-header">
            <span class="section-title">费用归属及分摊</span>
            <el-button type="primary" :icon="Plus" size="small" @click="addAllocationRow">
              新增分摊
            </el-button>
          </div>
        </template>

        <el-table v-if="allocationList.length > 0" :data="allocationList" border size="small">
          <el-table-column type="index" label="序号" width="50" />
          <el-table-column label="费用归属公司" width="200">
            <template #default="{ row, $index }">
              <el-select
                v-model="row.companyId"
                placeholder="请选择"
                clearable
                style="width: 100%"
                @change="(val: string) => onAllocCompanySelect($index, val)"
              >
                <el-option
                  v-for="item in companyList"
                  :key="item.companyId"
                  :label="item.companyName"
                  :value="item.companyId"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="项目" width="200">
            <template #default="{ row, $index }">
              <el-select
                v-model="row.projectId"
                placeholder="请选择"
                clearable
                style="width: 100%"
                @change="(val: string) => onAllocProjectSelect($index, val)"
              >
                <el-option
                  v-for="item in projectList"
                  :key="item.projectId"
                  :label="item.projectName"
                  :value="item.projectId"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="分摊比例(%)" width="140">
            <template #default="{ row }">
              <el-input-number
                v-model="row.allocationRatio"
                :min="0"
                :max="100"
                :precision="2"
                size="small"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" :icon="Delete" @click="removeAllocationRow($index)" />
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无分摊信息" :image-size="60" />
      </el-card>

      <!-- ===== 补录行程弹窗 ===== -->
      <el-dialog
        v-model="tripDialogVisible"
        title="补录行程"
        width="580px"
        :close-on-click-modal="false"
      >
        <el-form :model="tripForm" label-width="100px">
          <el-form-item label="出行人" required>
            <el-select
              v-model="tripForm.travelerId"
              placeholder="请选择出行人"
              clearable
              style="width: 100%"
              @change="onTravelerSelect"
            >
              <el-option
                v-for="item in employeeList"
                :key="item.employeeId"
                :label="item.employeeName"
                :value="item.employeeId"
              />
            </el-select>
          </el-form-item>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="出发城市" required>
                <el-select
                  v-model="tripForm.originCityId"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  @change="onOriginCitySelect"
                >
                  <el-option
                    v-for="item in cityList"
                    :key="item.cityNo"
                    :label="item.cityName"
                    :value="item.cityNo"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="到达城市" required>
                <el-select
                  v-model="tripForm.destinationCityId"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  @change="onDestCitySelect"
                >
                  <el-option
                    v-for="item in cityList"
                    :key="item.cityNo"
                    :label="item.cityName"
                    :value="item.cityNo"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="出发日期" required>
                <el-date-picker
                  v-model="tripForm.startDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="到达日期" required>
                <el-date-picker
                  v-model="tripForm.endDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="行程说明">
            <el-input
              v-model="tripForm.tripDesc"
              type="textarea"
              :rows="2"
              placeholder="请输入行程说明（不超过500字）"
              maxlength="500"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="tripDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addTrip">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </el-config-provider>
</template>

<style scoped>
.edit-container {
  padding: 16px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

/* ---- 顶部导航 ---- */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* ---- 分区卡片 ---- */
.section-card {
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ---- 表单 ---- */
.basic-form {
  margin-top: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

/* ---- 表格内下拉 ---- */
:deep(.el-table .el-select) {
  width: 100%;
}
</style>
