<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import type { ConfirmType } from '@/types/models'

interface ConfirmOptions {
  type?: ConfirmType
  title?: string
  text: string
  okText?: string
  cancelText?: string
}

const props = defineProps<{
  modelValue: boolean
  type?: ConfirmType
  title?: string
  text?: string
  okText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'ok'): void
  (e: 'cancel'): void
}>()

function ok() { emit('update:modelValue', false); emit('ok') }
function cancel() { emit('update:modelValue', false); emit('cancel') }
</script>

<template>
  <BaseModal :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)"
             :title="props.title || '确认'" class="confirm">
    <div class="confirm-body">
      <div class="confirm-icon" :class="{ info: props.type === 'info' }">
        {{ props.type === 'info' ? 'i' : '!' }}
      </div>
      <div class="confirm-text">{{ props.text }}</div>
    </div>
    <template #footer>
      <button class="btn btn-default" @click="cancel">{{ props.cancelText || '取消' }}</button>
      <button class="btn btn-primary" @click="ok">{{ props.okText || '确定' }}</button>
    </template>
  </BaseModal>
</template>
