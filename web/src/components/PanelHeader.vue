<script setup lang="ts">
/**
 * 面板头部组件（统一标题栏样式）
 * 用于各 Section 模块的标题展示和折叠控制
 * - 左侧：蓝色装饰竖条 + 标题文字
 * - 右侧：扩展操作区（可选，通过 extra 插槽传入）
 * - 最右侧：折叠箭头图标
 * 点击整个 header 触发折叠/展开切换
 */
defineEmits<{
  // 折叠切换事件，点击标题栏时触发
  (e: 'toggle'): void
}>()
</script>

<template>
  <!-- 外层容器：点击整个区域触发折叠切换 -->
  <div class="panel-header" @click="$emit('toggle')">
    <!-- 内层灰色圆角条：实际的标题栏视觉容器 -->
    <div class="panel-header-inner">
      <!-- 左侧标题区：flex 布局占满剩余空间 -->
      <div class="panel-header-left">
        <!-- 标题文字容器：左侧带蓝色装饰竖条（伪元素实现） -->
        <div class="title-left">
          <span class="panel-title">
            <!-- 标题插槽：优先使用 title 具名插槽，回退到默认插槽 -->
            <slot name="title">
              <slot />
            </slot>
          </span>
        </div>
      </div>
      <!-- 右侧扩展区：通过 extra 插槽传入自定义内容（如金额、按钮等） -->
      <!-- @click.stop 阻止点击冒泡，避免误触折叠 -->
      <div class="panel-header-right" @click.stop>
        <slot name="extra" />
      </div>
      <!-- 折叠箭头图标：向上/向下指示当前展开状态 -->
      <svg class="toggle-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
/* 外层容器：占满宽度，垂直居中，手型光标，禁止文本选中 */
.panel-header {
  display: flex; align-items: center;
  padding: 0 24px; background: #fff;
  cursor: pointer; user-select: none;
}
/* 内层灰色条：实际标题栏视觉效果，圆角 + 浅灰底 + 限宽居中 */
.panel-header-inner {
  display: flex; align-items: center;
  max-width: 1200px; width: 100%; margin: 12px auto;
  background: #f0f2f5;
  height: 44px;
  padding: 0 4px;
  border-radius: 4px;
}
/* 左侧标题区：flex 占满剩余空间，垂直居中 */
.panel-header-left {
  display: flex; align-items: center; gap: 8px;
  height: 100%; flex: 1;
}
/* 标题文字容器：左侧留出装饰竖条的位置 */
.title-left {
  display: flex; align-items: center; height: 100%; flex: 1;
  padding-left: 20px;
  position: relative;
}
/* 蓝色装饰竖条：伪元素绝对定位实现，不占用文档流 */
.title-left::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);  /* 垂直居中 */
  width: 3px;
  height: 16px;
  background: #409eff;           /* 主题蓝色 */
  border-radius: 1px;
}
/* 折叠箭头图标：使用 currentColor 继承文字色，hover 过渡效果 */
.toggle-icon {
  color: #909399; flex-shrink: 0; transition: transform 0.2s;
  margin-left: 8px;
}
/* 标题文字样式 */
.panel-title {
  display: flex; align-items: center; width: 100%;
  font-size: 16px; font-weight: 500; color: #303133;
}
/* 右侧扩展区：flex 布局，主题蓝色文字 */
.panel-header-right {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #409eff;
}
</style>
