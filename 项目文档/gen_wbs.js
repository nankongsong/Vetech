const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
        HeadingLevel, PageNumber, PageBreak } = require('docx');

const bdr = { top: { style: BorderStyle.SINGLE, size: 1, color: "999999" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" }, left: { style: BorderStyle.SINGLE, size: 1, color: "999999" }, right: { style: BorderStyle.SINGLE, size: 1, color: "999999" } };
const hBg = { fill: "2E75B6", type: ShadingType.CLEAR };
const cm = { top: 50, bottom: 50, left: 80, right: 80 };
const PW = 9360;

function hc(t, w) { return new TableCell({ borders: bdr, width: { size: w, type: WidthType.DXA }, shading: hBg, margins: cm, verticalAlign: "center", children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, font: "Microsoft YaHei", size: 16, color: "FFFFFF" })] })] }); }
function dc(t, w, a) { return new TableCell({ borders: bdr, width: { size: w, type: WidthType.DXA }, margins: cm, children: [new Paragraph({ alignment: a || AlignmentType.LEFT, children: [new TextRun({ text: t || "", font: "Microsoft YaHei", size: 16 })] })] }); }

// WBS data
const COL = [500, 1000, 1000, 1800, 1500, 900, 700, 900, 900, 500, 700, 0]; // last computed
const COLS = [500, 1000, 900, 1800, 1300, 800, 700, 800, 700, 500, 560]; // now 11 cols
// Actually let me simplify: 序号, 阶段, 板块, 任务名称, 任务说明, 责任人, 协助人, 开始时间, 结束时间, 进度, 产出要求

const COLS2 = [400, 1000, 900, 2000, 1600, 700, 700, 900, 900, 560]; // 10 cols total = 9660

// Phases and tasks
const phases = [
  {
    phase: "需求评审",
    tasks: [
      ["阅读概要设计文档", "理解业务背景、功能模块、Mock数据和校验规则", "全员", "", "6/11", "6/11", "100%", "理解确认"],
      ["明确功能边界", "确认不做审批部分，聚焦报销单核心流程", "全员", "", "6/11", "6/11", "100%", "范围确认"],
      ["技术选型确认", "Spring Boot 3.2.12 + MP 3.5.11 + MySQL 8.0 + Vue3", "全员", "", "6/11", "6/11", "100%", "技术栈确认"],
    ]
  },
  {
    phase: "详细设计",
    tasks: [
      ["数据库表结构设计", "设计11张表（5业务+6基础数据），含索引和Mock数据", "后端", "", "6/11", "6/11", "100%", "表结构定义文档"],
      ["API接口定义", "定义20个REST接口（入参/出参/错误码）", "后端", "", "6/11", "6/11", "100%", "API接口文档"],
      ["详细设计文档编写", "含架构图、非功能需求、功能设计、关键技术点、WBS", "后端", "", "6/11", "6/12", "90%", "详细设计规范文档"],
      ["前端页面设计", "报销单列表页+详情页UI设计（参考概要设计原型图）", "前端", "", "6/11", "6/12", "0%", "UI设计稿"],
      ["WBS任务分解", "全项目任务分解和排期", "后端", "", "6/11", "6/12", "80%", "WBS文档"],
    ]
  },
  {
    phase: "后端开发",
    tasks: [
      ["项目环境搭建", "pom.xml降级3.2.12 + 添加MP依赖 + application.yaml配置 + 包结构", "后端", "", "6/12", "6/12", "0%", "可运行空项目"],
      ["基础数据CRUD", "6张基础数据表Entity/Mapper + 6个查询接口 + init.sql(Mock数据)", "后端", "", "6/12", "6/12", "0%", "6个GET接口可用"],
      ["报销单CRUD", "reim_main的Entity/Mapper/Service/Controller + 列表分页/详情/新增/编辑", "后端", "", "6/12", "6/13", "0%", "报销单增删改查"],
      ["行程管理", "reim_trip 新增/编辑/删除 + 级联创建补助信息+补助日历（事务）", "后端", "", "6/13", "6/13", "0%", "行程+补助级联"],
      ["补助日历管理", "reim_subsidy_calendar 查询/更新 + 补助金额计算 + 城市等级映射", "后端", "", "6/13", "6/14", "0%", "日历勾选+金额"],
      ["费用分摊管理", "reim_cost_allocation CRUD + 比例联动 + 均摊算法", "后端", "", "6/14", "6/14", "0%", "分摊均摊逻辑"],
      ["提交报销单（核心）", "@Transactional提交 + 全面校验 + @Version乐观锁 + 状态变更", "后端", "", "6/14", "6/15", "0%", "核心提交流程"],
      ["作废/删除/异常处理", "作废接口 + 删除草稿 + GlobalExceptionHandler + 统一错误码", "后端", "", "6/15", "6/15", "0%", "辅助功能+异常"],
    ]
  },
  {
    phase: "前端开发",
    tasks: [
      ["项目初始化", "Vue3 + Vite + Element Plus + Axios + Router + Pinia 脚手架搭建", "前端", "", "6/12", "6/12", "0%", "可运行前端项目"],
      ["基础组件封装", "统一布局、请求拦截器、Result处理、下拉选项组件", "前端", "", "6/12", "6/13", "0%", "公共组件"],
      ["报销单列表页", "搜索表单 + 分页表格 + 操作按钮（参考概要设计5.1节原型）", "前端", "", "6/13", "6/14", "0%", "列表页可用"],
      ["报销单详情页-基本信息", "单据头部 + 基本信息分区 + 下拉选项联动", "前端", "", "6/14", "6/14", "0%", "基本信息区"],
      ["补录行程弹框+列表", "行程弹框（表单+日期校验） + 行程列表（编辑/删除/复制）", "前端", "", "6/14", "6/15", "0%", "行程管理"],
      ["补助信息+补助日历", "补助信息列表 + 补助日历弹窗（勾选矩阵+金额修改+行列联动）", "前端", "", "6/15", "6/16", "0%", "补助日历交互"],
      ["费用分摊+备注+底部", "分摊列表（比例联动+均摊按钮） + 备注 + 关闭/提交按钮", "前端", "", "6/16", "6/16", "0%", "分摊+提交"],
      ["前端校验+联调准备", "必填校验 + 分摊比例100%校验 + 日期校验 + 提交确认弹框", "前端", "", "6/16", "6/17", "0%", "校验完成"],
    ]
  },
  {
    phase: "联调测试",
    tasks: [
      ["前后端联调", "全流程：创建草稿→填信息→补行程→改补助→分配分摊→提交→作废", "全员", "", "6/17", "6/17", "0%", "全流程通过"],
      ["异常场景测试", "乐观锁冲突/行程重复/分摊比例≠100%/必填缺失/日期异常", "全员", "", "6/17", "6/18", "0%", "异常场景覆盖"],
      ["Bug修复", "联调和测试中发现的Bug修复", "全员", "", "6/18", "6/18", "0%", "Bug清零"],
      ["自测报告编写", "按自测报告模板编写测试用例和截图", "全员", "", "6/18", "6/18", "0%", "自测报告文档"],
    ]
  },
  {
    phase: "答辩准备",
    tasks: [
      ["答辩PPT制作", "项目背景+功能演示+技术亮点+分工说明+Q&A准备", "全员", "", "6/18", "6/19", "0%", "答辩PPT"],
      ["答辩演练", "每人4-6分钟讲解自己模块，组长演示全流程", "全员", "", "6/19", "6/19", "0%", "演练通过"],
    ]
  },
];

