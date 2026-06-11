<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { businessTypes, buildBusinessTypeTree } from '@/data/mock'

interface TreeNode {
  businessTypeId: string
  businessTypeName: string
  thereSubordinateNode: '0' | '1'
  children: TreeNode[]
}

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const wrap = ref<HTMLElement | null>(null)
const open = ref(false)
const collapsedMap = ref<Record<string, boolean>>({})

const tree = computed<TreeNode[]>(() => buildBusinessTypeTree() as unknown as TreeNode[])

function toggle() { open.value = !open.value }

function onPick(node: TreeNode) {
  if (node.thereSubordinateNode === '1') {
    collapsedMap.value[node.businessTypeId] = !collapsedMap.value[node.businessTypeId]
  } else {
    emit('update:modelValue', node.businessTypeId)
    open.value = false
  }
}

function onDocClick(e: MouseEvent) {
  if (!wrap.value) return
  if (!wrap.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const displayValue = computed(() => {
  const f = businessTypes.find(o => o.businessTypeId === props.modelValue)
  return f ? f.businessTypeName : ''
})

function isVisible(node: TreeNode, parentChain: string[]): boolean {
  // 检查所有父级是否都没有被折叠
  for (const p of parentChain) {
    if (collapsedMap.value[p]) return false
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
  <div ref="wrap" class="select-wrap" :class="{ open }">
    <div class="form-control" @click="toggle" tabindex="0">
      <input type="text" readonly :value="displayValue" :placeholder="placeholder || '请选择'"
             style="cursor: pointer; background: transparent;" />
      <span class="arrow">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
      </span>
    </div>
    <div class="select-options">
      <template v-for="(item, idx) in flatten()" :key="item.node.businessTypeId + '-' + idx">
        <div v-if="isVisible(item.node, item.parents)"
             class="opt"
             :class="{
               'opt-group': item.depth === 0,
               'opt-child': item.depth === 1,
               'opt-subchild': item.depth >= 2,
               selected: props.modelValue === item.node.businessTypeId
             }"
             @click.stop="onPick(item.node)">
          {{ item.node.businessTypeName }}
        </div>
      </template>
    </div>
  </div>
</template>
