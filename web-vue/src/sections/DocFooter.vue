<script setup lang="ts">
import { useReimbursementStore } from '@/stores/reimbursement'
import { useConfirm } from '@/composables/useConfirm'
import { money } from '@/utils/format'

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
