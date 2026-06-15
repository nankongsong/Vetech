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
      <table class="table total-table">
        <thead>
          <tr>
            <th>项目</th>
            <th class="right">金额</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>餐费合计</td>
            <td class="right">{{ money(store.mealTotal) }}</td>
          </tr>
          <tr>
            <td>交通合计</td>
            <td class="right">{{ money(store.trafficTotal) }}</td>
          </tr>
          <tr>
            <td>通讯合计</td>
            <td class="right">{{ money(store.commTotal) }}</td>
          </tr>
          <tr class="total-row">
            <td><strong>补助总金额</strong></td>
            <td class="right"><strong>{{ money(store.subsidyTotal) }}</strong></td>
          </tr>
          <tr>
            <td>分摊金额合计</td>
            <td class="right" :class="{ 'text-danger': Math.abs(store.subsidyTotal - store.allocTotal) > 0.01 }">
              {{ money(store.allocTotal) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.total-table { width: 100%; max-width: 420px; }
.total-table th { background: #f5f7fa; }
.total-row td { border-top: 2px solid #409eff; }
.text-danger { color: #f56c6c; }
</style>
