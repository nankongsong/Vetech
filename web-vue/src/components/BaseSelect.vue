<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface Option {
  id: string
  name: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const wrap = ref<HTMLElement | null>(null)
const open = ref(false)

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

function pick(id: string) {
  if (props.disabled) return
  emit('update:modelValue', id)
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (!wrap.value) return
  if (!wrap.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const displayValue = () => {
  const f = props.options.find(o => o.id === props.modelValue)
  return f ? f.name : ''
}
</script>

<template>
  <div ref="wrap" class="select-wrap" :class="{ open, disabled: props.disabled }">
    <div class="form-control" :class="{ disabled: props.disabled }" @click="toggle" tabindex="0">
      <input type="text" readonly :value="displayValue()" :placeholder="placeholder || '请选择'"
             :style="{ cursor: props.disabled ? 'not-allowed' : 'pointer', background: 'transparent' }" />
      <span class="arrow">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
      </span>
    </div>
    <div class="select-options">
      <div v-for="o in props.options" :key="o.id" class="opt" :class="{ selected: props.modelValue === o.id }"
           @click.stop="pick(o.id)">{{ o.name }}</div>
    </div>
  </div>
</template>
