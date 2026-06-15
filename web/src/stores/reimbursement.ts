// 报销单 Pinia store
import { defineStore } from 'pinia'
import type {
  BasicInfo,
  DocMeta,
  Trip,
  Subsidy,
  SubsidyRow,
  Allocation,
  UiState,
  Company,
  Department,
  Employee,
  City,
  Project,
  BusinessType
} from '@/types/models'
import { cityMealStandard, cityTrafficStandard, cityCommStandard } from '@/data/mock'
import { dateRange, diffDays } from '@/utils/format'
import { uid } from '@/utils/id'
import {
  fetchCompanies,
  fetchDepartments,
  fetchEmployees,
  fetchBusinessTypes,
  fetchCities,
  fetchProjects
} from '@/api/service'

interface ReimbursementState {
  meta: DocMeta
  basic: BasicInfo
  trips: Trip[]
  subsidies: Subsidy[]
  allocation: Allocation[]
  remark: string
  ui: UiState
  // 基础数据
  companies: Company[]
  departments: Department[]
  employees: Employee[]
  cities: City[]
  projects: Project[]
  businessTypes: BusinessType[]
}

function buildSubsidyFromTrip(tripId: string, trip: Trip, state: ReimbursementState): Subsidy {
  return {
    id: uid('s'),
    tripId,
    reimburserId: trip.reimburserId,
    startDate: trip.startDate,
    endDate: trip.endDate,
    days: diffDays(trip.startDate, trip.endDate),
    startCity: trip.startCity,
    endCity: trip.endCity,
    subsidyCity: trip.endCity,
    applyAmount: 0,
    subsidyAmount: 0,
    calendar: buildDefaultCalendar(trip, (cn) => getCityType(state, cn))
  }
}

function buildDefaultCalendar(trip: Trip, getCityType: (cityNo: string) => '1' | '2' | '3'): SubsidyRow[] {
  const dates = dateRange(trip.startDate, trip.endDate)
  const ct = getCityType(trip.endCity)
  const mealStd = cityMealStandard(ct)
  const trafficStd = cityTrafficStandard()
  const commStd = cityCommStandard()
  return dates.map(d => ({
    date: d,
    meal: { checked: false, std: mealStd, value: mealStd },
    traffic: { checked: false, std: trafficStd, value: trafficStd },
    comm: { checked: false, std: commStd, value: commStd }
  }))
}

/** 从 store state 中获取城市类型 */
function getCityType(state: ReimbursementState, cityNo: string): '1' | '2' | '3' {
  const c = state.cities.find(x => x.cityNo === cityNo)
  return c?.cityType ?? '3'
}

