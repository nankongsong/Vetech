<script setup lang="ts">
import { onMounted } from 'vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import DocHeader from './sections/DocHeader.vue'
import DocFooter from './sections/DocFooter.vue'
import BasicInfo from './sections/BasicInfo.vue'
import TripSection from './sections/TripSection.vue'
import SubsidySection from './sections/SubsidySection.vue'
import TotalSection from './sections/TotalSection.vue'
import AllocationSection from './sections/AllocationSection.vue'
import RemarkSection from './sections/RemarkSection.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import { useConfirm } from './composables/useConfirm'

const confirm = useConfirm()
const store = useReimbursementStore()

// 挂载时加载基础数据（公司/部门/员工/业务类型/城市/项目）
onMounted(() => {
  store.loadBaseData()
})
</script>

<template>
  <DocHeader />
  <main class="doc-main">
    <BasicInfo />
    <TripSection />
    <SubsidySection />
    <TotalSection />
    <AllocationSection />
    <RemarkSection />
  </main>
  <DocFooter />
  <ConfirmModal
    v-model="confirm.state.value.visible"
    :type="confirm.state.value.type"
    :title="confirm.state.value.title"
    :text="confirm.state.value.text"
    :ok-text="confirm.state.value.okText"
    :cancel-text="confirm.state.value.cancelText"
    @ok="confirm.ok"
    @cancel="confirm.cancel" />
</template>
