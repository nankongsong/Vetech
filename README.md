# 差旅费用报销单 (Vue3 + TypeScript)

基于 Vue 3.4+ / TypeScript 5 / Vite 5 / Pinia 2 开发的差旅费用报销单页面。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **语言**: TypeScript 5
- **构建**: Vite 5
- **状态管理**: Pinia 2
- **样式**: 原生 CSS3

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
nankongsong/
├── web-vue/
│   ├── index.html               # Vite 入口
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── env.d.ts
│   ├── README.md
│   └── src/
│       ├── main.ts              # 应用入口
│       ├── App.vue              # 单据骨架
│       ├── styles/              # 样式
│       ├── types/               # 类型定义
│       ├── data/                # Mock 数据
│       ├── utils/               # 工具函数
│       ├── stores/              # Pinia store
│       ├── composables/         # 组合式函数
│       ├── components/          # 通用组件
│       └── sections/            # 页面分区
└── .trae/
    └── documents/               # 文档
```

## 功能特性

- 6 个可折叠分区：基础信息、补录行程、补助信息、费用合计、费用归属及分摊、备注信息
- 补录行程：新增、编辑、删除、复制，含人员+日期范围重复校验
- 补助日历：行/列/全选联动，按城市类型计算标准
- 费用分摊：自动联动、均摊、超限清空
- 表单校验：必填项、比例=100%、金额匹配
- 类型安全：所有 props/state 强类型
