/**
 * 差旅报销单模块 —— API 接口层
 * 严格对齐《差旅报销单_API接口文档 V1.0》
 * Base URL: http://localhost:8080
 * 统一响应: { code: 200, msg: "操作成功", data: ... }
 */
import request from '@/utils/request'

// ==================== 基础数据类型（对齐后端表结构） ====================

/** 公司 */
export interface CompanyItem {
  companyId: string
  companyNo: string
  companyName: string
}

/** 部门 */
export interface DepartmentItem {
  departmentId: string
  departmentNo: string
  departmentName: string
}

/** 员工 */
export interface EmployeeItem {
  employeeId: string
  employeeNo: string
  employeeName: string
}

/** 业务类型树节点 */
export interface BusinessTypeNode {
  businessTypeId: string
  businessTypeNo: string
  businessTypeName: string
  superiorId: string
  hasSubordinate: 0 | 1
  children?: BusinessTypeNode[]
}

/** 城市 */
export interface CityItem {
  cityNo: string
  cityName: string
  cityType: 1 | 2 | 3
}

/** 项目 */
export interface ProjectItem {
  projectId: string
  projectNo: string
  projectName: string
}

// ==================== 报销单列表 ====================

/** 分页查询请求参数（GET Query） */
export interface ReimbursePageQuery {
  /** 当前页码 */
  current: number
  /** 每页大小 */
  size: number
  /** 报销单号（模糊搜索） */
  reimbursementNo?: string
  /** 报销标题（模糊搜索） */
  title?: string
  /** 事由（模糊搜索） */
  reason?: string
  /** 费用归属公司ID */
  companyId?: string
  /** 报销部门ID */
  departmentId?: string
  /** 报销人ID */
  reimburserId?: string
  /** 业务类型ID */
  businessTypeId?: string
  /** 状态：0草稿/1已完成/2已作废 */
  status?: number
}

/** 列表单行记录（对齐后端 records[] 结构） */
export interface ReimburseListRow {
  /** 主键ID */
  id: number
  /** 报销单号 */
  reimbursementNo: string
  /** 报销标题 */
  reimbursementTitle: string
  /** 报销人姓名 */
  reimburserName: string
  /** 报销人工号 */
  reimburserNo: string
  /** 报销部门名称 */
  reimDepartmentName: string
  /** 报销部门编号 */
  reimDepartmentNo?: string
  /** 费用归属公司名称 */
  reimCompanyName: string
  /** 单据类型 */
  docType?: string
  /** 业务类型名称 */
  businessTypeName: string
  /** 出差事由 */
  businessTripReason: string
  /** 补助总金额 */
  subsidyTotal: number
  /** 状态：0草稿/1已完成/2已作废 */
  status: number
  /** 创建时间 (yyyy-MM-dd HH:mm:ss) */
  creationTime: string
}

/** 分页查询响应 data */
export interface ReimbursePageData {
  total: number
  pages: number
  current: number
  size: number
  records: ReimburseListRow[]
}

// ==================== 报销单详情 ====================

/** 报销单主信息（详情用，含全部字段） */
export interface ReimburseMain {
  id: number
  reimbursementNo: string
  reimbursementTitle: string
  businessTripReason: string
  reimburserId: string
  reimburserNo: string
  reimburserName: string
  reimDepartmentId: string
  reimDepartmentNo: string
  reimDepartmentName: string
  reimCompanyId: string
  reimCompanyNo: string
  reimCompanyName: string
  businessTypeId: string
  businessTypeNo: string
  businessTypeName: string
  subsidyTotal: number
  mealAllowance: number
  transportationAllowance: number
  phoneAllowance: number
  remarks: string
  status: number
  version: number
  creationTime: string
  updateTime: string
}

/** 行程明细 */
export interface ReimburseTrip {
  id: number
  mainId: number
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
  sortOrder: number
  creationTime: string
}

/** 补助信息 */
export interface ReimburseSubsidy {
  id: number
  mainId: number
  tripId: number
  travelerId: string
  travelerNo: string
  travelerName: string
  startDate: string
  endDate: string
  subsidyDays: number
  tripRoute: string
  subsidyCityId: string
  subsidyCityName: string
  applyAmount: number
  subsidyAmount: number
  creationTime: string
}

/** 补助日历 */
export interface SubsidyCalendar {
  id: number
  subsidyId: number
  subsidyDate: string
  dayOfWeek: string
  mealStandard: number
  transportStandard: number
  phoneStandard: number
  isMealSelected: 0 | 1
  isTransportSelected: 0 | 1
  isPhoneSelected: 0 | 1
  mealApplyAmount: number
  transportApplyAmount: number
  phoneApplyAmount: number
  subsidyAmount: number
  standardTotal: number
}

/** 费用分摊 */
export interface CostAllocation {
  id: number
  mainId: number
  companyId: string
  companyNo: string
  companyName: string
  projectId: string
  projectNo: string
  projectName: string
  allocationRatio: number
  allocationAmount: number
  sortOrder: number
  creationTime: string
}

/** 报销单详情 data */
export interface ReimburseDetailData {
  main: ReimburseMain
  trips: ReimburseTrip[]
  subsidies: ReimburseSubsidy[]
  allocations: CostAllocation[]
}

// ==================== 新增/更新 请求体 ====================

/** 新增/更新报销单请求体 */
export interface ReimburseSaveBody {
  reimbursementTitle?: string
  businessTripReason?: string
  reimburserId?: string
  reimburserNo?: string
  reimburserName?: string
  reimDepartmentId?: string
  reimDepartmentNo?: string
  reimDepartmentName?: string
  reimCompanyId?: string
  reimCompanyNo?: string
  reimCompanyName?: string
  businessTypeId?: string
  businessTypeNo?: string
  businessTypeName?: string
  remarks?: string
  /** 乐观锁版本号（更新时必传） */
  version?: number
}

