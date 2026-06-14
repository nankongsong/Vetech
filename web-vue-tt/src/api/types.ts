// 后端 API 类型定义 —— 与 Java Entity/DTO 一一映射

// ── 报销单头 ──

export interface BackendReimMain {
  id?: number
  reimbursementNo?: string
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
  status: number          // 0=draft, 1=done, 2=void
  version: number
  creationTime?: string
  updateTime?: string
}

// ── 行程 ──

export interface BackendTripDTO {
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
  sortOrder?: number
}

// ── 补助信息 ──

export interface BackendSubsidy {
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
}

// ── 补助日历单条 ──

export interface BackendSubsidyCalendar {
  id: number
  subsidyId: number
  subsidyDate: string
  dayOfWeek: string
  mealStandard: number
  transportStandard: number
  phoneStandard: number
  isMealSelected: number
  isTransportSelected: number
  isPhoneSelected: number
  mealApplyAmount: number
  transportApplyAmount: number
  phoneApplyAmount: number
}

// ── 日历更新 DTO（前端 → 后端） ──

export interface BackendCalendarDTO {
  id?: number
  isMealSelected: number
  isTransportSelected: number
  isPhoneSelected: number
  mealApplyAmount: number
  transportApplyAmount: number
  phoneApplyAmount: number
}

// ── 费用分摊 ──

export interface BackendAllocationDTO {
  id?: number
  companyId: string
  companyNo: string
  companyName: string
  projectId: string
  projectNo: string
  projectName: string
  allocationRatio: number
  allocationAmount?: number
  sortOrder: number
}

// ── 报销详情聚合 VO ──

export interface BackendReimDetail {
  main: BackendReimMain
  trips: BackendTripDTO[]
  subsidies: BackendSubsidy[]
  allocations: BackendAllocationDTO[]
}
