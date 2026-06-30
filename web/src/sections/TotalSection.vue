<script setup lang="ts">
/**
 * 费用合计组件
 * 展示补助总金额及各类补助（餐费、交通、通讯）的汇总
 */
import PanelHeader from '@/components/PanelHeader.vue'
import { useReimbursementStore } from '@/stores/reimbursement'
import { money } from '@/utils/format'

// 报销单 Store 实例
const store = useReimbursementStore()
</script>

<template>
  <!-- 费用合计面板 -->
  <section class="panel" :class="{ collapsed: store.ui.collapsed.total }">
    <!-- 可折叠面板头部 -->
    <PanelHeader @toggle="store.togglePanel('total')">
      <template #title>费用合计</template>
    </PanelHeader>
    <!-- 面板内容：补助汇总展示 -->
    <div class="panel-body">
      <div class="total-row">
        <!-- 补助总金额 -->
        <div class="total-cell">
          <span class="total-lbl">补助总金额</span>
          <span class="total-val">{{ money(store.subsidyTotal) }}</span>
        </div>
        <!-- 餐费补助小计 -->
        <div class="total-cell">
          <span class="total-lbl">餐费补助</span>
          <span class="total-val">{{ money(store.mealTotal) }}</span>
        </div>
        <!-- 交通补助小计 -->
        <div class="total-cell">
          <span class="total-lbl">交通补助</span>
          <span class="total-val">{{ money(store.trafficTotal) }}</span>
        </div>
        <!-- 通讯补助小计 -->
        <div class="total-cell">
          <span class="total-lbl">通讯补助</span>
          <span class="total-val">{{ money(store.commTotal) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* flex 横向排列各汇总项 */
.total-row {
  display: flex; align-items: center;
}
/* 每项平均分配宽度 */
.total-cell {
  flex: 1;
  display: flex; align-items: center; gap: 8px;
}
/* 标签样式：灰色文字 */
.total-lbl { font-size: 14px; color: #4e5b70; font-weight: 400; white-space: nowrap; }
/* 数值样式：深色文字 */
.total-val { font-size: 14px; color: #303133; }
</style>
