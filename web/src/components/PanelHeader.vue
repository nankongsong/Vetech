<script setup lang="ts">
defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="panel-header" @click="$emit('toggle')">
    <div class="panel-header-left">
      <div class="title-left">
        <span class="panel-title">
          <slot name="title">
            <slot />
          </slot>
        </span>
      </div>
      <svg class="toggle-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
      </svg>
    </div>
    <div class="panel-header-right" @click.stop>
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; background: #fff; border-bottom: 1px solid #ebeef5;
  cursor: pointer; user-select: none;
  height: 42px;
}
.panel-header:hover { background: #f5f7fa; }
.panel-header-left {
  display: flex; align-items: center; gap: 8px;
  height: 100%;
}
.title-left {
  display: flex; align-items: center; height: 100%;
  border-left: 3px solid #409eff; padding-left: 10px;
}
.toggle-icon {
  color: #909399; flex-shrink: 0; transition: transform 0.2s;
  margin-left: auto; order: 2;
}
.panel-title {
  font-size: 14px; font-weight: 600; color: #303133; flex-shrink: 0;
}
.panel-header-right {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #409eff;
}
</style>
