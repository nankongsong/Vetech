<script setup lang="ts">
import PanelHeader from '@/components/PanelHeader.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { money } from '@/utils/format'

const store = useReimbursementStore()
</script>

<template>
  <section class="panel" :class="{ collapsed: store.ui.collapsed.total }">
    <PanelHeader @toggle="store.togglePanel('total')" />
    <div class="panel-body">
      <div class="total-grid">
        <div class="total-item"><span class="lbl">补助总金额</span><span class="val">{{ money(store.subsidyTotal) }}</span></div>
        <div class="total-item"><span class="lbl">餐费补助</span><span class="val">{{ money(store.mealTotal) }}</span></div>
        <div class="total-item"><span class="lbl">交通补助</span><span class="val">{{ money(store.trafficTotal) }}</span></div>
        <div class="total-item"><span class="lbl">通讯补助</span><span class="val">{{ money(store.commTotal) }}</span></div>
      </div>
    </div>
  </section>
</template>
