<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useReimbursementStore } from '@/stores/reimbursement'
import { useConfirm } from '@/composables/useConfirm'
import { money, parseDate } from '@/utils/format'
import {
  createReim,
  updateReim,
  submitReim,
  addTrip,
  updateTrip,
  getCalendar,
  updateCalendar,
  updateAllocation,
} from '@/api/service'
import type { BackendTripDTO, BackendCalendarDTO, BackendAllocationDTO, BackendSubsidyCalendar } from '@/api/types'

const props = defineProps<{
  mode: 'add' | 'edit'
  reimId: number | null
  editVersion: number
  editStatus?: number  // 0=草稿 1=已完成 2=已作废
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const store = useReimbursementStore()
const confirm = useConfirm()

function isConflictError(err: any): boolean {
  return (err?.code === 40006) || (err?.message && err.message.includes('数据已被他人修改'))
}

/** 乐观锁冲突弹窗：确定后刷新页面加载最新数据 */
async function handleConflictError(): Promise<void> {
  await confirm.confirm({
    type: 'warning',
    title: '提示',
    text: '数据已被他人修改，请刷新页面后重试',
    okText: '确定',
    cancelText: '',
  })
  window.location.reload()
}

// ==================== 辅助查询 ====================

function empById(id: string) {
  return store.employees.find(e => e.reimbursementId === id)
}
function cityByNo(no: string) {
  return store.cities.find(c => c.cityNo === no)
}
function companyById(id: string) {
  return store.companies.find(c => c.reimCompanyId === id)
}
function deptById(id: string) {
  return store.departments.find(d => d.reimDepartmentId === id)
}
function btById(id: string) {
  return store.businessTypes.find(b => b.businessTypeId === id)
}
function projById(id: string) {
  return store.projects.find(p => p.projectId === id)
}

// ==================== 关闭 ====================

function onClose() {
  emit('close')
}

// ==================== 保存草稿（不提交） ====================

async function saveDraft(): Promise<boolean> {
  const s = store
  try {
    const mainData = buildMainData()
    let mainId: number

    if (props.mode === 'add') {
      const res = await createReim(mainData)
      mainId = res.id
    } else {
      mainId = props.reimId!
      await updateReim(mainId, mainData)
    }

    // 保存行程 + 补助日历
    const tripDtos = buildTripDtos()
    for (let i = 0; i < tripDtos.length; i++) {
      const dto = tripDtos[i]
      const storeTrip = s.trips[i]
      const storeSub = s.subsidies.find(sub => sub.tripId === storeTrip.id)

      // 区分已有行程（数字ID）与新增行程（前端临时字符串ID）
      const backendTripId = Number(storeTrip.id)

      if (!isNaN(backendTripId)) {
        // 已有行程：更新，后端返回新 subsidyId
        const tripRes = await updateTrip(mainId, backendTripId, dto)
        const subsidyId = tripRes?.subsidyId
        if (subsidyId && storeSub) {
          await syncCalendarData(mainId, subsidyId, storeSub)
        }
      } else {
        // 新增行程（含 add 模式全部行程 及 edit 模式新增行程）
        const tripRes = await addTrip(mainId, dto)
        const subsidyId = tripRes?.subsidyId
        if (subsidyId && storeSub) {
          await syncCalendarData(mainId, subsidyId, storeSub)
        }
      }
    }

    // 保存费用分摊
    if (s.allocation.length > 0) {
      await updateAllocation(mainId, buildAllocationDtos())
    }

    return true
  } catch (err: any) {
    if (isConflictError(err)) {
      await handleConflictError()
      return false
    }
    const msg = typeof err === 'string' ? err : (err?.message || '保存失败，请重试')
    await confirm.alert(msg)
    return false
  }
}

defineExpose({ saveDraft })

// ==================== 提交 ====================

async function onSubmit() {
  const s = store

  // ── 1. 基础信息必填校验 ──
  if (!s.basic.reimCompany) { await confirm.alert('请选择费用归属公司'); return }
  if (!s.basic.businessType) { await confirm.alert('请选择业务类型'); return }
  // 费用归属及分摊：每行需选择费用归属公司
  for (let i = 0; i < s.allocation.length; i++) {
    if (!s.allocation[i].company) {
      await confirm.alert(`第 ${i + 1} 行分摊费用归属未选择，请补充`); return
    }
  }

  // ── 2. 行程校验 ──
  if (s.trips.length === 0) { await confirm.alert('请至少补录一条行程'); return }

  for (const t of s.trips) {
    if (!t.reimbursementId) { await confirm.alert('行程中有出行人员未选择'); return }
    if (!t.startCity) { await confirm.alert('行程中有出发城市未选择'); return }
    if (!t.endCity) { await confirm.alert('行程中有到达城市未选择'); return }
    if (!t.startDate) { await confirm.alert('行程中有出发日期未选择'); return }
    if (!t.endDate) { await confirm.alert('行程中有到达日期未选择'); return }
    if (!t.description.trim()) { await confirm.alert('行程中有行程说明未填写'); return }
    if (parseDate(t.endDate)! < parseDate(t.startDate)!) {
      await confirm.alert('行程中到达日期不可早于出发日期'); return
    }
  }

  // 行程人员+日期范围不可重复
  for (let i = 0; i < s.trips.length; i++) {
    for (let j = i + 1; j < s.trips.length; j++) {
      const a = s.trips[i], b = s.trips[j]
      if (a.reimbursementId !== b.reimbursementId) continue
      const overlap = !(parseDate(a.endDate)! < parseDate(b.startDate)! || parseDate(a.startDate)! > parseDate(b.endDate)!)
      if (overlap) {
        const emp = empById(a.reimbursementId)
        await confirm.alert(`该员工存在重复出差日期，请修改行程`)
        return
      }
    }
  }

  // ── 3. 补助校验 ──
  for (const sub of s.subsidies) {
    if (sub.calendar.length > 0) {
      for (const r of sub.calendar) {
        if (r.meal.checked && Number(r.meal.value) > r.meal.std) {
          await confirm.alert(`补助金额不能超过标准金额（餐费：${money(r.meal.std)}）`); return
        }
        if (r.traffic.checked && Number(r.traffic.value) > r.traffic.std) {
          await confirm.alert(`补助金额不能超过标准金额（交通：${money(r.traffic.std)}）`); return
        }
        if (r.comm.checked && Number(r.comm.value) > r.comm.std) {
          await confirm.alert(`补助金额不能超过标准金额（通讯：${money(r.comm.std)}）`); return
        }
      }
    }
  }

  // ── 4. 分摊校验 ──
  const ratioSum = s.allocation.reduce((sum, r) => sum + Number(r.ratio || 0), 0)
  if (Math.abs(Math.round(ratioSum * 100) / 100 - 1) > 0.001) {
    await confirm.alert(`分摊比例合计必须为100%，请调整`)
    return
  }
  if (Math.abs(s.subsidyTotal - s.allocTotal) > 0.01) {
    await confirm.alert(`分摊总金额需等于补助总金额，请核对`)
    return
  }

  // ── 5. 保存 + 提交 ──
  await doSaveAndSubmit()
}

// ==================== 保存 & 提交（内部实现） ====================

async function doSaveAndSubmit() {
  const s = store

  try {
    // 5.1 保存主记录
    const mainData = buildMainData()
    let mainId: number

    if (props.mode === 'add') {
      const res = await createReim(mainData)
      mainId = res.id
    } else {
      mainId = props.reimId!
      await updateReim(mainId, mainData)
    }

    // 5.2 保存行程 + 补助日历
    const tripDtos = buildTripDtos()
    for (let i = 0; i < tripDtos.length; i++) {
      const dto = tripDtos[i]
      const storeTrip = s.trips[i]
      const storeSub = s.subsidies.find(sub => sub.tripId === storeTrip.id)

      // 区分已有行程（数字ID）与新增行程（前端临时字符串ID）
      const backendTripId = Number(storeTrip.id)

      if (!isNaN(backendTripId)) {
        // 已有行程：更新，后端返回新 subsidyId
        const tripRes = await updateTrip(mainId, backendTripId, dto)
        const subsidyId = tripRes?.subsidyId
        if (subsidyId && storeSub) {
          await syncCalendarData(mainId, subsidyId, storeSub)
        }
      } else {
        // 新增行程（含 add 模式全部行程 及 edit 模式新增行程）
        const tripRes = await addTrip(mainId, dto)
        const subsidyId = tripRes?.subsidyId
        if (subsidyId && storeSub) {
          await syncCalendarData(mainId, subsidyId, storeSub)
        }
      }
    }

    // 5.3 保存费用分摊
    if (s.allocation.length > 0) {
      await updateAllocation(mainId, buildAllocationDtos())
    }

    // 5.4 提交（草稿单据不传版本号，跳过乐观锁校验；非草稿保留并发控制）
    const isDraft = props.editStatus === 0
    await submitReim(mainId, (props.mode === 'edit' && !isDraft) ? props.editVersion : 0)

    // 5.5 成功 → 弹窗 → 返回列表
    await confirm.confirm({
      type: 'info',
      title: '提交成功',
      text: '提交成功',
      okText: '确定',
      cancelText: '',
    })
    router.push({ name: 'reimburseList' })

  } catch (err: any) {
    // 乐观锁冲突 → 弹窗确认刷新
    if (isConflictError(err)) {
      await handleConflictError()
      return
    }
    // 后端错误提示
    const msg = typeof err === 'string' ? err : (err?.message || '提交失败，请重试')
    await confirm.alert(msg)
  }
}

// ==================== 数据映射 ====================

function buildMainData() {
  const b = store.basic
  const emp = empById(b.reimbursement)
  const dept = deptById(b.department)
  const comp = companyById(b.reimCompany)
  const bt = btById(b.businessType)

  return {
    reimbursementTitle: b.title,
    businessTripReason: b.reason,
    reimburserId: b.reimbursement,
    reimburserNo: emp?.reimbursementNo || '',
    reimburserName: emp?.reimbursementName || '',
    reimDepartmentId: b.department,
    reimDepartmentNo: dept?.reimDepartmentNo || '',
    reimDepartmentName: dept?.reimDepartmentName || '',
    reimCompanyId: b.reimCompany,
    reimCompanyNo: comp?.reimCompanyNo || '',
    reimCompanyName: comp?.reimCompanyName || '',
    businessTypeId: b.businessType,
    businessTypeNo: bt?.businessTypeNo || '',
    businessTypeName: bt?.businessTypeName || '',
    remarks: store.remark,
  }
}

function buildTripDtos(): BackendTripDTO[] {
  return store.trips.map(t => {
    const emp = empById(t.reimbursementId)
    const sc = cityByNo(t.startCity)
    const ec = cityByNo(t.endCity)
    return {
      travelerId: t.reimbursementId,
      travelerNo: emp?.reimbursementNo || '',
      travelerName: emp?.reimbursementName || '',
      originCityId: t.startCity,
      originCityName: sc?.cityName || '',
      destinationCityId: t.endCity,
      destinationCityName: ec?.cityName || '',
      startDate: t.startDate,
      endDate: t.endDate,
      tripDesc: t.description,
    }
  })
}

function buildCalendarDtos(sub: typeof store.subsidies[number], calMap?: Map<string, string>): BackendCalendarDTO[] {
  return sub.calendar.map(r => ({
    id: calMap?.get(r.date),
    isMealSelected: r.meal.checked ? 1 : 0,
    isTransportSelected: r.traffic.checked ? 1 : 0,
    isPhoneSelected: r.comm.checked ? 1 : 0,
    mealApplyAmount: Number(r.meal.value || 0),
    transportApplyAmount: Number(r.traffic.value || 0),
    phoneApplyAmount: Number(r.comm.value || 0),
  }))
}

/** 将前端日历数据同步到后端：先获取后端日历 ID，再按日期匹配更新 */
async function syncCalendarData(mainId: number, subsidyId: number, storeSub: typeof store.subsidies[number]) {
  if (!storeSub || storeSub.calendar.length === 0) return
  // 获取后端日历条目（含自增ID），按日期建立 id 映射
  const backendCals: BackendSubsidyCalendar[] = await getCalendar(mainId, subsidyId)
  const calMap = new Map<string, string>()
  for (const cal of backendCals) {
    if (cal.subsidyDate) calMap.set(cal.subsidyDate, String(cal.id))
  }
  const dtos = buildCalendarDtos(storeSub, calMap)
  await updateCalendar(mainId, subsidyId, dtos)
}

function buildAllocationDtos(): BackendAllocationDTO[] {
  return store.allocation.map((a, i) => {
    const comp = companyById(a.company)
    const proj = projById(a.project)
    return {
      companyId: a.company,
      companyNo: comp?.reimCompanyNo || '',
      companyName: comp?.reimCompanyName || a.company || '',
      projectId: a.project,
      projectNo: proj?.projectNo || '',
      projectName: proj?.projectName || a.project || '',
      allocationRatio: a.ratio,
      allocationAmount: a.amount,
      sortOrder: i + 1,
    }
  })
}
</script>

<template>
  <footer class="doc-footer">
    <button class="btn btn-outline" @click="onClose">关闭</button>
    <button v-if="!readonly" class="btn btn-primary" @click="onSubmit">提交</button>
  </footer>
</template>

<style scoped>
/* 样式由全局 .doc-footer 控制 */
</style>
