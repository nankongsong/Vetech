/**
 * axios 全局封装
 * - 请求拦截器：自动注入 token 认证信息
 * - 响应拦截器：统一处理业务错误 (code !== 200)，ElMessage 弹出提示
 * - 匹配后端统一响应格式：{ code: 200, msg: "操作成功", data: ... }
 */
import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

// -------------------- 创建 axios 实例 --------------------
const request: AxiosInstance = axios.create({
  // 开发环境走 Vite 代理（/api → localhost:8080），生产环境由 nginx 或环境变量指定
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// -------------------- 请求拦截器 --------------------
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 读取 token 并附加到请求头
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// -------------------- 响应拦截器 --------------------
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 后端统一响应：code === 200 表示成功，500 表示业务异常
    if (res.code !== undefined && res.code !== 200) {
      ElMessage.error(res.msg || res.message || '请求失败，请稍后重试')

      // 乐观锁冲突特殊处理
      if (res.code === 40006) {
        ElMessage.warning('数据已被他人修改，请刷新页面后重试')
      }

      return Promise.reject(new Error(res.msg || '请求失败'))
    }

    return res
  },
  (error) => {
    const { response } = error
    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error(response.data?.msg || '服务器内部错误，请稍后重试')
          break
        default:
          ElMessage.error(response.data?.msg || `请求异常 (${response.status})`)
      }
    } else if (error.message?.includes('timeout')) {
      ElMessage.error('请求超时，请检查网络连接')
    } else {
      ElMessage.error('网络异常，请检查网络连接')
    }

    return Promise.reject(error)
  },
)

export default request
