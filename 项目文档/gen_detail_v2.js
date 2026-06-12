const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
        HeadingLevel, PageNumber, PageBreak, TableOfContents } = require('docx');

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const bdr = { top: border, bottom: border, left: border, right: border };
const hBg = { fill: "2E75B6", type: ShadingType.CLEAR };
const subBg = { fill: "D6E4F0", type: ShadingType.CLEAR };
const grayBg = { fill: "F2F2F2", type: ShadingType.CLEAR };
const greenBg = { fill: "E2EFDA", type: ShadingType.CLEAR };
const cm = { top: 60, bottom: 60, left: 100, right: 100 };
const PW = 9360;

function hc(t, w, bg) { return new TableCell({ borders: bdr, width: { size: w, type: WidthType.DXA }, shading: bg || hBg, margins: cm, verticalAlign: "center", children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, font: "Microsoft YaHei", size: 18, color: (bg ? "333333" : "FFFFFF") })] })] }); }
function dc(t, w, a, opts) { return new TableCell({ borders: bdr, width: { size: w, type: WidthType.DXA }, margins: cm, shading: (opts && opts.shading) || undefined, children: [new Paragraph({ alignment: a || AlignmentType.LEFT, children: [new TextRun({ text: t || "", font: "Microsoft YaHei", size: 18 })] })] }); }

function makeTable(title, headers, rows, colWidths) {
  const tw = colWidths.reduce((a, b) => a + b, 0);
  const hr = new TableRow({ children: headers.map((c, i) => hc(c, colWidths[i])), tableHeader: true });
  const dr = rows.map(row => new TableRow({ children: row.map((cell, i) => {
    const extra = [];
    if (row._shading && i === 0) extra.push({ shading: row._shading });
    return dc(cell, colWidths[i], i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, extra.length ? extra[0] : undefined);
  })}));
  return [
    new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: title, bold: true, font: "Microsoft YaHei", size: 20, color: "2E75B6" })] }),
    new Table({ width: { size: tw, type: WidthType.DXA }, columnWidths: colWidths, rows: [hr, ...dr] })
  ];
}

function p(text, opts) { return new Paragraph(Object.assign({ spacing: { after: 100 }, children: [new TextRun(Object.assign({ text, font: "Microsoft YaHei", size: 22 }, (opts || {})))] })); }
function bullet(text, opts) { return new Paragraph(Object.assign({ spacing: { after: 60 }, indent: { left: 720 }, children: [new TextRun(Object.assign({ text: "● " + text, font: "Microsoft YaHei", size: 22 }, (opts || {})))] })); }
function codeBlock(text) { return new Paragraph({ spacing: { after: 80 }, indent: { left: 360 }, children: [new TextRun({ text, font: "Consolas", size: 18, color: "555555" })] }); }

// ── Architecture Diagram (text-based table) ──
function archDiagram() {
  const box = (text, color, width) => new TableCell({
    borders: { top: { style: BorderStyle.SINGLE, size: 2, color: color || "2E75B6" }, bottom: { style: BorderStyle.SINGLE, size: 2, color: color || "2E75B6" }, left: { style: BorderStyle.SINGLE, size: 2, color: color || "2E75B6" }, right: { style: BorderStyle.SINGLE, size: 2, color: color || "2E75B6" } },
    width: { size: width, type: WidthType.DXA }, margins: cm, shading: { fill: "EBF5FB", type: ShadingType.CLEAR },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, font: "Microsoft YaHei", size: 16, bold: true, color: color || "2E75B6" })] })]
  });
  const empty = (w) => new TableCell({ borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, width: { size: w, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "", font: "Microsoft YaHei", size: 8 })] })] });
  const arrow = (w) => new TableCell({ borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, width: { size: w, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "▼", font: "Microsoft YaHei", size: 16, color: "999999" })] })] });

  return [
    new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "图5-1：系统分层架构图", bold: true, font: "Microsoft YaHei", size: 20, color: "2E75B6" })] }),
    new Table({ width: { size: PW, type: WidthType.DXA }, columnWidths: [PW], rows: [
      new TableRow({ children: [box("前端展示层  Vue3 + Element Plus + Axios", "E74C3C", PW)] }),
      new TableRow({ children: [arrow(PW)] }),
      new TableRow({ children: [box("后端接入层  Spring Boot REST API（Controller层）", "2E75B6", PW)] }),
      new TableRow({ children: [arrow(PW)] }),
      new TableRow({ children: [box("业务逻辑层  Service层（报销单CRUD / 提交校验 / 补助计算 / 分摊均摊）", "27AE60", PW)] }),
      new TableRow({ children: [arrow(PW)] }),
      new TableRow({ children: [box("数据访问层  MyBatis-Plus Mapper + BaseMapper<T> + 自定义XML", "8E44AD", PW)] }),
      new TableRow({ children: [arrow(PW)] }),
      new TableRow({ children: [box("数据持久层  MySQL 8.0（vetech_reim 数据库，11张表）", "E67E22", PW)] }),
    ] }),
    new Paragraph({ spacing: { before: 60, after: 200 }, children: [new TextRun({ text: "横向支撑：MybatisPlusConfig（分页拦截器）| GlobalExceptionHandler（统一异常处理）| Result<T>（统一响应格式）", font: "Microsoft YaHei", size: 18, color: "999999", italics: true })] })
  ];
}

