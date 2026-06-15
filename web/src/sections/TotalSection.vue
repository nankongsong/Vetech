<script setup lang="ts">
import PanelHeader from '@/components/PanelHeader.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { money } from '@/utils/format'

const store = useReimbursementStore()
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.total }">
    <PanelHeader @toggle="store.togglePanel('total')">
      <template #title>费用合计</template>
    </PanelHeader>
    <div class="panel-body">
      <div class="total-row">
        <div class="total-cell">
          <span class="total-lbl">补助总金额</span>
          <span class="total-val">{{ money(store.subsidyTotal) }}</span>
        </div>
        <div class="total-cell">
          <span class="total-lbl">餐费补助</span>
          <span class="total-val">{{ money(store.mealTotal) }}</span>
        </div>
        <div class="total-cell">
          <span class="total-lbl">交通补助</span>
          <span class="total-val">{{ money(store.trafficTotal) }}</span>
        </div>
        <div class="total-cell">
          <span class="total-lbl">通讯补助</span>
          <span class="total-val">{{ money(store.commTotal) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.total-row {
  display: flex; align-items: center;
}
.total-cell {
  flex: 1;
  display: flex; align-items: center; gap: 8px;
}
.total-lbl { font-size: 14px; color: #606266; white-space: nowrap; }
.total-val { font-size: 14px; color: #303133; }
</style>
