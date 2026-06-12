const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
        HeadingLevel, PageNumber, PageBreak, TableOfContents, LevelFormat } = require('docx');

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const hBg = { fill: "2E75B6", type: ShadingType.CLEAR };
const cm = { top: 60, bottom: 60, left: 100, right: 100 };
const PW = 9360;

function hc(t, w) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: hBg, margins: cm, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, font: "Microsoft YaHei", size: 18, color: "FFFFFF" })] })] }); }
function dc(t, w, a) { return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, margins: cm, children: [new Paragraph({ alignment: a || AlignmentType.LEFT, children: [new TextRun({ text: t || "", font: "Microsoft YaHei", size: 18 })] })] }); }

function p(text, opts) {
  return new Paragraph(Object.assign({ spacing: { after: 100 }, children: [new TextRun(Object.assign({ text, font: "Microsoft YaHei", size: 22 }, (opts || {})))] }));
}
function bullet(text) {
  return new Paragraph({ spacing: { after: 60 }, indent: { left: 720 }, children: [new TextRun({ text: "● " + text, font: "Microsoft YaHei", size: 22 })] });
}
function codeBlock(text) {
  return new Paragraph({ spacing: { after: 80 }, indent: { left: 360 }, children: [new TextRun({ text, font: "Consolas", size: 18, color: "333333" })] });
}

function makeTable(title, headers, rows, colWidths) {
  const tw = colWidths.reduce((a, b) => a + b, 0);
  const hr = new TableRow({ children: headers.map((c, i) => hc(c, colWidths[i])), tableHeader: true });
  const dr = rows.map(row => new TableRow({ children: row.map((cell, i) => dc(cell, colWidths[i], i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER)) }));
  return [
    new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: title, bold: true, font: "Microsoft YaHei", size: 20, color: "2E75B6" })] }),
    new Table({ width: { size: tw, type: WidthType.DXA }, columnWidths: colWidths, rows: [hr, ...dr] })
  ];
}

// ── Document Content ──
const children = [];

// Title
children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "差旅报销单（Vetech）", bold: true, font: "Microsoft YaHei", size: 44, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "详细设计规范文档", bold: true, font: "Microsoft YaHei", size: 36, color: "333333" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "所属项目：胜意科技训练营-差旅报销单    版本：V1.0    撰写人：后端开发组    日期：2025-06-11", font: "Microsoft YaHei", size: 20, color: "666666" })] }),
);

// Revision
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("修订记录")] }),
  ...makeTable("", ["序号", "版本", "日期", "作者", "修改描述"], [["1", "V1.0", "2025-06-11", "后端开发组", "初始版本，完成详细设计"]], [1200, 1200, 1800, 1800, 3360]),
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("目录")] }),
  new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-3" }),
);

// ── 开发须知 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("开发须知")] }),
  p("详细设计是在充分理解需求的基础上，进行设计文档的编写，设计文档应充分说明复杂功能、核心功能关键实现方法、步骤、路径，应体现设计者对于需求的理解，以及知道如何实现。详细设计文档也是指导实现者如何实现的参考指南。"),
  p("本项目为胜意科技训练营的差旅报销单系统，团队3人协作开发。本文档涵盖整个项目的详细设计，重点关注后端部分（数据库设计、API接口、业务逻辑、关键技术点）。"),
  p("技术栈：Spring Boot 3.2.12 + MyBatis-Plus 3.5.11 + MySQL 8.0 + Java 17 + Lombok。"),
);

