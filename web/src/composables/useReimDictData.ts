/**
 * 差旅报销单 —— 下拉数据源 Composable
 * 优先从后端 API 拉取数据，API 不可用时自动降级为静态数据
 * 业务类型静态数据为扁平数组，自动调用 buildBusinessTypeTree 转为树形结构
 */
import { ref, computed } from 'vue'
import {
  getCompanyList,
  getDepartmentList,
  getEmployeeList,
  getBusinessTypeTree,
  getCityList,
  getProjectList,
  type CompanyItem,
  type DepartmentItem,
  type EmployeeItem,
  type BusinessTypeNode,
  type CityItem,
  type ProjectItem,
} from '@/api/reimburse'
import {
  STATIC_COMPANY_DATA,
  STATIC_DEPARTMENT_DATA,
  STATIC_EMPLOYEE_DATA,
  STATIC_BUSINESS_TYPE_FLAT,
  STATIC_CITY_DATA,
  STATIC_PROJECT_DATA,
} from '@/utils/reimStaticData'
import { buildBusinessTypeTree, type TreeNode } from '@/utils/treeUtils'

// ==================== 响应式状态 ====================

/** 费用归属公司列表 */
export const companyList = ref<CompanyItem[]>([])

/** 报销部门列表 */
export const departmentList = ref<DepartmentItem[]>([])

/** 员工（报销人/出行人）列表 */
export const employeeList = ref<EmployeeItem[]>([])

/** 业务类型树形数据（已转为 el-tree-select 可用结构） */
export const businessTypeTreeData = ref<TreeNode[]>([])

/** 城市列表 */
export const cityList = ref<CityItem[]>([])

/** 项目列表 */
export const projectList = ref<ProjectItem[]>([])

/** 是否正在加载基础数据 */
export const dictLoading = ref(false)

/** 是否已初始化 */
export const dictReady = ref(false)

// ==================== 初始化（页面挂载时调用一次即可） ====================

/**
 * 从后端 API 加载全部基础数据。
 * 若某个接口失败，自动降级为静态 Mock 数据（来源于设计文档 5.3 节）。
 *
 * @example
 * // 在页面 <script setup> 中：
 * import { initDictData, businessTypeTreeData, companyList, ... } from '@/composables/useReimDictData'
 * onMounted(() => initDictData())
 */
export async function initDictData() {
  if (dictReady.value) return // 避免重复初始化
  dictLoading.value = true

  // 并行请求 6 个基础数据接口
  const results = await Promise.allSettled([
    getCompanyList(),
    getDepartmentList(),
    getEmployeeList(),
    getBusinessTypeTree(),
    getCityList(),
    getProjectList(),
  ])

  // 费用归属公司
  if (results[0].status === 'fulfilled') {
    companyList.value = results[0].value.data
  } else {
    console.warn('[useReimDictData] 公司列表 API 失败，降级为静态数据')
    companyList.value = STATIC_COMPANY_DATA as CompanyItem[]
  }

  // 报销部门
  if (results[1].status === 'fulfilled') {
    departmentList.value = results[1].value.data
  } else {
    console.warn('[useReimDictData] 部门列表 API 失败，降级为静态数据')
    departmentList.value = STATIC_DEPARTMENT_DATA as DepartmentItem[]
  }

  // 员工
  if (results[2].status === 'fulfilled') {
    employeeList.value = results[2].value.data
  } else {
    console.warn('[useReimDictData] 员工列表 API 失败，降级为静态数据')
    employeeList.value = STATIC_EMPLOYEE_DATA as EmployeeItem[]
  }

  // 业务类型 — 后端返回扁平数组（不含children），需用 buildBusinessTypeTree 转树形
  if (results[3].status === 'fulfilled') {
    const apiData = results[3].value.data
    if (apiData && apiData.length > 0) {
      const isTree = apiData.some((n: BusinessTypeNode) => n.children && n.children.length > 0)
      if (isTree) {
        businessTypeTreeData.value = mapApiTreeToTreeNode(apiData)
      } else {
        businessTypeTreeData.value = buildBusinessTypeTree(apiData)
      }
    }
  } else {
    console.warn('[useReimDictData] 业务类型 API 失败，降级为静态数据（自动扁平→树形）')
    businessTypeTreeData.value = buildBusinessTypeTree(STATIC_BUSINESS_TYPE_FLAT)
  }

  // 城市
  if (results[4].status === 'fulfilled') {
    cityList.value = results[4].value.data
  } else {
    console.warn('[useReimDictData] 城市列表 API 失败，降级为静态数据')
    cityList.value = STATIC_CITY_DATA as CityItem[]
  }

  // 项目
  if (results[5].status === 'fulfilled') {
    projectList.value = results[5].value.data
  } else {
    console.warn('[useReimDictData] 项目列表 API 失败，降级为静态数据')
    projectList.value = STATIC_PROJECT_DATA as ProjectItem[]
  }

  dictLoading.value = false
  dictReady.value = true
}

// ==================== 工具函数 ====================

/**
 * 将后端 API 返回的业务类型树（BusinessTypeNode[]）映射为 el-tree-select 所需的 TreeNode[]
 * 后端 children 已嵌套好，这里做字段名转换即可
 */
function mapApiTreeToTreeNode(apiNodes: BusinessTypeNode[]): TreeNode[] {
  if (!apiNodes || apiNodes.length === 0) return []

  return apiNodes.map((node) => {
    const hasChildren = node.children && node.children.length > 0
    return {
      value: node.businessTypeId,
      label: node.businessTypeName,
      children: hasChildren ? mapApiTreeToTreeNode(node.children!) : undefined,
      disabled: hasChildren || undefined,
      _raw: node,
    }
  })
}

// ==================== 便捷 computed（el-select 直接使用） ====================

/** 公司下拉选项（el-option 格式） */
export const companyOptions = computed(() =>
  companyList.value.map((c) => ({ label: c.companyName, value: c.companyId })),
)

/** 部门下拉选项 */
export const departmentOptions = computed(() =>
  departmentList.value.map((d) => ({ label: d.departmentName, value: d.departmentId })),
)

/** 员工下拉选项 */
export const employeeOptions = computed(() =>
  employeeList.value.map((e) => ({ label: e.employeeName, value: e.employeeId })),
)

/** 城市下拉选项 */
export const cityOptions = computed(() =>
  cityList.value.map((c) => ({ label: c.cityName, value: c.cityNo })),
)

/** 项目下拉选项 */
export const projectOptions = computed(() =>
  projectList.value.map((p) => ({ label: p.projectName, value: p.projectId })),
)
