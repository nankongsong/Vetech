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
  updateCalendar,
  updateAllocation,
} from '@/api/service'
import type { BackendTripDTO, BackendCalendarDTO, BackendAllocationDTO } from '@/api/types'

const props = defineProps<{
  mode: 'add' | 'edit'
  reimId: number | null
  editVersion: number
}>()

const router = useRouter()
const store = useReimbursementStore()
const confirm = useConfirm()

// ==================== 辅助查询 ====================

function empById(id: string) {
  return store.employees.find(e => e.reimburserId === id)
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

async function onClose() {
  const ok = await confirm.confirm({
    type: 'warning',
    title: '提示',
    text: '确认要关闭当前单据页面？未保存内容将会丢失',
  })
  if (ok) {
    router.push({ name: 'reimburseList' })
  }
}

// ==================== 提交 ====================

async function onSubmit() {
  const s = store

  // ── 1. 基础信息必填校验 ──
  if (!s.basic.title.trim()) { await confirm.alert('请填写报销标题'); return }
  if (!s.basic.reimburser) { await confirm.alert('请选择报销人'); return }
  if (!s.basic.department) { await confirm.alert('请选择报销部门'); return }
  if (!s.basic.reimCompany) { await confirm.alert('请选择费用归属公司'); return }
  if (!s.basic.businessType) { await confirm.alert('请选择业务类型'); return }
  if (!s.basic.reason.trim()) { await confirm.alert('请填写出差事由'); return }

  // ── 2. 行程校验 ──
  if (s.trips.length === 0) { await confirm.alert('请至少补录一条行程'); return }

  for (const t of s.trips) {
    if (!t.reimburserId) { await confirm.alert('行程中有出行人员未选择'); return }
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
      if (a.reimburserId !== b.reimburserId) continue
      const overlap = !(parseDate(a.endDate)! < parseDate(b.startDate)! || parseDate(a.startDate)! > parseDate(b.endDate)!)
      if (overlap) {
        const emp = empById(a.reimburserId)
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

      if (props.mode === 'add') {
        // 新增行程 → 返回 { tripId, subsidyId }
        const tripRes = await addTrip(mainId, dto) as any
        const subsidyId = tripRes?.subsidyId
        if (subsidyId && storeSub && storeSub.calendar.length > 0) {
          await updateCalendar(mainId, subsidyId, buildCalendarDtos(storeSub))
        }
      } else {
        // 编辑模式：使用后端行程 ID
        const backendTripId = Number(storeTrip.id)
        if (!isNaN(backendTripId)) {
          await updateTrip(mainId, backendTripId, dto)
          const backendSubId = Number(storeSub?.id)
          if (!isNaN(backendSubId) && storeSub && storeSub.calendar.length > 0) {
            await updateCalendar(mainId, backendSubId, buildCalendarDtos(storeSub))
          }
        }
      }
    }

    // 5.3 保存费用分摊
    if (s.allocation.length > 0) {
      await updateAllocation(mainId, buildAllocationDtos())
    }

    // 5.4 提交
    await submitReim(mainId, props.mode === 'edit' ? props.editVersion : 0)

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
    // 后端错误提示
    const msg = typeof err === 'string' ? err : (err?.message || '提交失败，请重试')
    await confirm.alert(msg)
  }
}

// ==================== 数据映射 ====================

function buildMainData() {
  const b = store.basic
  const emp = empById(b.reimburser)
  const dept = deptById(b.department)
  const comp = companyById(b.reimCompany)
  const bt = btById(b.businessType)

  return {
    reimbursementTitle: b.title,
    businessTripReason: b.reason,
    reimburserId: b.reimburser,
    reimburserNo: emp?.reimburserNo || '',
    reimburserName: emp?.reimburserName || '',
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
    const emp = empById(t.reimburserId)
    const sc = cityByNo(t.startCity)
    const ec = cityByNo(t.endCity)
    return {
      travelerId: t.reimburserId,
      travelerNo: emp?.reimburserNo || '',
      travelerName: emp?.reimburserName || '',
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

function buildCalendarDtos(sub: typeof store.subsidies[number]): BackendCalendarDTO[] {
  return sub.calendar.map(r => ({
    isMealSelected: r.meal.checked ? 1 : 0,
    isTransportSelected: r.traffic.checked ? 1 : 0,
    isPhoneSelected: r.comm.checked ? 1 : 0,
    mealApplyAmount: Number(r.meal.value || 0),
    transportApplyAmount: Number(r.traffic.value || 0),
    phoneApplyAmount: Number(r.comm.value || 0),
  }))
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
    <button class="btn btn-primary" @click="onSubmit">提交</button>
  </footer>
</template>

<style scoped>
/* 样式由全局 .doc-footer 控制 */
</style>
