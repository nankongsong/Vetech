# 差旅费用报销单 (Vue3 + TypeScript)

基于 Vue 3.4+ / TypeScript 5 / Vite 5 / Pinia 2 重构的差旅费用报销单页面。功能与原 JS 版本完全一致。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **语言**: TypeScript 5
- **构建**: Vite 5
- **状态管理**: Pinia 2
- **样式**: 原生 CSS3（与原 JS 版本完全相同）

## 启动方式

```bash
cd web-vue
npm install
npm run dev
```

启动后访问：http://localhost:5173/

### 构建

```bash
npm run build
npm run preview
```

## 目录结构

```
web-vue/
├── index.html               # Vite 入口
├── package.json
├── tsconfig.json
├── vite.config.ts
├── env.d.ts
└── src/
    ├── main.ts              # 应用入口
    ├── App.vue              # 单据骨架
    ├── styles/              # 样式（reset/variables/app）
    ├── types/
    │   └── models.ts        # 类型定义
    ├── data/
    │   └── mock.ts          # 静态 Mock 数据
    ├── utils/
    │   ├── format.ts        # 金额/日期工具
    │   └── id.ts
    ├── stores/
    │   └── reimbursement.ts # Pinia store
    ├── composables/
    │   └── useConfirm.ts    # 确认弹窗 composable
    ├── components/
    │   ├── PanelHeader.vue
    │   ├── BaseSelect.vue
    │   ├── BusinessTypeSelect.vue
    │   ├── BaseModal.vue
    │   ├── ConfirmModal.vue
    │   ├── TripModal.vue
    │   └── SubsidyModal.vue
    └── sections/
        ├── DocHeader.vue
        ├── DocFooter.vue
        ├── BasicInfo.vue
        ├── TripSection.vue
        ├── SubsidySection.vue
        ├── TotalSection.vue
        ├── AllocationSection.vue
        └── RemarkSection.vue
```

## 功能特性

- 6 个可折叠分区：基础信息、补录行程、补助信息、费用合计、费用归属及分摊、备注信息
- 补录行程：新增、编辑、删除、复制，含人员+日期范围重复校验
- 补助日历：行/列/全选联动，按城市类型计算标准
- 费用分摊：自动联动、均摊、超限清空
- 表单校验：必填项、比例=100%、金额匹配
- 类型安全：所有 props/state 强类型
