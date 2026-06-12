import axios from 'axios'

// 成绩记录类型
export interface ScoreRecord {
  studentId: number
  studentName: string
  age: number
  courseId: number
  courseName: string
  score: number
}

// 分页查询参数
export interface ScoreSearchParams {
  current?: number
  size?: number
  studentId?: number | null
  name?: string | null
  age?: number | null
}

// 分页结果
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 统一响应
export interface ApiResult<T> {
  code: number
  msg: string
  data: T
}

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 搜索分页查询成绩
export function getScoreList(params: ScoreSearchParams) {
  return api.get<ApiResult<PageResult<ScoreRecord>>>('/score/search', { params })
}