// ── Technical Layer Diagram ──
function techLayerDiagram() {
  const layerCell = (lines, color, w, bg) => new TableCell({
    borders: { top: { style: BorderStyle.SINGLE, size: 1, color }, bottom: { style: BorderStyle.SINGLE, size: 1, color }, left: { style: BorderStyle.SINGLE, size: 1, color }, right: { style: BorderStyle.SINGLE, size: 1, color } },
    width: { size: w, type: WidthType.DXA }, margins: { top: 40, bottom: 40, left: 60, right: 60 },
    shading: { fill: bg || "FFFFFF", type: ShadingType.CLEAR },
    children: lines.map((line, i) => new Paragraph({ alignment: i === 0 ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { after: 20 }, children: [new TextRun({ text: line, font: "Microsoft YaHei", size: i === 0 ? 18 : 16, bold: i === 0, color: i === 0 ? color : "333333" })] }))
  });

  const colW = [2340, 2340, 2340, 2340];
  return [
    new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "图5-2：后端技术分层架构图", bold: true, font: "Microsoft YaHei", size: 20, color: "2E75B6" })] }),
    new Table({ width: { size: PW, type: WidthType.DXA }, columnWidths: colW, rows: [
      // Row 1: 接入层
      new TableRow({ children: [
        layerCell(["接入层", "@RestController", "@RequestMapping", "GET/POST/PUT/DELETE"], "2E75B6", colW[0], "EBF5FB"),
        layerCell(["Controller", "ReimMainController", "BaseDataController", "参数校验 @Valid"], "2E75B6", colW[1], "EBF5FB"),
        layerCell(["统一响应", "Result<T>", "{code, msg, data}", "code=200/500"], "2E75B6", colW[2], "EBF5FB"),
        layerCell(["全局异常处理", "GlobalExceptionHandler", "@RestControllerAdvice", "业务异常→错误码"], "2E75B6", colW[3], "EBF5FB"),
      ]}),
      // Row 2: 业务层
      new TableRow({ children: [
        layerCell(["业务服务层", "@Service", "@Transactional", "事务管理"], "27AE60", colW[0], "E8F8F5"),
        layerCell(["报销单服务", "ReimMainServiceImpl", "CRUD + 提交 + 作废", "补助计算 + 分摊均摊"], "27AE60", colW[1], "E8F8F5"),
        layerCell(["校验逻辑", "必填字段校验", "行程唯一性校验", "分摊比例100%校验"], "27AE60", colW[2], "E8F8F5"),
        layerCell(["DTO/VO转换", "ReimDetailVO", "ReimPageDTO", "BeanUtils.copyProperties"], "27AE60", colW[3], "E8F8F5"),
      ]}),
      // Row 3: 数据访问层
      new TableRow({ children: [
        layerCell(["数据访问层", "@Mapper", "BaseMapper<T>", "自定义XML查询"], "8E44AD", colW[0], "F5EEF8"),
        layerCell(["MP分页", "Page<T> + PageInterceptor", "LambdaQueryWrapper", "动态条件拼接"], "8E44AD", colW[1], "F5EEF8"),
        layerCell(["乐观锁", "@Version", "UPDATE WHERE version=?", "冲突检测与处理"], "8E44AD", colW[2], "F5EEF8"),
        layerCell(["自定义SQL", "mapper/*.xml", "多表联查", "动态SQL <where>/<if>"], "8E44AD", colW[3], "F5EEF8"),
      ]}),
      // Row 4: 持久层
      new TableRow({ children: [
        layerCell(["持久层", "MySQL 8.0", "InnoDB 引擎", "utf8mb4 字符集"], "E67E22", colW[0], "FEF5E7"),
        layerCell(["业务主表(5张)", "reim_main / trip", "reim_subsidy / calendar", "reim_cost_allocation"], "E67E22", colW[1], "FEF5E7"),
        layerCell(["基础数据表(6张)", "company / department", "employee / city", "business_type / project"], "E67E22", colW[2], "FEF5E7"),
        layerCell(["配置", "MybatisPlusConfig", "PaginationInnerInterceptor", "DbType.MYSQL"], "E67E22", colW[3], "FEF5E7"),
      ]}),
    ] }),
    new Paragraph({ spacing: { before: 60, after: 80 }, children: [new TextRun({ text: "调用链路：Controller → Service(@Transactional) → Mapper → MySQL，异常自底向上抛至 GlobalExceptionHandler 统一处理", font: "Microsoft YaHei", size: 18, color: "999999", italics: true })] })
  ];
}

