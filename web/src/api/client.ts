import axios, { type AxiosResponse } from 'axios'

const http = axios.create({ baseURL: '/api' })

export interface ApiResult<T = unknown> {
  code: number
  msg: string
  data: T
}

// 统一响应拦截：code===200 返回 data 字段，否则抛错
http.interceptors.response.use(
  (res: AxiosResponse<ApiResult>) => {
    const r = res.data
    if (r.code === 200) return { ...res, data: r.data } as AxiosResponse
    return Promise.reject(new Error(r.msg || '请求失败'))
  },
  (err) => {
    const msg = err.response?.data?.msg || err.message || '网络错误'
    return Promise.reject(msg)
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
