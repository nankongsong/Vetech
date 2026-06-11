# Vue3 + TypeScript 重构技术文档

## 一、文档信息

| 项目 | 内容 |
| --- | --- |
| 模块名称 | 差旅费用报销单 - Vue3 + TS 重构 |
| 文档版本 | V1.0 |
| 编写日期 | 2026-06-11 |
| 关联 PRD | PRD.md |
| 目标 | 保持原 JS 版功能完全一致，使用 Vue3 + TypeScript + Vite 重构 |

## 二、技术选型

| 维度 | 选型 | 理由 |
| --- | --- | --- |
| 框架 | Vue 3.4+（Composition API + `<script setup>`） | 类型友好、组合式 API 简洁 |
| 语言 | TypeScript 5+ | 强类型保障，与概要设计 5.3 数据契约对齐 |
| 构建 | Vite 5+ | 启动快、HMR 顺滑、原生 ESM |
| 状态 | Pinia 2+ | Vue3 官方推荐，类型推断完善 |
| 样式 | 原生 CSS3 + CSS 变量（保留原 CSS） | 与原页面视觉一致，避免大规模返工 |
| 包管理 | npm | 通用、便于一键启动 |

## 三、目录结构

```
nankongsong/
├── web-vue/                       # Vue3 + TS 重构项目
│   ├── index.html                 # Vite 入口
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── env.d.ts
│   ├── README.md
│   ├── public/
│   └── src/
│       ├── main.ts                # 应用入口
│       ├── App.vue                # 单据页面骨架
│       ├── styles/
│       │   ├── reset.css
│       │   ├── variables.css
│       │   └── app.css
│       ├── types/
│       │   └── models.ts          # 类型定义
│       ├── data/
│       │   └── mock.ts            # 静态 Mock 数据
│       ├── utils/
│       │   ├── format.ts          # 金额/日期工具
│       │   └── id.ts              # id 生成
│       ├── stores/
│       │   └── reimbursement.ts   # Pinia 状态
│       ├── components/
│       │   ├── PanelHeader.vue    # 通用折叠面板头
│       │   ├── DataTable.vue      # 通用表格
│       │   ├── BaseSelect.vue     # 下拉选择
│       │   ├── BusinessTypeSelect.vue  # 业务类型树形下拉
│       │   ├── BaseModal.vue      # 通用弹窗
│       │   ├── ConfirmModal.vue   # 确认弹窗
│       │   ├── TripModal.vue      # 补录行程弹窗
│       │   └── SubsidyModal.vue   # 补助日历弹窗
│       └── sections/
│           ├── DocHeader.vue
│           ├── DocFooter.vue
│           ├── BasicInfo.vue
│           ├── TripSection.vue
│           ├── SubsidySection.vue
│           ├── TotalSection.vue
│           ├── AllocationSection.vue
│           └── RemarkSection.vue
```

## 四、状态管理（Pinia）

```ts
// stores/reimbursement.ts
state:
  meta: { title, submitDate }
  basic: { title, reimburser, department, reimCompany, businessType, reason }
  trips: Trip[]
  subsidies: Subsidy[]
  allocation: Allocation[]
  remark: string
  ui: { collapsed: Record<string, boolean> }

actions:
  setBasic(patch)
  addTrip / updateTrip / deleteTrip / copyTrip
  updateSubsidyCalendar
  setAllocation
  setRemark
  togglePanel

getters:
  subsidyTotal       // 补助总金额
  mealTotal / trafficTotal / commTotal
  allocTotal         // 分摊金额合计
```

## 五、组件设计

- **PanelHeader**：标题 + 折叠箭头 + 右侧插槽（用于放按钮）。
- **BaseSelect / BusinessTypeSelect**：v-model + options，支持树形。
- **BaseModal**：v-model:visible 模式，包含 title / footer 插槽。
- **ConfirmModal**：封装确认提示，自动展示 info / warning 样式。
- **TripModal / SubsidyModal**：保留原校验、联动、计算逻辑。

## 六、计算规则（保持一致）

- 补助城市 = 行程到达城市
- 餐费补助：一线 100/天，二线 80/天，三线 50/天；交通、通讯固定 40/天
- 申请金额 = 标准金额合计；补助金额 = 实际输入金额合计
- 费用合计 = 餐费 + 交通 + 通讯
- 分摊第 1 行比例 = 1 - ∑(第 2+ 行比例)；超限清空；均摊差值放首行
- 提交校验：必填、分摊比例=100%、分摊金额=补助总金额

## 七、迁移策略

1. 保留 `web/` 原项目作为参考（不动）。
2. 新建 `web-vue/` 项目，逐文件重写，**不改变功能、UI、交互**。
3. 所有 CSS 资源原样迁移到 `web-vue/src/styles/`。
4. Mock 数据原样迁移到 `web-vue/src/data/mock.ts`，并补充 TS 类型。

## 八、启动方式

```bash
cd web-vue
npm install
npm run dev
# 浏览器打开 Vite 提示的 URL（默认 http://localhost:5173/）
```

## 九、验收标准

- ✅ UI、交互、校验与原 JS 版本完全一致
- ✅ 所有 Mock 数据保持一致
- ✅ 类型安全：所有 props / state 强类型
- ✅ 组件职责单一、可复用
