<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  large?: boolean
  width?: string
  fullscreen?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal-card" :class="{ 'modal-large': large, 'modal-fullscreen': fullscreen }" :style="width ? { width } : undefined">
        <div class="modal-header">
          <span class="modal-title">{{ title }}</span>
          <button class="modal-close" @click="$emit('update:modelValue', false)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
}
.modal-card {
  background: #fff; border-radius: 6px;
  width: 480px; max-height: 85vh; display: flex; flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.modal-card.modal-large { width: 900px; }
.modal-card.modal-fullscreen {
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
}
.modal-card.modal-fullscreen .modal-body {
  padding: 0;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #ebeef5;
}
.modal-title { font-size: 16px; font-weight: 600; color: #303133; }
.modal-close {
  background: none; border: none; cursor: pointer;
  color: #909399; padding: 2px;
}
.modal-close:hover { color: #409eff; }
.modal-body { padding: 20px; overflow-y: auto; flex: 1; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 20px; border-top: 1px solid #ebeef5;
}
</style>
