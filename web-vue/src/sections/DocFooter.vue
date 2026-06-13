<script setup lang="ts">
import { useReimbursementStore } from '@/stores/reimbursement'
import { useConfirm } from '@/composables/useConfirm'
import { money } from '@/utils/format'
import {
  createReim,
  addTrip,
  updateAllocation,
  fetchReimDetail,
  submitReim,
  getCalendar,
  updateCalendar
} from '@/api/service'
import type { BackendReimMain, BackendTripDTO, BackendCalendarDTO, BackendAllocationDTO } from '@/api/types'

const store = useReimbursementStore()
const confirm = useConfirm()

async function onClose() {
  const ok = await confirm.confirm({ type: 'warning', title: '确认关闭', text: '确定要关闭当前页面吗？' })
  if (ok) window.close()
}

async function onSubmit() {
  const s = store
  if (!s.basic.title) { await confirm.alert('请填写报销标题'); return }
  if (!s.basic.reimburser) { await confirm.alert('请选择报销人'); return }
  if (!s.basic.businessType) { await confirm.alert('请选择业务类型'); return }
  if (s.trips.length === 0) { await confirm.alert('请至少补录一条行程'); return }
  const ratioSum = s.allocation.reduce((sum, r) => sum + Number(r.ratio || 0), 0)
  if (Math.round(ratioSum * 100) / 100 !== 1) {
    await confirm.alert('分摊比例合计必须为 100%')
    return
  }
  if (Math.abs(s.subsidyTotal - s.allocTotal) > 0.01) {
    await confirm.alert(`分摊金额合计(${money(s.allocTotal)})必须等于补助总金额(${money(s.subsidyTotal)})`)
    return
  }

  // 1. 构建报销单头
  const emp = store.employees.find(e => e.reimburserId === s.basic.reimburser)
  const dept = store.departments.find(d => d.reimDepartmentId === s.basic.department)
  const comp = store.companies.find(c => c.reimCompanyId === s.basic.reimCompany)
  const bt = store.businessTypes.find(b => b.businessTypeId === s.basic.businessType)

  const mainData: Partial<BackendReimMain> = {
    reimbursementTitle: s.basic.title,
    businessTripReason: s.basic.reason,
    reimburserId: s.basic.reimburser,
    reimburserNo: emp?.reimburserNo || '',
    reimburserName: emp?.reimburserName || '',
    reimDepartmentId: dept?.reimDepartmentId || '',
    reimDepartmentNo: dept?.reimDepartmentNo || '',
    reimDepartmentName: dept?.reimDepartmentName || '',
    reimCompanyId: comp?.reimCompanyId || '',
    reimCompanyNo: comp?.reimCompanyNo || '',
    reimCompanyName: comp?.reimCompanyName || '',
    businessTypeId: s.basic.businessType,
    businessTypeNo: bt?.businessTypeNo || '',
    businessTypeName: bt?.businessTypeName || '',
    remarks: s.remark,
    subsidyTotal: s.subsidyTotal,
    mealAllowance: s.mealTotal,
    transportationAllowance: s.trafficTotal,
    phoneAllowance: s.commTotal,
    status: 0,
    version: 0
  }

  // 2. 创建报销单
  const { id: reimId } = await createReim(mainData)

  // 3. 提交行程
  for (const trip of s.trips) {
    const tEmp = store.employees.find(e => e.reimburserId === trip.reimburserId)
    const tripDTO: BackendTripDTO = {
      travelerId: trip.reimburserId,
      travelerNo: tEmp?.reimburserNo || '',
      travelerName: tEmp?.reimburserName || '',
      originCityId: trip.startCity,
      originCityName: '',
      destinationCityId: trip.endCity,
      destinationCityName: '',
      startDate: trip.startDate,
      endDate: trip.endDate,
      tripDesc: trip.description
    }
    await addTrip(reimId, tripDTO)
  }

  // 4. 刷新详情（后端通过行程自动生成 subsidy + calendar，我们需要拿到 subsidyId）
  const detail = await fetchReimDetail(reimId)

  // 5. 更新补助日历
  const detailSubsidies = detail.subsidies
  const frontendSubsidies = s.subsidies
  for (let i = 0; i < frontendSubsidies.length; i++) {
    const fs = frontendSubsidies[i]
    const ds = detailSubsidies[i]
    if (!ds || !fs.calendar?.length) continue

    const calendarDTOs: BackendCalendarDTO[] = fs.calendar.map(row => ({
      id: undefined,
      isMealSelected: row.meal.checked ? 1 : 0,
      isTransportSelected: row.traffic.checked ? 1 : 0,
      isPhoneSelected: row.comm.checked ? 1 : 0,
      mealApplyAmount: row.meal.checked ? Number(row.meal.value || 0) : 0,
      transportApplyAmount: row.traffic.checked ? Number(row.traffic.value || 0) : 0,
      phoneApplyAmount: row.comm.checked ? Number(row.comm.value || 0) : 0
    }))
    await updateCalendar(reimId, ds.id, calendarDTOs)
  }

  // 6. 更新分摊
  const allocDTOs: BackendAllocationDTO[] = s.allocation.map(a => {
    const compParts = (a.company || '').split('/')
    return {
      companyId: compParts[0] || '',
      companyNo: compParts[1] || '',
      companyName: compParts[0] || '',
      projectId: a.project,
      projectNo: '',
      projectName: a.project,
      allocationRatio: a.ratio,
      sortOrder: 0
    }
  })
  await updateAllocation(reimId, allocDTOs)

  // 7. 提交报销单
  await submitReim(reimId, 0)

  // 8. 成功提示
  await confirm.confirm({ type: 'info', title: '提交成功', text: '提交成功！', okText: '确认', cancelText: '关闭' })
  window.close()
}
</script>

<template>
  <footer class="doc-footer">
    <button class="btn btn-default" @click="onClose">关闭</button>
    <button class="btn btn-primary" @click="onSubmit">提交</button>
  </footer>
</template>