// ── 1. 非功能性需求 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. 非功能性需求")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 可靠性")] }),
  p("系统在异常情况下或非法输入时保持正常运行的能力。"),
  p("容错性：", { bold: true }),
  bullet("保存草稿时允许部分数据为空，不阻塞用户操作流程"),
  bullet("提交报销单时进行完整校验，失败时返回明确错误信息而非系统异常"),
  bullet("数据库连接失败时返回友好错误提示，不影响其他功能"),
  p("健壮性：", { bold: true }),
  bullet("所有接口对非法输入参数进行校验，防止SQL注入和XSS攻击"),
  bullet("金额字段使用BigDecimal，避免浮点精度问题"),
  bullet("乐观锁机制确保并发编辑时数据一致性，冲突时提示用户刷新后重试"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 高性能")] }),
  bullet("响应时间：一般查询接口在95%情况下响应时间不超过1秒"),
  bullet("分页查询使用MyBatis-Plus分页插件，避免全表扫描"),
  bullet("基础数据接口（公司/部门/员工/城市等）数据量小，可考虑缓存"),
  bullet("数据库索引覆盖主要查询条件（状态、报销人、报销单号等）"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.3 可维护性")] }),
  bullet("严格分层架构：Controller → Service → Mapper，职责清晰"),
  bullet("统一响应格式Result<T>，前端统一处理"),
  bullet("全局异常处理器，统一错误码管理"),
  bullet("代码符合阿里巴巴Java开发规范，命名语义化"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.4 安全性")] }),
  bullet("后端对所有输入参数进行校验（不仅依赖前端校验）"),
  bullet("金额、比例等关键业务数据在服务端做最终校验"),
  bullet("乐观锁防止并发数据覆盖"),
  bullet("状态机控制：草稿→已完成→已作废，不可逆向操作"),
);

// ── 2. 术语定义 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. 术语定义")] }),
  ...makeTable("", ["缩写/术语", "全称", "说明"], [
    ["报销单", "Reimbursement", "员工因公出差后与企业进行报账结算的单据"],
    ["补助", "Subsidy", "出差期间的餐费、交通、通讯补贴"],
    ["补助日历", "Subsidy Calendar", "按日期展示的补助项选择矩阵"],
    ["费用分摊", "Cost Allocation", "将补助费用按比例分摊到不同项目"],
    ["草稿", "Draft (status=0)", "报销单未填写完成时的临时保存状态"],
    ["已完成", "Completed (status=1)", "报销单所有数据填写完整并提交后的状态"],
    ["已作废", "Voided (status=2)", "已完成的报销单被作废的状态"],
    ["乐观锁", "Optimistic Lock", "通过version字段防止并发修改冲突的机制"],
    ["MyBatis-Plus", "MP", "MyBatis增强工具，提供BaseMapper和分页等功能"],
    ["Result<T>", "统一响应体", "标准JSON响应：{code, msg, data}"],
  ], [1800, 2800, 4760]),
);

// ── 3. 功能性需求描述 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. 功能性需求描述")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 需求概述")] }),
  p("员工因公出差先垫钱消费，结束后与企业报账结算。本系统实现差旅报销单的填写、保存、提交、作废全流程管理。不含审批流程。"),
  p("核心功能需求：", { bold: true }),
  bullet("需求1：报销单列表页 — 支持多条件搜索、分页展示报销单列表"),
  bullet("需求2：报销单详情页 — 填写基本信息、补录行程、查看补助日历、配置费用分摊"),
  bullet("需求3：报销单提交 — 全面数据校验后将草稿提交为已完成状态（含事务控制）"),
  bullet("需求4：报销单作废 — 将已完成的报销单标记为已作废"),
  bullet("需求5：基础数据管理 — 提供公司、部门、员工、业务类型、城市、项目的下拉选项查询"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 业务全景图")] }),
  p("业务流程：用户打开系统 → 查看报销单列表 → 新增报销单(草稿) → 填写基本信息 → 补录行程(自动生成补助信息+补助日历) → 修改补助日历(勾选/调整金额) → 配置费用分摊 → 提交报销单(校验+状态变更) → 财务查看(非本系统范围)"),
  p("单据状态流转：草稿(0) → 已完成(1) → 已作废(2)。注意：草稿可直接删除，已完成状态不可逆转为草稿。"),
);

// ── 4. 功能详细设计 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. 功能详细设计")] }),

  // 4.1 报销单列表
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 报销单列表查询")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.1.1 功能内容")] }),
  bullet("查询条件：报销单号、标题、事由（模糊搜索）；费用归属公司、报销部门、报销人、业务类型（下拉选择）；单据状态"),
  bullet("列表展示：报销单号(可点击跳转)、单据状态、报销人(姓名+工号)、报销部门(名称+编号)、费用归属公司、业务类型、报销标题、出差事由、补助金额(右对齐)、创建时间"),
  bullet("操作按钮：编辑、删除（草稿）、作废（已完成）、提交（草稿）。超过3个操作收起至「更多」图标"),
  bullet("分页支持，默认每页10条"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.1.2 实现逻辑")] }),
  p("后端实现流程："),
  bullet("1. Controller接收分页参数 + 查询条件"),
  bullet("2. Service层构建MyBatis-Plus的QueryWrapper/LambdaQueryWrapper，动态拼接查询条件"),
  bullet("3. Mapper层使用BaseMapper的selectPage方法执行分页查询"),
  bullet("4. 返回PageResult对象，包含total/pages/current/size/records"),
  p("关键代码逻辑：使用MyBatis-Plus的Page对象 + LambdaQueryWrapper，对模糊搜索字段使用like，对精确匹配字段使用eq。"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.1.3 异常处置")] }),
  bullet("查询参数异常（如page<0）：返回默认第一页数据"),
  bullet("数据库异常：全局异常处理器捕获，返回500错误码"),

  // 4.2 报销单详情
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 报销单详情查询")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.2.1 功能内容")] }),
  bullet("一次性返回报销单完整信息：主表信息 + 行程明细列表 + 补助信息列表 + 费用分摊列表"),
  bullet("若报销单不存在，返回40001错误码"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.2.2 实现逻辑")] }),
  bullet("1. 根据ID查询reim_main"),
  bullet("2. 根据main_id查询reim_trip列表"),
  bullet("3. 根据main_id查询reim_subsidy列表"),
  bullet("4. 根据main_id查询reim_cost_allocation列表"),
  bullet("5. 组装为ReimDetailVO对象返回"),
  p("序列图：前端请求 → Controller → Service.getDetail(id) → 并行查询4张表 → 组装VO → 返回JSON"),

  // 4.3 新增/编辑报销单
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 新增与编辑报销单（草稿）")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.3.1 功能内容")] }),
  bullet("新增：创建报销单，状态默认为草稿(0)，生成报销单号（格式：BX-YYYYMMDD-XXXX序号）"),
  bullet("编辑：更新报销单基本信息，需传入version进行乐观锁校验"),
  bullet("草稿状态允许部分字段为空"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.3.2 实现逻辑")] }),
  p("新增流程："),
  bullet("1. 前端发送POST请求，携带基本信息"),
  bullet("2. 后端生成报销单号（查询当天最大序号+1）"),
  bullet("3. 设置status=0，version=0"),
  bullet("4. 保存到reim_main表，返回新ID"),
  p("编辑流程："),
  bullet("1. 校验version是否匹配（WHERE id=? AND version=?）"),
  bullet("2. 若不匹配返回40006错误码（乐观锁冲突）"),
  bullet("3. 若匹配则更新数据，version+1"),

  // 4.4 行程管理
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.4 补录行程管理")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.4.1 功能内容")] }),
  bullet("支持多条行程的新增、编辑、删除、复制"),
  bullet("每条行程：出行人员、出发城市、到达城市、出发日期、到达日期、行程说明"),
  bullet("保存行程时自动生成关联的补助信息和补助日历"),
  bullet("唯一性校验：同一报销单内，出行人员+日期范围不可重叠"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.4.2 实现逻辑")] }),
  p("新增行程流程（后端核心逻辑）："),
  bullet("1. 校验必填字段和日期合法性（到达日期≥出发日期，不可晚于当前日期）"),
  bullet("2. 唯一性校验：查询reim_trip WHERE main_id=? AND traveler_id=? AND (start_date BETWEEN ? AND ? OR end_date BETWEEN ? AND ?)"),
  bullet("3. 若存在重复，返回40003错误码"),
  bullet("4. 保存行程记录到reim_trip"),
  bullet("5. 查询到达城市的city_type，计算补助标准"),
  bullet("6. 自动生成reim_subsidy记录（天数=endDate-startDate+1）"),
  bullet("7. 按天遍历生成reim_subsidy_calendar记录（每条=日期+星期+三种补助标准+默认全选中）"),
  bullet("8. 以上操作在同一事务方法内完成"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.4.3 异常处置")] }),
  bullet("日期校验失败 → 返回40008错误码"),
  bullet("人员+日期重复 → 返回40003错误码"),
  bullet("事务中任何步骤失败 → 回滚所有操作"),

  // 4.5 补助日历
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.5 补助日历管理")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.5.1 功能内容")] }),
  bullet("按天展示补助项：餐补、交补、通补"),
  bullet("补助标准：餐补按城市等级（一线100/二线80/三线50元/天），交补40元/天，通补40元/天"),
  bullet("用户可勾选/取消每天的各项补助，申请金额默认为标准金额，可手动修改"),
  bullet("申请金额不可大于标准金额，只能输入正数"),
  bullet("补助金额 = 所有勾选项申请金额之和"),
  bullet("标准总额 = 所有勾选项标准金额之和"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.5.2 实现逻辑")] }),
  bullet("1. 查询reim_subsidy_calendar WHERE subsidy_id=? ORDER BY subsidy_date"),
  bullet("2. 保存时批量更新calendar记录：勾选状态 + 申请金额"),
  bullet("3. 更新reim_subsidy的apply_amount和subsidy_amount字段"),
  bullet("4. 重新计算reim_main的补助合计字段"),

  // 4.6 费用分摊
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.6 费用分摊管理")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.6.1 功能内容")] }),
  bullet("分摊金额 = 补助总金额"),
  bullet("每条分摊包含：费用归属公司、项目、分摊比例、分摊金额"),
  bullet("第1行分摊比例和金额自动计算（100% - 其他行总和），不可手动编辑"),
  bullet("第2+行可手动输入分摊比例，联动更新第1行"),
  bullet("均摊按钮：按分摊条数平均分配比例和金额，除不尽差值放第1行"),
  bullet("至少保留1条分摊信息"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.6.2 实现逻辑")] }),
  p("均摊算法："),
  bullet("1. 分摊比例 = 1/分摊条数，保留4位小数"),
  bullet("2. 第1行比例 = 1 - ∑(第2~N行比例)"),
  bullet("3. 分摊金额 = 补助总金额 × 分摊比例（逐条计算，最后一条用减法保证合计精确）"),
  bullet("4. 第1行金额 = 补助总金额 - ∑(第2~N行金额)"),

  // 4.7 提交报销单
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.7 提交报销单（核心功能）")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.7.1 功能内容")] }),
  bullet("将草稿状态(0)的报销单提交为已完成状态(1)"),
  bullet("提交时进行全面校验，所有校验通过后才允许状态变更"),
  bullet("使用@Transactional确保事务一致性"),
  bullet("使用乐观锁@Version防止并发提交冲突"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.7.2 实现逻辑")] }),
  p("提交流程（后端核心事务方法）："),
  codeBlock("@Transactional(rollbackFor = Exception.class)"),
  codeBlock("public void submitReimbursement(Long id, Integer version) {"),
  bullet("Step 1: 查询报销单 WHERE id=? AND version=? — 乐观锁校验"),
  bullet("Step 2: 校验status=0（草稿），否则抛异常40002"),
  bullet("Step 3: 校验必填字段（基本信息所有字段非空）"),
  bullet("Step 4: 校验至少存在1条行程记录"),
  bullet("Step 5: 校验行程人员+日期唯一性（同4.4.2校验逻辑）"),
  bullet("Step 6: 校验补助日历数据完整性"),
  bullet("Step 7: 校验分摊比例之和 = 100%（±0.01容差）"),
  bullet("Step 8: 校验分摊金额合计 = 补助总金额"),
  bullet("Step 9: 更新status=1，version=version+1"),
  bullet("Step 10: 更新reim_main的补助合计字段"),
  codeBlock("}"),
  p("若任何步骤失败，事务回滚，返回对应错误码。"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.7.3 异常处置")] }),
  bullet("乐观锁冲突 → 返回40006: 数据已被他人修改，请刷新后重试"),
  bullet("必填字段缺失 → 返回40007，附带缺失字段列表"),
  bullet("分摊比例异常 → 返回40004"),
  bullet("分摊金额异常 → 返回40005"),
  bullet("数据库异常 → 事务回滚，返回500"),

  // 4.8 作废
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.8 作废报销单")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.8.1 功能内容")] }),
  bullet("将已完成(1)的报销单变更为已作废(2)状态"),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.8.2 实现逻辑")] }),
  bullet("1. 校验status=1且version匹配"),
  bullet("2. 更新status=2，version+1"),
  bullet("3. 草稿状态不可作废，需先提交"),
);