export const useReimbursementStore = defineStore('reimbursement', {
  state: (): ReimbursementState => {
    const initTrip: Trip = {
      id: 't_1',
      reimburserId: '13AB3A3F72409002',
      startCity: '10458',
      endCity: '10119',
      startDate: '2026-04-13',
      endDate: '2026-04-17',
      description: '行程说明'
    }
    return {
      meta: { title: '差旅费用报销单', submitDate: '2026-04-23' },
      basic: {
        title: '徐年年项目出差',
        reimburser: '13AB3A3F72409002',
        department: '',
        reimCompany: '',
        businessType: '1B5FEB7DD4396000',
        reason: ''
      },
      trips: [initTrip],
      subsidies: [{
        id: 's_1',
        tripId: initTrip.id,
        reimburserId: initTrip.reimburserId,
        startDate: initTrip.startDate,
        endDate: initTrip.endDate,
        days: diffDays(initTrip.startDate, initTrip.endDate),
        startCity: initTrip.startCity,
        endCity: initTrip.endCity,
        subsidyCity: initTrip.endCity,
        applyAmount: 0,
        subsidyAmount: 0,
        calendar: buildDefaultCalendar(initTrip, (_cn) => '1')
      }],
      allocation: [
        { id: 'a_1', company: '成本中心-管理层类', project: '', ratio: 1.0, amount: 0 }
      ],
      remark: '',
      ui: { collapsed: { basic: false, trip: false, subsidy: false, total: false, allocation: false, remark: false } },
      // 基础数据（初始为空，由 loadBaseData 填充）
      companies: [],
      departments: [],
      employees: [],
      cities: [],
      projects: [],
      businessTypes: []
    }
  },

  getters: {
    /** 补助总金额 */
    subsidyTotal: (state) => state.subsidies.reduce((s, x) => s + Number(x.subsidyAmount || 0), 0),
    /** 餐费合计 */
    mealTotal: (state) => state.subsidies.reduce((s, x) => {
      return s + (x.calendar || []).reduce((a, r) => a + (r.meal.checked ? Number(r.meal.value || 0) : 0), 0)
    }, 0),
    /** 交通合计 */
    trafficTotal: (state) => state.subsidies.reduce((s, x) => {
      return s + (x.calendar || []).reduce((a, r) => a + (r.traffic.checked ? Number(r.traffic.value || 0) : 0), 0)
    }, 0),
    /** 通讯合计 */
    commTotal: (state) => state.subsidies.reduce((s, x) => {
      return s + (x.calendar || []).reduce((a, r) => a + (r.comm.checked ? Number(r.comm.value || 0) : 0), 0)
    }, 0),
    /** 分摊金额合计 */
    allocTotal: (state) => state.allocation.reduce((s, r) => s + Number(r.amount || 0), 0)
  },

  actions: {
    setBasic(patch: Partial<BasicInfo>) {
      Object.assign(this.basic, patch)
    },

    addTrip(trip: Omit<Trip, 'id'>) {
      const id = uid('t')
      this.trips.push({ id, ...trip })
      this.subsidies.push(buildSubsidyFromTrip(id, { id, ...trip }, this))
    },

    updateTrip(id: string, patch: Partial<Omit<Trip, 'id'>>) {
      const idx = this.trips.findIndex(t => t.id === id)
      if (idx === -1) return
      Object.assign(this.trips[idx], patch)
      const subIdx = this.subsidies.findIndex(s => s.tripId === id)
      if (subIdx !== -1) {
        this.subsidies[subIdx] = buildSubsidyFromTrip(id, this.trips[idx], this)
      }
    },

    deleteTrip(id: string) {
      this.trips = this.trips.filter(t => t.id !== id)
      this.subsidies = this.subsidies.filter(s => s.tripId !== id)
    },

    copyTrip(id: string) {
      const src = this.trips.find(t => t.id === id)
      if (!src) return
      const newId = uid('t')
      const clone: Trip = { ...src, id: newId }
      this.trips.push(clone)
      this.subsidies.push(buildSubsidyFromTrip(newId, clone, this))
    },

    updateSubsidyCalendar(subId: string, calendar: SubsidyRow[]) {
      const sub = this.subsidies.find(s => s.id === subId)
      if (!sub) return
      sub.calendar = calendar
      let apply = 0
      let actual = 0
      calendar.forEach(r => {
        if (r.meal.checked) { apply += r.meal.std; actual += Number(r.meal.value || 0) }
        if (r.traffic.checked) { apply += r.traffic.std; actual += Number(r.traffic.value || 0) }
        if (r.comm.checked) { apply += r.comm.std; actual += Number(r.comm.value || 0) }
      })
      sub.applyAmount = Math.round(apply * 100) / 100
      sub.subsidyAmount = Math.round(actual * 100) / 100
      this.syncAllocationAmounts()
    },

    /** 同步分摊金额 = 补助总金额 × 比例 */
    syncAllocationAmounts() {
      const total = this.subsidyTotal
      this.allocation = this.allocation.map(a => ({
        ...a,
        amount: Math.round(a.ratio * total * 100) / 100
      }))
    },

    setAllocation(list: Allocation[]) {
      this.allocation = list
    },

    addAllocationRow() {
      const n = this.allocation.length + 1
      const total = this.subsidyTotal
      // 均摊：新行自动获得均等比例
      const evenRatio = Math.floor((1 / n) * 10000) / 10000
      // 重新计算所有行比例
      const list = this.allocation.map((a, i) => {
        if (i === 0) {
          const otherSum = (n - 1) * evenRatio
          return { ...a, ratio: Math.max(0, 1 - otherSum), amount: Math.max(0, 1 - otherSum) * total }
        }
        return { ...a, ratio: evenRatio, amount: evenRatio * total }
      })
      list.push({ id: uid('a'), company: '', project: '', ratio: evenRatio, amount: evenRatio * total })
      this.allocation = list
    },

    setRemark(text: string) {
      this.remark = text
    },

    togglePanel(key: string) {
      this.ui.collapsed[key] = !this.ui.collapsed[key]
    },

    /** 并行加载所有基础数据 */
    async loadBaseData() {
      const [companies, departments, employees, btRaw, cities, projects] = await Promise.all([
        fetchCompanies(),
        fetchDepartments(),
        fetchEmployees(),
        fetchBusinessTypes(),
        fetchCities(),
        fetchProjects()
      ])
      this.companies = (companies as any[]).map((c: any) => ({
        reimCompanyId: c.companyId,
        reimCompanyNo: c.companyNo,
        reimCompanyName: c.companyName
      }))
      this.departments = (departments as any[]).map((d: any) => ({
        reimDepartmentId: d.departmentId,
        reimDepartmentNo: d.departmentNo,
        reimDepartmentName: d.departmentName
      }))
      this.employees = (employees as any[]).map((e: any) => ({
        reimburserId: e.employeeId,
        reimburserNo: e.employeeNo,
        reimburserName: e.employeeName
      }))
      // 后端 BusinessTypeTreeVO 字段 → 前端 BusinessType 字段映射
      this.businessTypes = (btRaw as any[]).map((bt: any) => ({
        businessTypeId: bt.businessTypeId,
        businessTypeNo: bt.businessTypeNo,
        businessTypeName: bt.businessTypeName,
        thereSubordinateNode: (bt.hasSubordinate === 1 || bt.hasSubordinate === true ? '1' : '0') as '0' | '1',
        superiorId: bt.superiorId
      }))
      // cityType: Integer → string union
      this.cities = (cities as any[]).map((c: any) => ({
        cityNo: c.cityNo,
        cityName: c.cityName,
        cityType: String(c.cityType) as '1' | '2' | '3'
      }))
      this.projects = projects
    }
  }
})
