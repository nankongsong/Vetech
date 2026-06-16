<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'

export interface SelectOption {
  id: string
  name: string
}

const props = defineProps<{
  modelValue: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  iconType?: 'chevron' | 'x'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const open = ref(false)
const search = ref('')

const selectedLabel = computed(() => {
  const opt = props.options.find(o => o.id === props.modelValue)
  return opt ? opt.name : ''
})

const filteredOptions = computed(() => {
  if (!search.value) return props.options
  const q = search.value.toLowerCase()
  return props.options.filter(o => o.name.toLowerCase().includes(q))
})

function select(id: string) {
  emit('update:modelValue', id)
  open.value = false
  search.value = ''
}

function toggle() { open.value = !open.value }

// 点击外部关闭
function onDocClick(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (!el.closest('.custom-select-wrapper')) {
    open.value = false
  }
}
import { onMounted } from 'vue'
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="custom-select-wrapper">
    <div class="custom-select" :class="{ open, disabled: props.disabled }" @click.stop="props.disabled ? null : toggle()">
      <span v-if="selectedLabel" class="selected-text">{{ selectedLabel }}</span>
      <span v-else class="placeholder">{{ placeholder || '请选择' }}</span>
      <span v-if="props.iconType !== 'x'" class="arrow arrow-chevron">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </span>
      <span v-else class="arrow x-arrow">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
    </div>
    <div v-if="open" class="dropdown-panel">
      <div class="search-box">
        <input
          type="text"
          v-model="search"
          placeholder="输入关键字筛选"
          class="search-input"
          @click.stop
        />
      </div>
      <ul class="option-list">
        <li
          v-for="opt in filteredOptions"
          :key="opt.id"
          class="option-item"
          :class="{ active: opt.id === modelValue }"
          @click.stop="select(opt.id)"
        >
          {{ opt.name }}
        </li>
        <li v-if="filteredOptions.length === 0" class="option-empty">无匹配选项</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.custom-select-wrapper {
  position: relative; flex: 1; min-width: 0;
}
.custom-select {
  display: flex; align-items: center; justify-content: space-between;
  height: 36px; padding: 0 10px;
  border: 1px solid #dcdfe6; border-radius: 4px;
  background: #fff; cursor: pointer; font-size: 14px;
}
.custom-select:hover { border-color: #c0c4cc; }
.custom-select.disabled { background: #f5f7fa; cursor: not-allowed; }
.custom-select.disabled .selected-text { color: #909399; }
.custom-select.open { border-color: #409eff; }
.selected-text { color: #303133; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.placeholder { color: #c0c4cc; }
.arrow { color: #c0c4cc; flex-shrink: 0; transition: transform 0.2s; display: inline-flex; align-items: center; justify-content: center; }
.custom-select.open .arrow { transform: rotate(180deg); }
.dropdown-panel {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 1100;
  margin-top: 4px; background: #fff; border: 1px solid #e4e7ed;
  border-radius: 4px; box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.search-box { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
.search-input {
  width: 100%; height: 28px; padding: 0 8px; border: 1px solid #e4e7ed;
  border-radius: 3px; font-size: 13px; outline: none; box-sizing: border-box;
}
.search-input:focus { border-color: #409eff; }
.option-list { max-height: 200px; overflow-y: auto; margin: 0; padding: 4px 0; list-style: none; }
.option-item {
  padding: 6px 12px; cursor: pointer; font-size: 14px; color: #303133;
}
.option-item:hover { background: #f5f7fa; }
.option-item.active { color: #409eff; font-weight: 600; }
.option-empty { padding: 8px 12px; color: #c0c4cc; font-size: 13px; text-align: center; }
</style>