// ── 5. 技术实现设计 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. 技术实现设计")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 系统结构设计")] }),
  p("系统采用B/S三层架构：前端Vue3 + Element Plus → 后端Spring Boot REST API → MySQL数据库"),
  p("后端模块划分：", { bold: true }),
  ...makeTable("", ["一级模块", "二级模块", "三级模块/任务", "说明"], [
    ["报销单管理", "报销单CRUD", "reim_main相关接口", "列表查询/详情/新增/编辑/删除"],
    ["报销单管理", "报销单流程", "提交/作废接口", "状态变更+事务控制"],
    ["行程管理", "行程CRUD", "reim_trip相关接口", "新增/编辑/删除行程"],
    ["行程管理", "补助生成", "自动生成补助+日历", "行程保存时级联创建"],
    ["补助管理", "补助日历", "calendar查询/更新", "按天展示+勾选+金额修改"],
    ["补助管理", "补助计算", "城市等级→补助标准", "一线100/二线80/三线50"],
    ["费用分摊", "分摊CRUD", "allocation查询/更新", "比例录入+联动计算"],
    ["费用分摊", "均摊算法", "等比例分摊", "除不尽差值放首行"],
    ["基础数据", "下拉选项", "6个基础数据接口", "公司/部门/员工/业务类型/城市/项目"],
    ["公共模块", "统一响应", "Result<T>", "{code, msg, data}"],
    ["公共模块", "异常处理", "GlobalExceptionHandler", "@RestControllerAdvice"],
    ["公共模块", "分页配置", "MybatisPlusConfig", "PaginationInnerInterceptor"],
  ], [1600, 1600, 2300, 3860]),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 接口及核心类设计")] }),
  p("核心类清单：", { bold: true }),
  ...makeTable("", ["类名", "所属包", "说明"], [
    ["Application.java", "com.example.spring", "Spring Boot启动类"],
    ["MybatisPlusConfig.java", "config", "MyBatis-Plus分页插件配置 + @MapperScan"],
    ["ReimMain.java", "entity", "报销单主表实体，含@Version乐观锁字段"],
    ["ReimTrip.java", "entity", "行程明细表实体"],
    ["ReimSubsidy.java", "entity", "补助信息表实体"],
    ["ReimSubsidyCalendar.java", "entity", "补助日历表实体"],
    ["ReimCostAllocation.java", "entity", "费用分摊表实体"],
    ["ReimCompany/Department/Employee/etc.", "entity", "基础数据表实体（6个）"],
    ["ReimMainMapper.java", "mapper", "继承BaseMapper<ReimMain>"],
    ["ReimMainService.java", "service", "报销单业务接口"],
    ["ReimMainServiceImpl.java", "service.impl", "报销单核心业务实现（事务+校验）"],
    ["ReimMainController.java", "controller", "报销单REST控制器 @RequestMapping(\"/api/reim\")"],
    ["BaseDataController.java", "controller", "基础数据REST控制器"],
    ["ReimDetailVO.java", "vo", "报销单详情聚合VO（含main+trips+subsidies+allocations）"],
    ["ReimPageDTO.java", "dto", "列表查询参数（分页+搜索条件）"],
    ["Result.java", "vo", "统一响应体：code+msg+data"],
    ["GlobalExceptionHandler.java", "config", "全局异常拦截器 + 错误码映射"],
    ["BizException.java", "exception", "业务异常类（code+message）"],
  ], [3200, 2400, 3760]),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.3 与前端的交互")] }),
  p("前端通过Axios调用后端REST API，所有接口返回统一Result<T>格式。"),
  p("前端需要的控件数据均由后端接口提供：", { bold: true }),
  bullet("费用归属公司下拉 → GET /api/company/list"),
  bullet("报销部门下拉 → GET /api/department/list"),
  bullet("报销人/出行人下拉 → GET /api/employee/list"),
  bullet("业务类型树形下拉 → GET /api/business-type/tree"),
  bullet("城市下拉 → GET /api/city/list"),
  bullet("项目下拉 → GET /api/project/list"),
  bullet("报销单列表/详情/保存 → /api/reim/* 系列接口"),
  p("前端需处理的交互（与后端配合）：", { bold: true }),
  bullet("提交操作前做前端初步校验，减少无效请求"),
  bullet("乐观锁冲突时（code=40006），提示用户刷新页面"),
  bullet("分摊比例联动计算可以在前端实时完成，后端做最终校验"),
);

