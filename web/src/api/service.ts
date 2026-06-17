import { get, post, put, del } from './client'
import type {
  Company,
  Department,
  Employee,
  City,
  Project
} from '@/types/models'
import type {
  BackendReimMain,
  BackendReimDetail,
  BackendTripDTO,
  BackendSubsidyCalendar,
  BackendCalendarDTO,
  BackendAllocationDTO,
  CompanyItem,
  DepartmentItem,
  EmployeeItem,
  BusinessTypeNode,
  CityItem,
  ProjectItem,
} from './types'

// ── 基础数据 ──

export function fetchCompanies(): Promise<CompanyItem[]> {
  return get<CompanyItem[]>('/company/list')
}

export function fetchDepartments(): Promise<DepartmentItem[]> {
  return get<DepartmentItem[]>('/department/list')
}

export function fetchEmployees(): Promise<EmployeeItem[]> {
  return get<EmployeeItem[]>('/employee/list')
}

export function fetchBusinessTypes(): Promise<BusinessTypeNode[]> {
  return get<BusinessTypeNode[]>('/business-type/tree')
}

export function fetchCities(): Promise<CityItem[]> {
  return get<CityItem[]>('/city/list')
}

export function fetchProjects(): Promise<ProjectItem[]> {
  return get<ProjectItem[]>('/project/list')
}

// ── 报销单 CRUD ──

export function fetchReimDetail(id: number): Promise<BackendReimDetail> {
  return get<BackendReimDetail>(`/reim/${id}`)
}

export function createReim(data: Partial<BackendReimMain>): Promise<{ id: number }> {
  return post<{ id: number }>('/reim', data)
}

export function updateReim(id: number, data: Partial<BackendReimMain>): Promise<void> {
  return put<void>(`/reim/${id}`, data)
}

export function submitReim(id: number, version: number): Promise<void> {
  return put<void>(`/reim/${id}/submit`, { version })
}

export function voidReim(id: number, version: number): Promise<void> {
  return put<void>(`/reim/${id}/void`, { version })
}

export function deleteReim(id: number): Promise<void> {
  return del<void>(`/reim/${id}`)
}

// ── 行程管理 ──

export function addTrip(mainId: number, dto: BackendTripDTO): Promise<{ tripId: number; subsidyId: number }> {
  return post<{ tripId: number; subsidyId: number }>(`/reim/${mainId}/trip`, dto)
}

export function updateTrip(mainId: number, tripId: number, dto: BackendTripDTO): Promise<{ subsidyId: number }> {
  return put<{ subsidyId: number }>(`/reim/${mainId}/trip/${tripId}`, dto)
}

export function deleteTrip(mainId: number, tripId: number): Promise<void> {
  return del<void>(`/reim/${mainId}/trip/${tripId}`)
}

// ── 补助日历 ──

export function getCalendar(mainId: number, subsidyId: number): Promise<BackendSubsidyCalendar[]> {
  return get<BackendSubsidyCalendar[]>(`/reim/${mainId}/subsidy/${subsidyId}/calendar`)
}

export function updateCalendar(mainId: number, subsidyId: number, list: BackendCalendarDTO[]): Promise<void> {
  return put<void>(`/reim/${mainId}/subsidy/${subsidyId}/calendar`, list)
}

// ── 费用分摊 ──

export function getAllocation(mainId: number): Promise<BackendAllocationDTO[]> {
  return get<BackendAllocationDTO[]>(`/reim/${mainId}/allocation`)
}

export function updateAllocation(mainId: number, list: BackendAllocationDTO[]): Promise<void> {
  return put<void>(`/reim/${mainId}/allocation`, list)
}

export function equalSplit(mainId: number, list: BackendAllocationDTO[]): Promise<BackendAllocationDTO[]> {
  return put<BackendAllocationDTO[]>(`/reim/${mainId}/allocation/equal-split`, list)
}
