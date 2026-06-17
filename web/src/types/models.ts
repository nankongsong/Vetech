/** 前端领域模型类型定义 — 与 Pinia store 及组件 props 严格对齐 */

export interface BasicInfo {
  title: string
  reimbursement: string
  department: string
  reimCompany: string
  businessType: string
  reason: string
}

export interface DocMeta {
  title: string
  submitDate: string
}

export interface Trip {
  id: string
  reimbursementId: string
  startCity: string
  endCity: string
  startDate: string   // 'YYYY-MM-DD'
  endDate: string     // 'YYYY-MM-DD'
  description: string
}

export type TripMode = 'add' | 'edit' | 'copy'

export interface SubsidyRow {
  date: string
  meal: { checked: boolean; std: number; value: number }
  traffic: { checked: boolean; std: number; value: number }
  comm: { checked: boolean; std: number; value: number }
}

export interface Subsidy {
  id: string
  tripId: string
  reimbursementId: string
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

export interface Allocation {
  id: string
  company: string
  project: string
  ratio: number
  amount: number
}

export interface UiState {
  collapsed: Record<string, boolean>
  readonly: boolean
}

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
  reimbursementId: string
  reimbursementNo: string
  reimbursementName: string
}

export interface City {
  cityNo: string
  cityName: string
  cityType: '1' | '2' | '3'
}

export interface Project {
  projectId: string
  projectNo: string
  projectName: string
}

export interface BusinessType {
  businessTypeId: string
  businessTypeNo: string
  businessTypeName: string
  thereSubordinateNode: '0' | '1'
  superiorId: string
}
