/**
 * 报销单模块 —— 字典枚举 / 基础数据类型定义
 * 对齐审批流程：code 0草稿 / 1审批中 / 2审批通过 / 3已作废
 * 状态文字统一为系统主题蓝色
 */

// ==================== 单据状态（Integer 型） ====================

export interface StatusOption {
  label: string
  value: number
  /** el-tag 背景色 */
  color: '' | 'success' | 'warning' | 'danger' | 'info'
}

/** 状态码：0草稿 / 1审批中 / 2审批通过 / 3已作废 */
export const STATUS_OPTIONS: StatusOption[] = [
  { label: '草稿', value: 0, color: 'info' },
  { label: '审批中', value: 1, color: 'warning' },
  { label: '审批通过', value: 2, color: 'success' },
  { label: '已作废', value: 3, color: 'danger' },
]

/** 根据状态 value (Integer) 获取 el-tag 颜色 */
export function getStatusColor(value: number): StatusOption['color'] {
  const item = STATUS_OPTIONS.find((s) => s.value === value)
  return item?.color ?? 'info'
}

/** 根据状态 value (Integer) 获取 label */
export function getStatusLabel(value: number): string {
  const item = STATUS_OPTIONS.find((s) => s.value === value)
  return item?.label ?? String(value)
}

/**
 * 操作列权限判断
 * @returns { submit, edit, delete, push, copy } 是否可用
 */
export function getRowActions(status: number) {
  const isDraft = status === 0       // 草稿
  const isApproving = status === 1   // 审批中
  const isApproved = status === 2    // 审批通过
  // const isVoided = status === 3   // 已作废（预留）

  return {
    // 提交：仅 草稿/审批中/审批通过 可操作？不 — 草稿置灰（截图要求），审批中/审批通过已提交过也置灰
    // 实际上：草稿阶段提交灰色（未补录行程不可提交），其他状态均已提交过 → 全部置灰
    // 按规范：草稿置灰禁用；审批中/审批通过/已作废 均已提交或终态→置灰
    submit: false,  // 提交始终不可用（草稿未补录行程、其他状态已提交或终态）

    // 编辑：仅草稿可用
    edit: isDraft,

    // 删除：仅草稿可用
    delete: isDraft,

    // 手工推送：审批中、审批通过可用
    manualPush: isApproving || isApproved,

    // 复制：草稿、审批中、审批通过可用
    copy: isDraft || isApproving || isApproved,
  }
}

// ==================== 基础数据类型（对齐后端API） ====================

/** 公司 */
export interface CompanyOption {
  companyId: string
  companyNo: string
  companyName: string
}

/** 部门 */
export interface DepartmentOption {
  departmentId: string
  departmentNo: string
  departmentName: string
}

/** 员工 */
export interface EmployeeOption {
  employeeId: string
  employeeNo: string
  employeeName: string
}

/** 业务类型树节点 */
export interface BusinessTypeNode {
  businessTypeId: string
  businessTypeNo: string
  businessTypeName: string
  superiorId: string
  hasSubordinate: 0 | 1
  children?: BusinessTypeNode[]
}

/** 城市 */
export interface CityOption {
  cityNo: string
  cityName: string
  cityType: 1 | 2 | 3
}

/** 项目 */
export interface ProjectOption {
  projectId: string
  projectNo: string
  projectName: string
}

/** 通用下拉选项 */
export interface DictOption {
  label: string
  value: string | number
}

/** 基础数据列表 → el-option */
export function toDictOptions<T extends { [key: string]: any }>(
  list: T[],
  valueKey: string,
  labelKey: string,
): DictOption[] {
  return list.map((item) => ({ label: item[labelKey], value: item[valueKey] }))
}