const children = [];

// Title
children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "差旅报销单（Vetech）", bold: true, font: "Microsoft YaHei", size: 44, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "项目开发WBS", bold: true, font: "Microsoft YaHei", size: 36, color: "333333" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "团队3人：后端1人 + 前端2人    项目周期：2025/6/11 - 6/19    版本：V1.0", font: "Microsoft YaHei", size: 20, color: "666666" })] }),
);

// Summary table
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("项目概览")] }),
  ...((title, headers, rows, cw) => {
    const tw = cw.reduce((a, b) => a + b, 0);
    return [
      new Paragraph({ spacing: { before: 100, after: 80 }, children: [new TextRun({ text: title, bold: true, font: "Microsoft YaHei", size: 20, color: "2E75B6" })] }),
      new Table({ width: { size: tw, type: WidthType.DXA }, columnWidths: cw, rows: [
        new TableRow({ children: headers.map((c, i) => hc(c, cw[i])), tableHeader: true }),
        ...rows.map(r => new TableRow({ children: r.map((c, i) => dc(c, cw[i])) }))
      ]})
    ];
  })("", ["项目信息", "内容"], [["项目名称", "差旅报销单（Vetech）"], ["团队人数", "3人（后端1人 + 前端2人）"], ["项目周期", "2025/6/11 - 6/19（9天）"], ["技术栈", "Spring Boot 3.2.12 + MP 3.5.11 + Vue3 + Element Plus + MySQL 8.0"], ["功能范围", "报销单列表/详情/提交/作废，不含审批流程"]], [2000, 7360]),
);

// WBS by phase
let seq = 0;
phases.forEach(phaseData => {
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(phaseData.phase)] }));
  const CW = [400, 900, 2200, 1800, 700, 700, 700, 700, 560, 700];
  const dataRows = phaseData.tasks.map(t => {
    seq++;
    return new TableRow({ children: [
      dc(String(seq), CW[0], AlignmentType.CENTER),
      dc(phaseData.phase, CW[1]),
      dc(t[0], CW[2]),
      dc(t[1], CW[3]),
      dc(t[2], CW[4], AlignmentType.CENTER),
      dc(t[3], CW[5], AlignmentType.CENTER),
      dc(t[4], CW[6], AlignmentType.CENTER),
      dc(t[5], CW[7], AlignmentType.CENTER),
      dc(t[6], CW[8], AlignmentType.CENTER),
      dc(t[7], CW[9]),
    ]});
  });

  children.push(new Table({
    width: { size: CW.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: CW,
    rows: [
      new TableRow({ children: ["序号", "阶段", "任务名称", "任务说明", "责任人", "协助人", "开始", "结束", "进度", "产出要求"].map((c, i) => hc(c, CW[i])), tableHeader: true }),
      ...dataRows,
    ]
  }));
});

// ── Build ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
        paragraph: { spacing: { before: 300, after: 180 }, outlineLevel: 0 } },
    ]
  },
  sections: [{
    properties: { page: { size: { width: 15840, height: 12240 }, margin: { top: 1000, right: 800, bottom: 1000, left: 800 } } }, // landscape
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "差旅报销单 - WBS V1.0", font: "Microsoft YaHei", size: 14, color: "999999", italics: true })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 14 }), new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 14 }), new TextRun({ text: " 页", font: "Microsoft YaHei", size: 14 })] })] }) },
    children
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("E:\\Java vet\\项目文档\\差旅报销单_WBS.docx", buf));
console.log("Done: WBS document created.");