// ── Build Document ──
const children = [];

// Title
children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "差旅报销单（Vetech）", bold: true, font: "Microsoft YaHei", size: 44, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "详细设计规范文档（修正版）", bold: true, font: "Microsoft YaHei", size: 36, color: "333333" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "所属项目：胜意科技训练营-差旅报销单    版本：V1.1    撰写人：后端开发组    日期：2025-06-11", font: "Microsoft YaHei", size: 20, color: "666666" })] }),
);

// Revision
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("修订记录")] }),
  ...makeTable("", ["序号", "版本", "日期", "作者", "修改描述"], [
    ["1", "V1.0", "2025-06-11", "后端开发组", "初始版本"],
    ["2", "V1.1", "2025-06-11", "后端开发组", "修正版：补充系统架构图、技术分层图、标注本期不涉及项"],
  ], [1200, 1200, 1800, 1800, 3360]),
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("目录")] }),
  new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-3" }),
);

// ── 开发须知 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("开发须知")] }),
  p("本文档为胜意科技训练营差旅报销单系统的详细设计文档（修正版）。相比V1.0版本，本版补充了系统架构图和技术分层图，并对关键技术点逐项标注了是否在本项目中涉及。"),
  p("项目范围说明：本项目实现差旅报销单的填写、保存、提交、作废功能，不包含审批流程。技术栈采用 Spring Boot 3.2.12 + MyBatis-Plus 3.5.11 + MySQL 8.0，为单体应用架构，不涉及分布式系统。"),
);

// ── 1. 非功能性需求 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. 非功能性需求")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 可靠性")] }),
  bullet("容错性：保存草稿允许部分数据为空；提交时完整校验，失败返回明确错误码"),
  bullet("健壮性：金额使用BigDecimal；乐观锁防并发覆盖；非法输入参数校验"),
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 高性能")] }),
  bullet("查询接口95%情况下响应时间不超过1秒；分页查询使用MyBatis-Plus分页插件"),
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.3 可维护性")] }),
  bullet("严格分层架构：Controller→Service→Mapper；统一Result<T>响应格式"),
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.4 安全性")] }),
  bullet("后端双重校验（不依赖前端）；乐观锁防并发覆盖；状态机严格控制流转方向"),
);

// ── 2. 术语定义 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. 术语定义")] }),
  ...makeTable("", ["缩写/术语", "全称", "说明"], [
    ["报销单", "Reimbursement", "员工因公出差后与企业进行报账结算的单据"],
    ["补助", "Subsidy", "出差期间餐费/交通/通讯补贴"],
    ["补助日历", "Subsidy Calendar", "按日期×补助类型的复选框矩阵"],
    ["费用分摊", "Cost Allocation", "补助费用按比例分摊到不同项目"],
    ["草稿", "Draft (status=0)", "报销单未填写完成，可随时编辑"],
    ["已完成", "Completed (status=1)", "提交后状态，不可编辑（只可作废）"],
    ["已作废", "Voided (status=2)", "已完成的单据被作废"],
    ["乐观锁", "Optimistic Lock", "通过version字段防止并发修改"],
    ["MP", "MyBatis-Plus", "MyBatis增强工具"],
    ["Result<T>", "统一响应体", '{"code": 200, "msg": "操作成功", "data": ...}'],
  ], [1800, 2800, 4760]),
);

