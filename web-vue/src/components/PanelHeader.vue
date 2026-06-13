<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
const emit = defineEmits<{
  (e: 'toggle'): void
}>()

function onHeaderClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('button')) return
  emit('toggle')
}
</script>

<template>
  <div class="panel-header" @click="onHeaderClick">
    <span class="panel-bar"></span>
    <h2 class="panel-title">
      <slot name="title" />
    </h2>
    <div class="panel-extra">
      <slot name="extra" />
      <span class="panel-toggle" v-show="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M7 14l5-5 5 5z" />
        </svg>
      </span>
    </div>
  </div>
</template>
