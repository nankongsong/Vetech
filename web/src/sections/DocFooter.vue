<script setup lang="ts">
import { useReimbursementStore } from '@/stores/reimbursement'
import { useConfirm } from '@/composables/useConfirm'
import { money, parseDate } from '@/utils/format'

const store = useReimbursementStore()
const confirm = useConfirm()

async function onClose() {
  const ok = await confirm.confirm({
    type: 'warning', title: '确认关闭', text: '确定要关闭当前页面吗？未保存的内容将会丢失。',
  })
  if (ok) window.close()
}

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

  // 校验每一条行程
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
        const emp = s.employees.find(e => e.reimburserId === a.reimburserId)
        await confirm.alert(`出行人 ${emp ? emp.reimburserName : ''} 存在日期重叠的行程`)
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
    await confirm.alert(`分摊比例合计必须为 100%（当前为 ${(ratioSum * 100).toFixed(2)}%）`)
    return
  }
  if (Math.abs(s.subsidyTotal - s.allocTotal) > 0.01) {
    await confirm.alert(`分摊金额合计(${money(s.allocTotal)})必须等于补助总金额(${money(s.subsidyTotal)})`)
    return
  }

  // ── 5. 全部通过 → 提交成功 ──
  await confirm.confirm({
    type: 'info',
    title: '提交成功',
    text: '报销单已提交成功！',
    okText: '确定',
    cancelText: '关闭',
  })
  window.close()
}
</script>

<template>
  <footer class="doc-footer">
    <button class="btn btn-default" @click="onClose">关闭</button>
    <button class="btn btn-primary" @click="onSubmit">提交</button>
  </footer>
</template>

<style scoped>
/* 页脚样式使用全局 .doc-footer */
</style>