// ── 3. 功能性需求 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. 功能性需求描述")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 需求概述")] }),
  p("员工因公出差先垫钱消费，结束后与企业报账结算。本系统实现差旅报销单的填写、保存、提交、作废全流程管理。注意：不含审批流程，审批环节不在本项目范围内。"),
  bullet("需求1：报销单列表页 — 多条件搜索、分页展示"),
  bullet("需求2：报销单详情页 — 基本信息、补录行程、补助日历、费用分摊"),
  bullet("需求3：报销单提交 — 全面校验+事务控制，草稿→已完成"),
  bullet("需求4：报销单作废 — 已完成→已作废"),
  bullet("需求5：基础数据查询 — 6个下拉选项接口"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 业务全景图")] }),
  p("业务流程：列表页 → 新增报销单(草稿) → 填写基本信息 → 补录行程(自动生成补助日历) → 调整补助日历 → 配置费用分摊 → 提交(校验+状态变更) → 完成"),
  p("单据状态流转：草稿(0) → 已完成(1) → 已作废(2)。草稿可直接删除，已完成不可逆转为草稿。"),
);

// ── 4. 功能详细设计 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. 功能详细设计")] }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 报销单列表查询")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.1.1 功能内容")] }),
  bullet("查询条件：报销单号、标题、事由（模糊）；公司、部门、报销人、业务类型（下拉）；状态"),
  bullet("列表展示：单号/状态/报销人(姓名+工号)/部门(名称+编号)/公司/业务类型/标题/事由/补助金额/创建时间"),
  bullet("操作：编辑、删除（草稿）；提交（草稿）；作废（已完成）。超过3个收起至「更多」"),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.1.2 实现逻辑")] }),
  p("Controller接收分页参数 + 查询条件 → Service构建LambdaQueryWrapper动态拼接 → Mapper.selectPage → 返回PageResult"),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.1.3 异常处置")] }),
  bullet("查询参数异常返回默认首页；数据库异常由全局处理器捕获返回500"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 报销单详情")] }),
  bullet("一次性返回主表+行程列表+补助列表+分摊列表（组装为ReimDetailVO）"),
  bullet("不存在返回40001错误码"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 新增/编辑报销单（草稿）")] }),
  bullet("新增：生成报销单号(BX-YYYYMMDD-序号)，status=0，version=0"),
  bullet("编辑：需传入version校验乐观锁，不匹配返回40006"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.4 补录行程管理")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.4.1 功能内容")] }),
  bullet("出行人员、出发/到达城市、出发/到达日期、行程说明"),
  bullet("保存时自动生成补助信息 + 按天补助日历"),
  bullet("唯一性校验：同一报销单内出行人员+日期范围不可重叠"),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.4.2 实现逻辑")] }),
  p("①校验必填+日期合法性 → ②唯一性校验(SQL: WHERE main_id=? AND traveler_id=? AND date overlap) → ③保存行程 → ④查城市等级计算补助标准 → ⑤生成reim_subsidy → ⑥按天遍历生成reim_subsidy_calendar"),
  p("以上6步在同一@Transactional方法内，任一步失败全部回滚。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.5 补助日历管理")] }),
  bullet("按天展示餐补(一100/二80/三50)、交补(40)、通补(40)"),
  bullet("用户勾选+修改申请金额(≤标准，须为正数)"),
  bullet("补助金额=勾选项申请金额之和；标准总额=勾选项标准金额之和"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.6 费用分摊管理")] }),
  bullet("第1行自动计算(100%-其他行总和)，不可编辑"),
  bullet("均摊：1/N，除不尽差值放首行"),
  bullet("至少保留1条分摊"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.7 提交报销单（核心）")] }),
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.7.2 实现逻辑")] }),
  codeBlock("@Transactional(rollbackFor = Exception.class)"),
  codeBlock("public void submit(Long id, Integer version) {"),
  bullet("Step 1: SELECT WHERE id=? AND version=? — 乐观锁"),
  bullet("Step 2: 校验status=0（草稿）"),
  bullet("Step 3: 必填字段非空"),
  bullet("Step 4: 至少1条行程"),
  bullet("Step 5: 行程唯一性复查"),
  bullet("Step 6: 分摊比例=100%（±0.01容差）"),
  bullet("Step 7: 分摊金额=补助总金额"),
  bullet("Step 8: UPDATE status=1, version=version+1"),
  codeBlock("}"),
  bullet("任一步失败→事务回滚→返回对应错误码"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.8 作废报销单")] }),
  bullet("校验status=1且version匹配 → UPDATE status=2"),
);

// ── 5. 技术实现设计 ──  with diagrams!
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. 技术实现设计")] }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 系统结构设计")] }),
  p("系统采用前后端分离的B/S架构：前端Vue3 + Element Plus → 后端Spring Boot REST API → MySQL数据库。以下为系统分层架构图："),
  ...archDiagram(),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 接口及核心类设计")] }),
  p("后端采用严格分层架构，以下为技术分层架构图："),
  ...techLayerDiagram(),

  p("核心类清单：", { bold: true }),
  ...makeTable("", ["类名", "所属层", "说明"], [
    ["Application.java", "启动层", "@SpringBootApplication + @MapperScan"],
    ["MybatisPlusConfig.java", "配置层", "分页拦截器PaginationInnerInterceptor"],
    ["GlobalExceptionHandler.java", "接入层", "@RestControllerAdvice 全局异常处理"],
    ["Result<T>.java", "接入层", "统一响应体 {code, msg, data}"],
    ["ReimMainController.java", "接入层", "/api/reim/* REST控制器"],
    ["ReimMainServiceImpl.java", "业务层", "核心业务：CRUD+提交+作废 @Transactional"],
    ["ReimMainMapper.java", "数据层", "继承BaseMapper<ReimMain>"],
    ["ReimMain.java (Entity)", "持久层", "@TableName(\"reim_main\") + @Version"],
    ["ReimDetailVO.java", "DTO/VO", "聚合VO：main+trips+subsidies+allocations"],
  ], [3200, 1800, 4360]),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.3 与前端的交互")] }),
  p("前端通过Axios调用REST API。控件数据：公司/部门/员工/业务类型/城市/项目均由对应GET接口提供。"),
);

