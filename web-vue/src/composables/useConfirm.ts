// 确认弹窗 composable - 基于全局 ConfirmModal
import { ref } from 'vue'
import type { ConfirmType } from '@/types/models'

interface ConfirmState {
  visible: boolean
  type: ConfirmType
  title: string
  text: string
  okText: string
  cancelText: string
  resolve: ((v: boolean) => void) | null
}

const state = ref<ConfirmState>({
  visible: false,
  type: 'warning',
  title: '确认',
  text: '',
  okText: '确定',
  cancelText: '取消',
  resolve: null
})

function show(opts: {
  type?: ConfirmType
  title?: string
  text: string
  okText?: string
  cancelText?: string
}): Promise<boolean> {
  return new Promise((resolve) => {
    state.value = {
      visible: true,
      type: opts.type || 'warning',
      title: opts.title || '确认',
      text: opts.text,
      okText: opts.okText || '确定',
      cancelText: opts.cancelText || '取消',
      resolve
    }
  })
}

function ok() {
  state.value.visible = false
  state.value.resolve?.(true)
  state.value.resolve = null
}
function cancel() {
  state.value.visible = false
  state.value.resolve?.(false)
  state.value.resolve = null
}

export function useConfirm() {
  return {
    state,
    show,
    confirm(opts: Parameters<typeof show>[0]) { return show(opts) },
    alert(text: string, title: string = '提示') {
      return show({ type: 'warning', title, text, okText: '知道了', cancelText: '取消' })
    },
    ok,
    cancel
  }
}
