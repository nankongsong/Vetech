# 差旅费用报销单

基于原生 HTML/CSS/JavaScript 开发的差旅费用报销单页面，无需依赖打包工具，可直接运行。

## 项目结构

```
nankongsong/
├── web/                      # 前端页面目录
│   ├── index.html            # 报销单主页入口
│   ├── server.js             # 简易静态服务器（用于本地预览）
│   ├── css/
│   │   ├── reset.css         # 基础样式重置
│   │   ├── variables.css     # CSS 设计变量
│   │   └── app.css           # 主样式文件
│   └── js/
│       ├── mock.js           # 静态 Mock 数据
│       ├── utils.js          # 工具函数
│       ├── state.js          # 全局状态管理
│       ├── components.js     # 通用组件（Modal/Select/Confirm）
│       ├── app.js            # 应用入口
│       ├── modals/           # 弹窗组件
│       │   ├── confirm.js
│       │   ├── tripModal.js
│       │   └── subsidyModal.js
│       └── sections/         # 页面分区
│           ├── basicInfo.js
│           ├── trip.js
│           ├── subsidy.js
│           ├── total.js
│           ├── allocation.js
│           └── remark.js
└── .trae/
    └── documents/
        ├── PRD.md            # 产品需求文档
        └── TECH_ARCHITECTURE.md  # 技术架构文档
```

## 启动方式

### 方式一：使用内置静态服务器（推荐）

```bash
cd web
node server.js
```

然后在浏览器中访问：http://localhost:8080/

### 方式二：直接打开 HTML 文件

直接双击 `web/index.html` 文件，用浏览器打开即可查看页面。

### 方式三：使用其他静态服务器

```bash
# 使用 Python（需要安装 Python）
cd web
python -m http.server 8080

# 或使用 npx（需要安装 Node.js）
cd web
npx serve . -l 8080
```

## 功能特性

- ✅ 单据头部固定（标题居中、日期显示）
- ✅ 6 个可折叠分区：基础信息、补录行程、补助信息、费用合计、费用归属及分摊、备注信息
- ✅ 补录行程：支持新增、编辑、删除、复制，含人员+日期范围重复校验
- ✅ 补助日历：行/列/全选联动，按城市类型计算补助标准
- ✅ 费用分摊：自动联动计算、均摊功能、比例校验
- ✅ 表单校验：必填项检查、分摊比例合计=100%、金额匹配校验

## 技术栈

- **框架**: 原生 HTML5 + CSS3 + JavaScript (ES6+)
- **样式**: CSS 变量 + Flexbox + Grid
- **图标**: 内联 SVG
- **数据**: 静态 Mock 数据（无需后端）

## 浏览器兼容性

支持 Chrome、Edge、Firefox 等现代浏览器。

## 开发说明

页面所有交互逻辑均已实现，数据使用 Mock 模拟，无需后端接口即可完整体验所有功能。