// ── 6. 关键技术点 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. 关键技术点")] }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 事务控制")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.1.1 数据库局部事务")] }),
  p("对于需要满足数据库本地事务要求的关键业务代码，使用@Transactional注解实现声明式事务。"),
  p("关键事务场景：", { bold: true }),
  bullet("提交报销单：更新主表状态 + 重新计算补助合计 + 分摊金额校验 → 一个事务"),
  bullet("新增行程：保存行程 + 生成补助信息 + 生成补助日历 → 一个事务"),
  bullet("删除行程：删除行程 + 删除关联补助 + 删除补助日历 + 更新主表合计 → 一个事务"),
  p("实现方式：在Service层方法上添加@Transactional(rollbackFor = Exception.class)，确保任何异常都触发回滚。事务隔离级别使用默认READ_COMMITTED。"),
  codeBlock("@Transactional(rollbackFor = Exception.class)"),
  codeBlock("public void submitReimbursement(Long id, Integer version) { ... }"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.1.2 分布式事务")] }),
  p("当前项目为单体应用，暂不涉及分布式事务。若后续引入微服务，推荐通过补偿机制+重试实现最终一致性。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.2 乐观锁并发控制")] }),
  p("使用场景：报销单编辑和提交时，防止多个用户/请求同时修改同一报销单导致数据覆盖。"),
  p("实现方式：", { bold: true }),
  bullet("reim_main表添加version字段（INT，初始0）"),
  bullet("实体类使用@Version注解标识"),
  bullet("MyBatis-Plus自动在UPDATE语句中添加WHERE version = ?条件"),
  bullet("若影响行数为0，说明version已被修改，抛出OptimisticLockException"),
  bullet("业务层捕获后转换为业务异常40006，提示用户刷新重试"),
  p("核心SQL逻辑：UPDATE reim_main SET ... , version = version + 1 WHERE id = ? AND version = ?"),
  p("注意：仅在更新已有数据时需要乐观锁，新增操作不需要。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.3 行程唯一性校验")] }),
  p("同一报销单内，出行人员+日期范围不能重叠。"),
  p("校验SQL："),
  codeBlock("SELECT COUNT(*) FROM reim_trip"),
  codeBlock("WHERE main_id = #{mainId} AND traveler_id = #{travelerId}"),
  codeBlock("AND (start_date BETWEEN #{startDate} AND #{endDate}"),
  codeBlock("     OR end_date BETWEEN #{startDate} AND #{endDate})"),
  codeBlock("AND id != #{excludeId}  -- 编辑时排除自身"),
  p("若count > 0，返回错误码40003。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.4 统一错误码")] }),
  ...makeTable("", ["错误码", "说明", "触发场景"], [
    ["200", "操作成功", "正常响应"],
    ["500", "系统异常", "未预期的运行时异常"],
    ["40001", "报销单不存在", "ID查不到记录"],
    ["40002", "状态不允许操作", "已完成状态编辑/草稿状态作废等"],
    ["40003", "行程人员+日期重复", "同一人员日期范围重叠"],
    ["40004", "分摊比例之和不为100%", "提交时分摊比例校验不通过"],
    ["40005", "分摊金额不等于补助总金额", "提交时分摊金额校验不通过"],
    ["40006", "乐观锁冲突", "version不匹配"],
    ["40007", "必填字段未填写", "提交时缺少必填项"],
    ["40008", "日期校验失败", "到达早于出发/晚于当前日期"],
    ["40009", "补助金额超标准", "申请金额>标准金额"],
    ["40010", "至少一条分摊", "删除分摊时最后一条"],
  ], [1200, 3500, 4660]),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.5 其他技术要点")] }),
  p("异动日志：", { bold: true }),
  bullet("提交和作废操作需记录异动日志（状态变更前→后），便于审计追踪"),
  p("数据生命周期：", { bold: true }),
  bullet("草稿状态报销单若超过30天未提交，可考虑定期清理（Job实现，本期不强制）"),
  p("敏感信息：", { bold: true }),
  bullet("员工姓名、工号等作为业务展示字段，当前系统无密码等高度敏感信息"),
  bullet("数据库密码等配置敏感信息不应硬编码在application.yaml中（部署时使用环境变量或配置中心）"),
);

