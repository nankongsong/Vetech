// 全局类型定义

export interface Company {
  reimCompanyId: string
  reimCompanyNo: string
  reimCompanyName: string
}

export interface Department {
  reimDepartmentId: string
  reimDepartmentNo: string
  reimDepartmentName: string
}

export interface Employee {
  reimburserId: string
  reimburserNo: string
  reimburserName: string
}

export interface BusinessType {
  businessTypeId: string
  businessTypeNo: string
  businessTypeName: string
  thereSubordinateNode: '0' | '1'
  superiorId: string
}

export interface BusinessTypeNode extends BusinessType {
  children: BusinessTypeNode[]
}

export interface City {
  cityNo: string
  cityName: string
  cityType: '1' | '2' | '3' // 1:一线 2:二线 3:三线
}

export interface Project {
  projectId: string
  projectNo: string
  projectName: string
}

// 单据状态
export type DocStatus = 'draft' | 'done' | 'void'

// 行程
export interface Trip {
  id: string
  reimburserId: string
  startCity: string
  endCity: string
  startDate: string
  endDate: string
  description: string
}

// 补助日历单格
export interface SubsidyItem {
  checked: boolean
  std: number
  value: number
}

// 补助日历单行
export interface SubsidyRow {
  date: string
  meal: SubsidyItem
  traffic: SubsidyItem
  comm: SubsidyItem
}

// 补助信息
export interface Subsidy {
  id: string
  tripId: string
  reimburserId: string
  startDate: string
  endDate: string
  days: number
  startCity: string
  endCity: string
  subsidyCity: string
  applyAmount: number
  subsidyAmount: number
  calendar: SubsidyRow[]
}

// 费用分摊
export interface Allocation {
  id: string
  company: string
  project: string
  ratio: number // 0~1
  amount: number
}

// 基础信息
export interface BasicInfo {
  title: string
  reimburser: string
  department: string
  reimCompany: string
  businessType: string
  reason: string
}

// 单据元信息
export interface DocMeta {
  title: string
  submitDate: string
}

// UI 状态
export interface UiState {
  collapsed: Record<string, boolean>
}

// 弹窗模式
export type TripMode = 'add' | 'edit' | 'copy'

// 确认弹窗类型
export type ConfirmType = 'info' | 'warning'