// ── 6. 关键技术点 ── with "本期是否涉及" markings
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. 关键技术点")] }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 事务控制 @Transactional  ✅ 本期涉及")] }),
  p("关键事务场景：提交报销单（更新主表+重新计算合计）、新增行程（行程+补助+日历级联创建+主表合计更新）、删除行程（行程+补助+日历级联删除+主表合计更新）。"),
  p("实现：Service方法添加@Transactional(rollbackFor = Exception.class)，隔离级别READ_COMMITTED。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.2 乐观锁 @Version  ✅ 本期涉及")] }),
  p("reim_main表version字段 + @Version注解。更新SQL：UPDATE ... SET version=version+1 WHERE id=? AND version=?。影响行数=0则抛出40006。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.3 行程唯一性校验  ✅ 本期涉及")] }),
  p("同一报销单内，出行人员+日期范围不能重叠。SQL校验：WHERE main_id=? AND traveler_id=? AND (date range overlap)。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.4 统一错误码  ✅ 本期涉及")] }),
  ...makeTable("", ["错误码", "说明"], [
    ["200", "操作成功"], ["500", "系统异常"], ["40001", "报销单不存在"], ["40002", "状态不允许操作"],
    ["40003", "行程人员+日期重复"], ["40004", "分摊比例之和≠100%"], ["40005", "分摊金额≠补助总金额"],
    ["40006", "乐观锁冲突"], ["40007", "必填字段缺失"], ["40008", "日期校验失败"],
    ["40009", "补助金额超标准"], ["40010", "至少保留一条分摊"],
  ], [2000, 7360]),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.5 分布式事务  ❌ 本期不涉及")] }),
  p("本项目为单体Spring Boot应用，所有操作在同一数据库实例内完成，使用@Transactional本地事务即可保障一致性。分布式事务仅在微服务架构下需要，不在本项目范围内。", { color: "999999" }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.6 Redis缓存  ❌ 本期不涉及")] }),
  p("基础数据表（公司/部门/员工/城市等）数据量极小（<20条），直接查询数据库即可。若后续数据量增大或需提升性能，可引入Redis缓存基础数据，设置合理的过期时间和刷新策略。", { color: "999999" }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.7 MQ消息队列  ❌ 本期不涉及")] }),
  p("本项目无异步消息处理需求，所有业务均为同步请求-响应模式。若后续引入审批流程（需通知审批人），可用MQ发送通知消息。", { color: "999999" }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.8 Job定时任务  ❌ 本期不涉及")] }),
  p("本项目暂不需要定时任务。若后续需自动清理超期草稿（如30天未提交），可使用@Scheduled或XXL-Job实现。", { color: "999999" }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.9 并发编程/分布式锁  ❌ 本期不涉及")] }),
  p("乐观锁已覆盖并发修改场景。本项目为单体应用，无分布式部署需求，无需分布式锁。", { color: "999999" }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.10 敏感信息处理  ✅ 部分涉及")] }),
  p("数据库密码等配置不应硬编码在application.yaml中。员工姓名/工号为业务展示字段，非高度敏感信息。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.11 异动日志  ✅ 涉及（建议）")] }),
  p("提交和作废操作建议记录状态变更日志，便于审计追踪。可在Service层通过日志框架记录。"),
);

// ── 7. 数据库设计 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. 数据库设计")] }),
  p("数据库：vetech_reim  字符集：utf8mb4  引擎：InnoDB  共11张表（5业务 + 6基础数据）"),
  p("完整表结构定义请参见《差旅报销单_表结构定义文档》。"),
  p("表关系：", { bold: true }),
  bullet("reim_main (1) ──< (N) reim_trip (1) ──< (N) reim_subsidy (1) ──< (N) reim_subsidy_calendar"),
  bullet("reim_main (1) ──< (N) reim_cost_allocation"),
  bullet("基础数据表通过 *_id 字段与业务表逻辑关联（非数据库外键约束）"),
  p("数据流向："),
  bullet("读：Controller→Service→Mapper(select)→Entity/DTO→Result→JSON"),
  bullet("写：Controller→Service(@Transactional)→Mapper(insert/update/delete)→MySQL"),
);

