# 差旅费用报销单系统

差旅费用报销单系统，实现出差行程管理、补助日历计算、费用分摊等核心功能，涵盖前后端全链路。

## 目录结构

```
Vetech/
├── backend/                # 后端 - Spring Boot 3 (Java 17)
│   └── Spring/
│       └── src/main/resources/
│           ├── application.yaml   # 应用配置（数据库连接等）
│           └── init.sql           # 数据库初始化脚本
├── web/                  # 前端 - Vue 3 + TypeScript + Element Plus
│   ├── src/              # 源代码
│   ├── vite.config.ts    # Vite 配置（含 API 代理）
│   └── package.json
└── README.md
```

## 技术栈

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.2.12 | 应用框架 |
| Java | 17 | 运行时 |
| MyBatis-Plus | 3.5.11 | ORM 框架 |
| MySQL | 8.0+ | 数据库 |
| Lombok | 1.18.34 | 代码简化 |

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4 | 渐进式框架 (Composition API + `<script setup>`) |
| TypeScript | 5.4 | 类型安全 |
| Vite | 5.4 | 构建工具 |
| Pinia | 2.1 | 状态管理 |
| Element Plus | 2.14 | UI 组件库 |
| Axios | 1.17 | HTTP 客户端 |
| Vue Router | 4.3 | 路由管理 |

## 快速开始

### 环境要求

- JDK 17+
- Node.js 18+ (npm 9+)
- MySQL 8.0+

### 1. 初始化数据库

```bash
# 执行 init.sql 创建数据库表
mysql -u root -p < backend/Spring/src/main/resources/init.sql
```

### 2. 启动后端

```bash
cd backend/Spring
# 修改 application.yaml 中的数据库连接信息
mvn spring-boot:run
```

服务启动后访问：http://localhost:8080

### 3. 启动前端

```bash
cd web
npm install
npm run dev
```

前端启动后访问：http://localhost:5173

> 前端通过 Vite proxy 将 `/api/*` 请求转发到 `http://localhost:8080`，解决跨域问题。

## 功能特性

### 单据管理

- **基础信息**：报销单抬头（申请人、部门、项目、业务类型等）
- **补录行程**：新增、编辑、删除、复制出差行程，含人员+日期范围重复校验
- **补助信息**：补助日历视图，支持行/列/全选联动，按城市类型自动计算补助标准
- **费用合计**：费用明细汇总，与行程、补助数据联动
- **费用归属及分摊**：费用按比例分摊至不同成本中心，自动校验比例总和 = 100%
- **备注信息**：附加备注字段

### 业务校验

- 必填项校验
- 分摊比例总和 = 100%
- 金额数据一致性校验
- 行程人员+日期范围重复检测

## 数据库

`backend/Spring/src/main/resources/init.sql` 包含完整的建表语句，覆盖以下实体：

| 表名 | 说明 |
|------|------|
| reim_main | 报销单主表 |
| reim_trip | 出差行程 |
| reim_subsidy | 补助标准 |
| reim_subsidy_calendar | 补助日历 |
| reim_cost_allocation | 费用分摊 |
| reim_employee | 员工信息 |
| reim_department | 部门信息 |
| reim_company | 公司信息 |
| reim_project | 项目信息 |
| reim_business_type | 业务类型 |
| reim_city | 城市及补助标准配置 |

## 构建部署

### 前端构建

```bash
cd web
npm run build      # 生产构建
npm run preview     # 本地预览构建产物
```

### 后端构建

```bash
cd backend/Spring
mvn clean package -DskipTests
java -jar target/Spring-0.0.1-SNAPSHOT.jar
```
