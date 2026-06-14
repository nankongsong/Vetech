/**
 * 通用树形数据处理工具
 * —— 将扁平数组转为 Element Plus 树形组件标准结构（children 嵌套）
 */

/** 扁平节点入参（泛型约束：至少含 id / parentId / 名称） */
export interface FlatNode {
  /** 节点唯一标识 */
  id: string
  /** 父节点标识（根节点约定值由调用方传入，如 "none" / "0" / null） */
  parentId: string
  /** 节点显示名称 */
  name: string
  /** 其他字段透传 */
  [key: string]: any
}

/** Element Plus 树形组件标准节点结构 */
export interface TreeNode {
  /** 节点值（绑定 v-model） */
  value: string
  /** 节点显示文本 */
  label: string
  /** 子节点列表 */
  children?: TreeNode[]
  /** 原始数据透传（可选） */
  [key: string]: any
}

/**
 * 扁平数组 → 树形结构
 * @param flatList   扁平数据数组
 * @param rootMark   根节点标记（superiorId 等于该值即为根），默认 "none"
 * @param idKey      节点ID字段名，默认 "businessTypeId"
 * @param nameKey    节点名称字段名，默认 "businessTypeName"
 * @param parentKey  父节点ID字段名，默认 "superiorId"
 * @returns Element Plus el-tree-select 可直接使用的 TreeNode[]
 *
 * @example
 * const tree = buildTree(flatBizTypes, 'none', 'businessTypeId', 'businessTypeName', 'superiorId')
 * // → [{ value: '...', label: '员工差旅活动', children: [...] }, ...]
 */
export function buildTree(
  flatList: FlatNode[],
  rootMark: string = 'none',
  idKey: string = 'businessTypeId',
  nameKey: string = 'businessTypeName',
  parentKey: string = 'superiorId',
): TreeNode[] {
  if (!flatList || flatList.length === 0) return []

  // 1) 全部节点入 map
  const nodeMap = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  for (const item of flatList) {
    const node: TreeNode = {
      value: item[idKey],
      label: item[nameKey],
      children: [],
      // 原始数据透传，方便后续使用
      _raw: { ...item },
    }
    nodeMap.set(item[idKey], node)
  }

  // 2) 根据 parentKey 挂载到父节点的 children
  for (const item of flatList) {
    const node = nodeMap.get(item[idKey])!
    const parentId = item[parentKey]

    if (parentId === rootMark || parentId === undefined || parentId === null) {
      // 根节点
      roots.push(node)
    } else {
      const parent = nodeMap.get(parentId)
      if (parent) {
        parent.children!.push(node)
      } else {
        // 父节点不存在时降级为根节点（容错）
        roots.push(node)
      }
    }
  }

  // 3) 清理空的 children 数组（el-tree-select 节点若无子节点不应有 children 字段）
  function cleanChildren(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.children && node.children.length === 0) {
        delete node.children
      } else if (node.children) {
        cleanChildren(node.children)
      }
    }
  }
  cleanChildren(roots)

  return roots
}

/**
 * 将业务类型扁平数组转为树形（快捷方法）
 * —— 专用于设计文档 5.3.4 业务类型数据结构
 */
export function buildBusinessTypeTree(
  flatList: { businessTypeId: string; businessTypeName: string; superiorId: string; [k: string]: any }[],
): TreeNode[] {
  return buildTree(flatList as FlatNode[], 'none', 'businessTypeId', 'businessTypeName', 'superiorId')
}
