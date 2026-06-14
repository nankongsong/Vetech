<script setup lang="ts">
defineProps<{
  modelValue: boolean
  type?: string
  title: string
  text: string
  okText?: string
  cancelText?: string
}>()

defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'ok'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="confirm-overlay" @click.self="$emit('cancel')">
      <div class="confirm-card">
        <div class="confirm-icon" :class="type || 'info'">
          <svg v-if="type === 'warning'" viewBox="0 0 24 24" width="36" height="36" fill="#e6a23c">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="36" height="36" fill="#409eff">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <div class="confirm-title">{{ title }}</div>
        <div class="confirm-text">{{ text }}</div>
        <div class="confirm-actions">
          <button v-if="cancelText" class="btn btn-default" @click="$emit('cancel')">{{ cancelText }}</button>
          <button class="btn btn-primary" @click="$emit('ok')">{{ okText || '确定' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
}
.confirm-card {
  background: #fff; border-radius: 8px; padding: 32px 40px 24px;
  min-width: 320px; max-width: 420px; text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.confirm-icon { margin-bottom: 12px; }
.confirm-title { font-size: 16px; font-weight: 600; color: #303133; margin-bottom: 8px; }
.confirm-text { font-size: 14px; color: #606266; margin-bottom: 24px; line-height: 1.6; }
.confirm-actions { display: flex; justify-content: center; gap: 12px; }
</style>
