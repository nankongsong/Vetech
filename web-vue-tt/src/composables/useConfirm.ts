/**
 * 确认对话框 composable
 * 内部使用 ElMessageBox（Element Plus 全局引入），
 * 同时暴露 reactive state 以兼容 ConfirmModal 的 v-model 模式
 */
import { reactive, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

export interface ConfirmState {
  visible: boolean
  type: string
  title: string
  text: string
  okText: string
  cancelText: string
}

export function useConfirm() {
  const state = reactive<ConfirmState>({
    visible: false,
    type: 'info',
    title: '',
    text: '',
    okText: '确定',
    cancelText: '取消',
  })

  let resolvePromise: ((value: boolean | void) => void) | null = null

  /** 警告提示（仅"确定"按钮） */
  async function alert(msg: string): Promise<void> {
    try {
      await ElMessageBox.alert(msg, '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      })
    } catch {
      // 用户关闭弹窗，忽略
    }
  }

  /** 确认对话框（确定 + 取消） */
  async function confirm(options: {
    type?: string
    title: string
    text: string
    okText?: string
    cancelText?: string
  }): Promise<boolean> {
    try {
      await ElMessageBox.confirm(options.text, options.title, {
        confirmButtonText: options.okText || '确定',
        cancelButtonText: options.cancelText || '取消',
        type: (options.type as any) || 'warning',
      })
      return true
    } catch {
      return false
    }
  }

  /** ConfirmModal 回调（ElMessageBox 已自行处理，保留以兼容模板绑定） */
  function ok() {
    state.visible = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  function cancel() {
    state.visible = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  return { state, alert, confirm, ok, cancel }
}
