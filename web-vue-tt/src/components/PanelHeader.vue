<script setup lang="ts">
defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="panel-header" @click="$emit('toggle')">
    <div class="panel-header-left">
      <svg class="toggle-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M10 17l5-5-5-5v10z"/>
      </svg>
      <span class="panel-title">
        <slot name="title">
          <slot />
        </slot>
      </span>
    </div>
    <div class="panel-header-right" @click.stop>
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: #f5f7fa; border-bottom: 1px solid #ebeef5;
  cursor: pointer; user-select: none;
}
.panel-header:hover { background: #ebeef5; }
.panel-header-left { display: flex; align-items: center; gap: 6px; }
.toggle-icon { color: #909399; flex-shrink: 0; transition: transform 0.2s; }
.panel-title { font-size: 14px; font-weight: 600; color: #303133; }
.panel-header-right { display: flex; align-items: center; gap: 8px; }
</style>