// ── 7. 数据库设计 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. 数据库设计")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.1 数据库表设计")] }),
  p("数据库：vetech_reim  字符集：utf8mb4  引擎：InnoDB"),
  p("共11张表：5张业务主表 + 6张基础数据表。完整表结构定义请参见《差旅报销单_表结构定义文档》。"),
  p("核心表关系：", { bold: true }),
  bullet("reim_main (1) ──< (N) reim_trip (1) ──< (N) reim_subsidy (1) ──< (N) reim_subsidy_calendar"),
  bullet("reim_main (1) ──< (N) reim_cost_allocation"),
  bullet("基础数据表（company/department/employee/business_type/city/project）通过业务ID与业务表逻辑关联"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.2 数据库访问模块设计")] }),
  p("采用MyBatis-Plus的BaseMapper模式："),
  bullet("每个Entity对应一个Mapper接口，继承BaseMapper<T>，自动获得CRUD方法"),
  bullet("复杂查询（如多表联查、动态条件）通过XML Mapper自定义SQL实现"),
  bullet("分页查询统一使用MyBatis-Plus的Page对象 + PaginationInnerInterceptor拦截器"),
  bullet("Service层通过ServiceImpl<M, T>继承获得批量操作能力"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.3 数据流向图")] }),
  p("读操作：前端 → Controller → Service → Mapper(selectPage/selectById) → MySQL → Entity/DTO → Result封装 → JSON响应"),
  p("写操作：前端 → Controller → Service(@Transactional) → Mapper(insert/update/delete) → MySQL → 返回影响行数 → Result封装"),
  p("提交操作（关键数据流）：Controller.submit() → Service.submitReimbursement() → [版本检查 → 状态检查 → 必填校验 → 行程唯一性检查 → 分摊比例校验 → 分摊金额校验 → 更新状态 → 更新合计] all in one transaction → 返回结果"),
);

// ── 8. WBS ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. WBS任务分解")] }),
  ...makeTable("", ["阶段", "模块", "任务名称", "负责人", "预计工时", "输出要求"], [
    ["需求评审", "需求", "理解概要设计", "全员", "0.5天", "明确功能边界"],
    ["详细设计", "设计", "数据库表结构设计", "后端", "0.5天", "表结构定义文档"],
    ["详细设计", "设计", "API接口定义", "后端", "0.5天", "API接口文档"],
    ["详细设计", "设计", "详细设计文档编写", "后端", "1天", "详细设计规范文档"],
    ["详细设计", "设计", "前端页面设计", "前端", "1天", "UI设计稿"],
    ["开发", "后端", "项目环境搭建（Spring Boot + MP）", "后端", "0.5天", "可运行的空项目"],
    ["开发", "后端", "基础数据CRUD（6张表+接口）", "后端", "0.5天", "基础数据接口可用"],
    ["开发", "后端", "报销单CRUD（列表/详情/新增/编辑）", "后端", "1天", "报销单增删改查接口"],
    ["开发", "后端", "行程管理（新增/编辑/删除+补助生成）", "后端", "1天", "行程+补助级联创建"],
    ["开发", "后端", "补助日历管理（查询/更新）", "后端", "0.5天", "日历勾选+金额修改"],
    ["开发", "后端", "费用分摊（比例联动+均摊算法）", "后端", "0.5天", "分摊计算逻辑"],
    ["开发", "后端", "提交报销单（事务+校验+乐观锁）", "后端", "1天", "核心提交流程"],
    ["开发", "后端", "作废/删除+全局异常处理", "后端", "0.5天", "辅助功能"],
    ["开发", "前端", "项目初始化（Vue3 + Element Plus）", "前端", "0.5天", "可运行的前端项目"],
    ["开发", "前端", "报销单列表页", "前端", "1天", "搜索+分页列表"],
    ["开发", "前端", "报销单详情页（基本信息区）", "前端", "1天", "表单+下拉选项"],
    ["开发", "前端", "补录行程弹框+列表", "前端", "1天", "行程管理"],
    ["开发", "前端", "补助信息+补助日历弹窗", "前端", "1.5天", "补助日历勾选矩阵"],
    ["开发", "前端", "费用分摊+备注+底部按钮", "前端", "1天", "分摊均摊+提交"],
    ["联调测试", "测试", "前后端联调", "全员", "1天", "全流程可用"],
    ["联调测试", "测试", "自测报告编写", "全员", "0.5天", "自测报告文档"],
    ["答辩准备", "文档", "答辩PPT", "全员", "0.5天", "演示PPT"],
    ["答辩准备", "演练", "答辩演练", "全员", "0.5天", "熟悉演示流程"],
  ], [1000, 800, 3000, 800, 800, 2960]),
);