// ==================== 统一响应体 ====================

export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

// ==================== 一、基础数据接口 ====================

/** 1.1 查询公司列表 */
export function getCompanyList(): Promise<ApiResponse<CompanyItem[]>> {
  return request.get('/company/list')
}

/** 1.2 查询部门列表 */
export function getDepartmentList(): Promise<ApiResponse<DepartmentItem[]>> {
  return request.get('/department/list')
}

/** 1.3 查询员工列表 */
export function getEmployeeList(): Promise<ApiResponse<EmployeeItem[]>> {
  return request.get('/employee/list')
}

/** 1.4 查询业务类型树 */
export function getBusinessTypeTree(): Promise<ApiResponse<BusinessTypeNode[]>> {
  return request.get('/business-type/tree')
}

/** 1.5 查询城市列表 */
export function getCityList(): Promise<ApiResponse<CityItem[]>> {
  return request.get('/city/list')
}

/** 1.6 查询项目列表 */
export function getProjectList(): Promise<ApiResponse<ProjectItem[]>> {
  return request.get('/project/list')
}

// ==================== 二、报销单接口 ====================

/** 2.1 分页查询报销单列表 */
export function getReimPage(query: ReimbursePageQuery): Promise<ApiResponse<ReimbursePageData>> {
  return request.get('/reim/page', { params: query })
}

/** 2.2 查询报销单详情 */
export function getReimDetail(id: number): Promise<ApiResponse<ReimburseDetailData>> {
  return request.get(`/reim/${id}`)
}

/** 2.3 新增报销单（保存草稿） */
export function createReim(body: ReimburseSaveBody): Promise<ApiResponse<{ id: number }>> {
  return request.post('/reim', body)
}

/** 2.4 更新报销单（保存草稿） */
export function updateReim(id: number, body: ReimburseSaveBody): Promise<ApiResponse<null>> {
  return request.put(`/reim/${id}`, body)
}

/** 2.5 提交报销单（草稿→已完成） */
export function submitReim(id: number, version: number): Promise<ApiResponse<{ success: boolean }>> {
  return request.put(`/reim/${id}/submit`, { version })
}

/** 2.6 作废报销单（已完成→已作废） */
export function voidReim(id: number, version: number): Promise<ApiResponse<null>> {
  return request.put(`/reim/${id}/void`, { version })
}

/** 2.7 删除草稿（物理删除） */
export function deleteReim(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/reim/${id}`)
}

// ==================== 三、行程管理接口 ====================

/** 行程请求体 */
export interface TripSaveBody {
  travelerId: string
  travelerNo: string
  travelerName: string
  originCityId: string
  originCityName: string
  destinationCityId: string
  destinationCityName: string
  startDate: string
  endDate: string
  tripDesc?: string
}

/** 3.1 新增行程 */
export function createTrip(
  mainId: number,
  body: TripSaveBody,
): Promise<ApiResponse<{ tripId: number; subsidyId: number }>> {
  return request.post(`/reim/${mainId}/trip`, body)
}

/** 3.2 更新行程 */
export function updateTrip(
  mainId: number,
  tripId: number,
  body: TripSaveBody,
): Promise<ApiResponse<null>> {
  return request.put(`/reim/${mainId}/trip/${tripId}`, body)
}

/** 3.3 删除行程 */
export function deleteTrip(mainId: number, tripId: number): Promise<ApiResponse<null>> {
  return request.delete(`/reim/${mainId}/trip/${tripId}`)
}

// ==================== 四、补助管理接口 ====================

/** 补助日历更新请求体 */
export interface CalendarUpdateBody {
  id: number
  isMealSelected: 0 | 1
  isTransportSelected: 0 | 1
  isPhoneSelected: 0 | 1
  mealApplyAmount: number
  transportApplyAmount: number
  phoneApplyAmount: number
}

/** 4.1 查询补助日历 */
export function getSubsidyCalendar(
  mainId: number,
  subsidyId: number,
): Promise<ApiResponse<{ subsidyId: number; calendarData: SubsidyCalendar[] }>> {
  return request.get(`/reim/${mainId}/subsidy/${subsidyId}/calendar`)
}

/** 4.2 更新补助日历 */
export function updateSubsidyCalendar(
  mainId: number,
  subsidyId: number,
  calendarData: CalendarUpdateBody[],
): Promise<ApiResponse<{ applyAmount: number; subsidyAmount: number }>> {
  return request.put(`/reim/${mainId}/subsidy/${subsidyId}/calendar`, { calendarData })
}

// ==================== 五、费用分摊接口 ====================

/** 分摊更新请求体 */
export interface AllocationUpdateItem {
  id?: number
  companyId: string
  projectId: string
  allocationRatio: number
  sortOrder: number
}

/** 5.1 查询分摊信息 */
export function getAllocationList(
  mainId: number,
): Promise<ApiResponse<{ mainId: number; allocations: CostAllocation[] }>> {
  return request.get(`/reim/${mainId}/allocation`)
}

/** 5.2 更新分摊信息 */
export function updateAllocation(
  mainId: number,
  allocations: AllocationUpdateItem[],
): Promise<ApiResponse<null>> {
  return request.put(`/reim/${mainId}/allocation`, { allocations })
}

/** 5.3 均摊计算 */
export function equalSplitAllocation(
  mainId: number,
  allocations: AllocationUpdateItem[],
): Promise<ApiResponse<{ allocations: CostAllocation[] }>> {
  return request.put(`/reim/${mainId}/allocation/equal-split`, { allocations })
}
