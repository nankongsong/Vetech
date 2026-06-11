<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  large?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onMask(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', onEsc))
onBeforeUnmount(() => document.removeEventListener('keydown', onEsc))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="props.modelValue" class="modal-mask" @click="onMask">
        <div class="modal" :class="{ large: props.large }">
          <div class="modal-header">
            <div class="modal-title">{{ props.title }}</div>
            <button class="modal-close" @click="close">&times;</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