// ── 9. 附录 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("附录：API接口定义明细")] }),
  p("完整API接口定义请参见《差旅报销单_API接口文档》。以下为接口摘要：", { bold: true }),
  p(""),
  ...makeTable("", ["分类", "接口", "方法", "路径"], [
    ["基础数据", "查询公司列表", "GET", "/api/company/list"],
    ["基础数据", "查询部门列表", "GET", "/api/department/list"],
    ["基础数据", "查询员工列表", "GET", "/api/employee/list"],
    ["基础数据", "查询业务类型树", "GET", "/api/business-type/tree"],
    ["基础数据", "查询城市列表", "GET", "/api/city/list"],
    ["基础数据", "查询项目列表", "GET", "/api/project/list"],
    ["报销单", "分页查询列表", "GET", "/api/reim/page"],
    ["报销单", "查询详情", "GET", "/api/reim/{id}"],
    ["报销单", "新增草稿", "POST", "/api/reim"],
    ["报销单", "更新草稿", "PUT", "/api/reim/{id}"],
    ["报销单", "提交", "PUT", "/api/reim/{id}/submit"],
    ["报销单", "作废", "PUT", "/api/reim/{id}/void"],
    ["报销单", "删除草稿", "DELETE", "/api/reim/{id}"],
    ["行程", "新增行程", "POST", "/api/reim/{mainId}/trip"],
    ["行程", "更新行程", "PUT", "/api/reim/{mainId}/trip/{tripId}"],
    ["行程", "删除行程", "DELETE", "/api/reim/{mainId}/trip/{tripId}"],
    ["补助", "查询补助日历", "GET", "/api/reim/{mainId}/subsidy/{subsidyId}/calendar"],
    ["补助", "更新补助日历", "PUT", "/api/reim/{mainId}/subsidy/{subsidyId}/calendar"],
    ["分摊", "查询分摊信息", "GET", "/api/reim/{mainId}/allocation"],
    ["分摊", "更新分摊信息", "PUT", "/api/reim/{mainId}/allocation"],
    ["分摊", "均摊计算", "PUT", "/api/reim/{mainId}/allocation/equal-split"],
  ], [1200, 2200, 1200, 4760]),
);

// ── Build document ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 34, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
        paragraph: { spacing: { before: 260, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Microsoft YaHei", color: "404040" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "差旅报销单 - 详细设计文档 V1.0", font: "Microsoft YaHei", size: 16, color: "999999", italics: true })] })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 16 }), new TextRun({ text: " 页", font: "Microsoft YaHei", size: 16 })] })] })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("E:\\Java vet\\项目文档\\差旅报销单_详细设计文档.docx", buf));
console.log("Done: 详细设计文档 created.");
