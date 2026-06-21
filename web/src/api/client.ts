import axios, { type AxiosResponse } from 'axios'

const http = axios.create({ baseURL: '/api' })

export interface ApiResult<T = unknown> {
  code: number
  msg: string
  data: T
}

// 统一响应拦截：code===200 返回 data 字段，否则抛错（附带 code 供下游判断）
http.interceptors.response.use(
  (res: AxiosResponse<ApiResult>) => {
    const r = res.data
    if (r.code === 200) return { ...res, data: r.data } as AxiosResponse
    const err = new Error(r.msg || '请求失败') as Error & { code: number }
    err.code = r.code
    return Promise.reject(err)
  },
  (err) => {
    const msg = err.response?.data?.msg || err.message || '网络错误'
    const code = err.response?.data?.code
    const wrapped = new Error(msg) as Error & { code?: number }
    if (code !== undefined) wrapped.code = code
    return Promise.reject(wrapped)
  }
)

export function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  return http.get<T>(url, { params }).then(r => r.data)
}

export function post<T>(url: string, data?: unknown): Promise<T> {
  return http.post<T>(url, data).then(r => r.data)
}

export function put<T>(url: string, data?: unknown): Promise<T> {
  return http.put<T>(url, data).then(r => r.data)
}

export function del<T>(url: string): Promise<T> {
  return http.delete<T>(url).then(r => r.data)
}

/** FormData 文件上传（Content-Type: multipart/form-data） */
export function uploadFile<T>(url: string, formData: FormData): Promise<T> {
  return http.post<T>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}
