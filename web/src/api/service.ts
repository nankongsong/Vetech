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
} from './types'

// ── 基础数据 ──

export function fetchCompanies(): Promise<Company[]> {
  return get<Company[]>('/company/list')
}

export function fetchDepartments(): Promise<Department[]> {
  return get<Department[]>('/department/list')
}

export function fetchEmployees(): Promise<Employee[]> {
  return get<Employee[]>('/employee/list')
}

export function fetchBusinessTypes(): Promise<any[]> {
  return get<any[]>('/business-type/tree')
}

export function fetchCities(): Promise<City[]> {
  return get<City[]>('/city/list')
}

export function fetchProjects(): Promise<Project[]> {
  return get<Project[]>('/project/list')
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

export function addTrip(mainId: number, dto: BackendTripDTO): Promise<void> {
  return post<void>(`/reim/${mainId}/trip`, dto)
}

export function updateTrip(mainId: number, tripId: number, dto: BackendTripDTO): Promise<void> {
  return put<void>(`/reim/${mainId}/trip/${tripId}`, dto)
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
