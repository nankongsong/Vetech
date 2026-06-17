<script setup lang="ts">
import { ref, computed } from 'vue'
import { useReimbursementStore } from '@/stores/reimbursement'

interface TreeNode {
  businessTypeId: string
  businessTypeName: string
  thereSubordinateNode: '0' | '1'
  superiorId: string
  children: TreeNode[]
}

const store = useReimbursementStore()

const props = defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const wrap = ref<HTMLElement | null>(null)
const open = ref(false)
const collapsedMap = ref<Record<string, boolean>>({})

function isExpanded(id: string): boolean {
  // 默认不展开（返回 false），点击后设为 true 才展开
  return !!collapsedMap.value[id]
}

const tree = computed<TreeNode[]>(() => buildTree(store.businessTypes))

function buildTree(list: any[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  list.forEach(n => map.set(n.businessTypeId, { ...n, children: [] }))
  const roots: TreeNode[] = []
  map.forEach(n => {
    if (n.superiorId === 'none' || !map.has(n.superiorId)) {
      roots.push(n)
    } else {
      map.get(n.superiorId)!.children.push(n)
    }
  })
  return roots
}

function onToggleClick() {
  if (props.disabled) return
  open.value = !open.value
}

function onPick(node: TreeNode) {
  if (node.thereSubordinateNode === '1') {
    collapsedMap.value[node.businessTypeId] = !collapsedMap.value[node.businessTypeId]
  } else {
    emit('update:modelValue', node.businessTypeId)
    open.value = false
  }
}

const displayValue = computed(() => {
  const f = store.businessTypes.find(o => o.businessTypeId === props.modelValue)
  return f ? f.businessTypeName : ''
})

function isVisible(node: TreeNode, parentChain: string[]): boolean {
  for (const p of parentChain) {
    if (!isExpanded(p)) return false
  }
  return true
}

function flatten(): Array<{ node: TreeNode; depth: number; parents: string[] }> {
  const result: Array<{ node: TreeNode; depth: number; parents: string[] }> = []
  function walk(nodes: TreeNode[], depth: number, parents: string[]) {
    nodes.forEach(n => {
      result.push({ node: n, depth, parents: [...parents] })
      if (n.children && n.children.length) {
        walk(n.children, depth + 1, [...parents, n.businessTypeId])
      }
    })
  }
  walk(tree.value, 0, [])
  return result
}
</script>

<template>
  <div ref="wrap" class="business-type-select-wrapper" :class="{ open }">
    <div class="business-type-select" :class="{ disabled: props.disabled }" @click.stop="onToggleClick" tabindex="0">
      <input type="text" readonly :value="displayValue" :placeholder="placeholder || '请选择'"
             style="cursor: pointer; background: transparent;" />
      <span class="arrow">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#c0c4cc" stroke-width="1.5"/>
          <line x1="8" y1="8" x2="16" y2="16" stroke="#c0c4cc" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="16" y1="8" x2="8" y2="16" stroke="#c0c4cc" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
    </div>
    <div v-if="open" class="select-options">
      <template v-for="(item, idx) in flatten()" :key="item.node.businessTypeId + '-' + idx">
        <div v-if="isVisible(item.node, item.parents)"
             class="opt"
             :class="{
               'opt-group': item.depth === 0,
               'opt-child': item.depth === 1,
               'opt-subchild': item.depth >= 2,
               selected: props.modelValue === item.node.businessTypeId,
               'has-children': item.node.thereSubordinateNode === '1'
             }"
             @click.stop="onPick(item.node)">
          <span v-if="item.node.thereSubordinateNode === '1'" class="expand-icon" :class="{ expanded: !collapsedMap[item.node.businessTypeId] }">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </span>
          <span v-else class="expand-icon placeholder"></span>
          <span class="opt-text">{{ item.node.businessTypeName }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.business-type-select-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
}
.business-type-select {
  display: flex; align-items: center; justify-content: space-between;
  height: 36px; padding: 0 10px;
  border: 1px solid #dcdfe6; border-radius: 4px;
  background: #fff; cursor: pointer; font-size: 14px;
}
.business-type-select input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  color: #303133;
  line-height: normal;
}
.business-type-select:hover { border-color: #c0c4cc; }
.business-type-select.disabled { background: #f5f7fa; cursor: not-allowed; }
.business-type-select.disabled input { color: #909399; }
.business-type-select.open { border-color: #409eff; }
.arrow {
  color: #c0c4cc;
  flex-shrink: 0;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.business-type-select.open .arrow { transform: rotate(180deg); }
.select-options {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 1100;
  margin-top: 4px; background: #fff; border: 1px solid #e4e7ed;
  border-radius: 4px; box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  max-height: 300px; overflow-y: scroll;
}
.opt {
  display: flex; align-items: center; padding: 6px 12px;
  cursor: pointer; font-size: 14px; color: #303133;
}
.opt:hover { background: #f5f7fa; }
.opt.selected { background: #ecf5ff; color: #409eff; }
.opt-group { font-weight: 600; background: #fafafa; color: #606266; }
.opt-child { padding-left: 30px; }
.opt-subchild { padding-left: 50px; }
.expand-icon {
  width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;
  color: #909399; margin-right: 4px; flex-shrink: 0; transition: transform 0.2s;
}
.expand-icon.expanded { transform: rotate(90deg); }
.expand-icon.placeholder { visibility: hidden; }
.opt-text { flex: 1; }
</style>
