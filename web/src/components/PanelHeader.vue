<script setup lang="ts">
defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="panel-header" @click="$emit('toggle')">
    <div class="panel-header-inner">
      <div class="panel-header-left">
        <div class="title-left">
          <span class="panel-title">
            <slot name="title">
              <slot />
            </slot>
          </span>
        </div>
      </div>
      <div class="panel-header-right" @click.stop>
        <slot name="extra" />
      </div>
      <svg class="toggle-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.panel-header {
  display: flex; align-items: center;
  padding: 0 24px; background: #fff; border-bottom: 1px solid #ebeef5;
  cursor: pointer; user-select: none;
}
.panel-header-inner {
  display: flex; align-items: center;
  max-width: 1200px; width: 100%; margin: 12px auto;
  background: #f0f2f5;
  height: 36px;
  padding: 0 4px;
}
.panel-header-left {
  display: flex; align-items: center; gap: 8px;
  height: 100%; flex: 1;
}
.title-left {
  display: flex; align-items: center; height: 100%; padding: 0 12px;
  position: relative;
}
.title-left::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: #409eff;
  border-radius: 1px;
}
.toggle-icon {
  color: #909399; flex-shrink: 0; transition: transform 0.2s;
  margin-left: 8px;
}
.panel-title {
  font-size: 16px; font-weight: 500; color: #303133; flex-shrink: 0;
}
.panel-header-right {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #409eff;
}
</style>
