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
  BusinessType,
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
import type {
  CompanyItem,
  DepartmentItem,
  EmployeeItem,
  BusinessTypeNode,
  CityItem,
} from '@/api/types'

interface ReimbursementState {
  meta: DocMeta
  basic: BasicInfo
  trips: Trip[]
  subsidies: Subsidy[]
  allocation: Allocation[]
  remark: string
  ui: UiState
  /** 临时附件ID列表（status=0，保存/提交后确认） */
  tempAttachmentIds: number[]
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
    reimbursementId: trip.reimbursementId,
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
      reimbursementId: '13AB3A3F72409002',
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
        reimbursement: '13AB3A3F72409002',
        department: '',
        reimCompany: '',
        businessType: '1B5FEB7DD4396000',
        reason: ''
      },
      trips: [initTrip],
      subsidies: [{
        id: 's_1',
        tripId: initTrip.id,
        reimbursementId: initTrip.reimbursementId,
        startDate: initTrip.startDate,
        endDate: initTrip.endDate,
        days: diffDays(initTrip.startDate, initTrip.endDate),
        startCity: initTrip.startCity,
        endCity: initTrip.endCity,
        subsidyCity: initTrip.endCity,
        applyAmount: 0,
        subsidyAmount: 0,
        calendar: buildDefaultCalendar(initTrip, (_) => '1')
      }],
      allocation: [
        { id: 'a_1', company: '成本中心-管理层类', project: '', ratio: 1.0, amount: 0 }
      ],
      remark: '',
      ui: { collapsed: { basic: false, trip: false, subsidy: false, total: false, allocation: false, remark: false, attachment: false }, readonly: false },
      tempAttachmentIds: [],
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
      const total = this.subsidyTotal
      // 新增行默认：费用归属/项目为空，比例/金额为 0
      const newRow: Allocation = { id: uid('a'), company: '', project: '', ratio: 0, amount: 0 }
      const list = this.allocation.map(a => ({ ...a }))
      list.push(newRow)
      // 重算首行比例 = 1 - sum(row2+)
      const otherSum = list.slice(1).reduce((s, a) => s + a.ratio, 0)
      list[0].ratio = Math.max(0, Math.min(1, 1 - otherSum))
      // 同步所有行金额（四舍五入到分）
      list.forEach(a => { a.amount = Math.round(a.ratio * total * 100) / 100 })
      this.allocation = list
    },

    setRemark(text: string) {
      this.remark = text
    },

    /**
     * 根据 trips 重建/修复 subsidies
     * 解决从后端加载数据后 subsidy 中 startCity/endCity 为空、calendar 为空的问题
     */
    rebuildSubsidies() {
      const newSubsidies: Subsidy[] = []
      this.trips.forEach(trip => {
        const existing = this.subsidies.find(s => s.tripId === trip.id)
        if (existing) {
          // 已有 subsidy：用 trip 数据补齐缺失字段，重建日历
          newSubsidies.push({
            ...existing,
            startDate: trip.startDate,
            endDate: trip.endDate,
            days: diffDays(trip.startDate, trip.endDate),
            startCity: trip.startCity,
            endCity: trip.endCity,
            subsidyCity: trip.endCity,
            calendar: buildDefaultCalendar(trip, (cn) => getCityType(this, cn))
          })
        } else {
          // 没有 subsidy：用 trip 全新生成
          newSubsidies.push(buildSubsidyFromTrip(trip.id, trip, this))
        }
      })
      this.subsidies = newSubsidies
    },

    /** 重置表单状态（进入新增/编辑新报销单前调用） */
    resetForNewForm() {
      this.basic = {
        title: '',
        reimbursement: '',
        department: '',
        reimCompany: '',
        businessType: '',
        reason: ''
      }
      this.trips = []
      this.subsidies = []
      this.allocation = [
        { id: 'a_1', company: '', project: '', ratio: 1.0, amount: 0 }
      ]
      this.remark = ''
      this.meta = { title: '差旅费用报销单', submitDate: '' }
      this.ui.readonly = false
      this.clearTempAttachmentIds()
    },

    togglePanel(key: string) {
      this.ui.collapsed[key] = !this.ui.collapsed[key]
    },

    /** 添加临时附件ID */
    addTempAttachmentId(id: number) {
      if (!this.tempAttachmentIds.includes(id)) {
        this.tempAttachmentIds.push(id)
      }
    },

    /** 移除临时附件ID */
    removeTempAttachmentId(id: number) {
      this.tempAttachmentIds = this.tempAttachmentIds.filter(x => x !== id)
    },

    /** 清空临时附件ID */
    clearTempAttachmentIds() {
      this.tempAttachmentIds = []
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
      this.companies = companies.map((c: CompanyItem) => ({
        reimCompanyId: c.companyId,
        reimCompanyNo: c.companyNo,
        reimCompanyName: c.companyName
      }))
      this.departments = departments.map((d: DepartmentItem) => ({
        reimDepartmentId: d.departmentId,
        reimDepartmentNo: d.departmentNo,
        reimDepartmentName: d.departmentName
      }))
      this.employees = employees.map((e: EmployeeItem) => ({
        reimbursementId: e.employeeId,
        reimbursementNo: e.employeeNo,
        reimbursementName: e.employeeName
      }))
      this.businessTypes = btRaw.map((bt: BusinessTypeNode) => ({
        businessTypeId: bt.businessTypeId,
        businessTypeNo: bt.businessTypeNo,
        businessTypeName: bt.businessTypeName,
        thereSubordinateNode: bt.hasSubordinate === 1 ? '1' : '0',
        superiorId: bt.superiorId
      }))
      this.cities = cities.map((c: CityItem) => ({
        cityNo: c.cityNo,
        cityName: c.cityName,
        cityType: String(c.cityType) as '1' | '2' | '3'
      }))
      this.projects = projects
    }
  }
})