// ── 8. WBS ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. WBS任务分解")] }),
  p("详细WBS请参见《差旅报销单_WBS》。以下为摘要：", { bold: true }),
  ...makeTable("", ["阶段", "主要任务", "负责人", "预计工时"], [
    ["需求评审", "理解概要设计，明确功能边界", "全员", "0.5天"],
    ["详细设计", "数据库设计 + API定义 + 详细设计文档", "后端", "1天"],
    ["详细设计", "前端页面设计", "前端", "1天"],
    ["后端开发", "环境搭建 + 基础数据CRUD + 报销单CRUD", "后端", "2天"],
    ["后端开发", "行程管理 + 补助日历 + 费用分摊", "后端", "2天"],
    ["后端开发", "提交流程 + 事务 + 乐观锁 + 作废 + 异常处理", "后端", "1.5天"],
    ["前端开发", "项目初始化 + 列表页 + 详情页", "前端", "3天"],
    ["前端开发", "补助日历 + 分摊 + 提交", "前端", "2.5天"],
    ["联调测试", "前后端联调 + 全流程测试", "全员", "1天"],
    ["文档", "自测报告 + 答辩PPT", "全员", "1天"],
  ], [1200, 4200, 1000, 1200]),
);

// ── 9. 附录 ──
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("附录：API接口定义摘要")] }),
  p("完整API定义请参见《差旅报销单_API接口文档》。共20个接口："),
  ...makeTable("", ["分类", "接口", "方法", "路径"], [
    ["基础数据", "公司列表", "GET", "/api/company/list"],
    ["基础数据", "部门列表", "GET", "/api/department/list"],
    ["基础数据", "员工列表", "GET", "/api/employee/list"],
    ["基础数据", "业务类型树", "GET", "/api/business-type/tree"],
    ["基础数据", "城市列表", "GET", "/api/city/list"],
    ["基础数据", "项目列表", "GET", "/api/project/list"],
    ["报销单", "分页列表", "GET", "/api/reim/page"],
    ["报销单", "详情", "GET", "/api/reim/{id}"],
    ["报销单", "新增草稿", "POST", "/api/reim"],
    ["报销单", "更新草稿", "PUT", "/api/reim/{id}"],
    ["报销单", "提交", "PUT", "/api/reim/{id}/submit"],
    ["报销单", "作废", "PUT", "/api/reim/{id}/void"],
    ["报销单", "删除草稿", "DELETE", "/api/reim/{id}"],
    ["行程", "新增/更新/删除", "POST/PUT/DELETE", "/api/reim/{mainId}/trip[/{tripId}]"],
    ["补助", "查询/更新日历", "GET/PUT", "/api/reim/{mainId}/subsidy/{id}/calendar"],
    ["分摊", "查询/更新/均摊", "GET/PUT", "/api/reim/{mainId}/allocation"],
  ], [1200, 2200, 1400, 4560]),
);

// ── Build ──
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
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "差旅报销单 - 详细设计文档 V1.1(修正版)", font: "Microsoft YaHei", size: 16, color: "999999", italics: true })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 16 }), new TextRun({ text: " 页", font: "Microsoft YaHei", size: 16 })] })] }) },
    children
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("E:\\Java vet\\项目文档\\差旅报销单_详细设计文档_修正版.docx", buf));
console.log("Done: 详细设计文档修正版 V1.1");
