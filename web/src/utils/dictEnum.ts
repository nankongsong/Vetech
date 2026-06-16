/**
 * 报销单模块 —— 字典枚举 / 基础数据类型定义
 * 对齐审批流程：code 0草稿 / 1已完成 / 2已作废
 * 状态标签统一为白底+蓝色字体，由列表页 CSS 控制
 */

// ==================== 单据状态（Integer 型） ====================

export interface StatusOption {
  label: string
  value: number
}

/** 状态码：0草稿 / 1已完成 / 2已作废 */
export const STATUS_OPTIONS: StatusOption[] = [
  { label: '草稿', value: 0 },
  { label: '已完成', value: 1 },
  { label: '已作废', value: 2 },
]

/** 根据状态 value (Integer) 获取 label */
export function getStatusLabel(value: number): string {
  const item = STATUS_OPTIONS.find((s) => s.value === value)
  return item?.label ?? String(value)
}

/**
 * 操作列权限判断（三状态：0草稿 / 1已完成 / 2已作废）
 * @param status              单据状态
 * @param isAllRequiredFilled 草稿页必填项是否全部填写（仅影响草稿态的提交按钮）
 * @returns { submit, edit, delete, manualPush, copy, void } 是否可用（true=可用，false=置灰禁用）
 */
export function getRowActions(status: number, isAllRequiredFilled: boolean = false) {
  const isDraft = status === 0       // 草稿
  const isDone = status === 1        // 已完成

  return {
    // 提交/查看：草稿且必填项完成时可提交；仅已完成可查看；已作废完全禁用
    submit: (isDraft && isAllRequiredFilled) || isDone,

    // 编辑：仅草稿可用
    edit: isDraft,

    // 删除：仅草稿可用
    delete: isDraft,

    // 手工推送：仅已完成可用
    manualPush: isDone,

    // 复制：仅草稿、已完成可用；已作废禁用
    copy: isDraft || isDone,

    // 作废：仅已完成可用
    void: isDone,
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
