const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
        HeadingLevel, PageNumber, PageBreak, TableOfContents } = require('docx');

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBg = { fill: "2E75B6", type: ShadingType.CLEAR };
const cm = { top: 60, bottom: 60, left: 100, right: 100 };
const PAGE_W = 9360;

function hCell(text, width) {
  return new TableCell({ borders, width: { size: width, type: WidthType.DXA }, shading: headerBg, margins: cm,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 18, color: "FFFFFF" })] })] });
}
function dCell(text, width, opts) {
  return new TableCell({ borders, width: { size: width, type: WidthType.DXA }, margins: cm,
    children: [new Paragraph({ alignment: (opts && opts.align) || AlignmentType.LEFT, children: [new TextRun({ text: text || "", font: "Microsoft YaHei", size: 18 })] })] });
}

// ── API Definitions ──
const apis = [];

// Helper to build API sections
function apiSection(category, endpoints) {
  const result = [];
  result.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(category)] }));

  endpoints.forEach((ep, idx) => {
    result.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(`${ep.name}`)] }));
    result.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "功能描述：", bold: true, font: "Microsoft YaHei", size: 20 }), new TextRun({ text: ep.desc, font: "Microsoft YaHei", size: 20 })] }));
    result.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "接口地址：", bold: true, font: "Microsoft YaHei", size: 20 }), new TextRun({ text: ep.url, font: "Consolas", size: 20, color: "C7254E" })] }));
    result.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "请求方法：", bold: true, font: "Microsoft YaHei", size: 20 }), new TextRun({ text: ep.method, font: "Consolas", size: 20, color: "2E75B6", bold: true })] }));
    result.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "应用场景：", bold: true, font: "Microsoft YaHei", size: 20 }), new TextRun({ text: ep.scene, font: "Microsoft YaHei", size: 20 })] }));

    // Request params
    if (ep.reqParams) {
      result.push(new Paragraph({ spacing: { before: 100, after: 80 }, children: [new TextRun({ text: "请求参数：", bold: true, font: "Microsoft YaHei", size: 20 })] }));
      const pw = [1100, 1100, 800, 900, 1000, 4460];
      result.push(new Table({ width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: pw,
        rows: [
          new TableRow({ children: ["字段名", "类型", "必传", "位置", "格式/示例", "说明"].map((c, i) => hCell(c, pw[i])), tableHeader: true }),
          ...ep.reqParams.map(r => new TableRow({ children: [dCell(r[0], pw[0]), dCell(r[1], pw[1]), dCell(r[2], pw[2]), dCell(r[3], pw[3]), dCell(r[4], pw[4]), dCell(r[5], pw[5])] }))
        ] }));
    }

    // Response params
    if (ep.respParams) {
      result.push(new Paragraph({ spacing: { before: 100, after: 80 }, children: [new TextRun({ text: "响应参数（data字段内容）：", bold: true, font: "Microsoft YaHei", size: 20 })] }));
      const pw = [1200, 1100, 800, 1000, 4860];
      result.push(new Table({ width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: pw,
        rows: [
          new TableRow({ children: ["字段名", "类型", "必返", "格式/示例", "说明"].map((c, i) => hCell(c, pw[i])), tableHeader: true }),
          ...ep.respParams.map(r => new TableRow({ children: [dCell(r[0], pw[0]), dCell(r[1], pw[1]), dCell(r[2], pw[2]), dCell(r[3], pw[3]), dCell(r[4], pw[4])] }))
        ] }));
    }

    // Common response wrapper
    result.push(new Paragraph({ spacing: { before: 60, after: 120 }, children: [
      new TextRun({ text: "统一响应格式：", bold: true, font: "Microsoft YaHei", size: 18 }),
      new TextRun({ text: '{"code": 200, "msg": "操作成功", "data": ...}', font: "Consolas", size: 18, color: "666666" }),
      new TextRun({ text: "  （code=200成功，500失败）", font: "Microsoft YaHei", size: 18, color: "666666" })
    ] }));
  });

  return result;
}

// ── All API Endpoints ──

const cat1 = apiSection("1. 基础数据接口", [
  {
    name: "1.1 查询公司列表", desc: "获取费用归属公司下拉选项数据", method: "GET", url: "/api/company/list", scene: "报销单基本信息-费用归属公司下拉选择",
    respParams: [
      ["companyId", "String", "Y", "如：1C54557F1782E000", "公司业务ID"],
      ["companyNo", "String", "Y", "如：0407", "公司编号"],
      ["companyName", "String", "Y", "如：胜意科技北京分公司", "公司名称"],
    ]
  },
  {
    name: "1.2 查询部门列表", desc: "获取报销部门下拉选项数据", method: "GET", url: "/api/department/list", scene: "报销单基本信息-报销部门下拉选择",
    respParams: [
      ["departmentId", "String", "Y", "如：13AB8D7B52A9B002", "部门业务ID"],
      ["departmentNo", "String", "Y", "如：072001", "部门编号"],
      ["departmentName", "String", "Y", "如：客户成功事业部", "部门名称"],
    ]
  },
  {
    name: "1.3 查询员工列表", desc: "获取报销人/出行人下拉选项数据", method: "GET", url: "/api/employee/list", scene: "报销单基本信息-报销人下拉；补录行程-出行人下拉",
    respParams: [
      ["employeeId", "String", "Y", "如：13AB3A3F72409002", "员工业务ID"],
      ["employeeNo", "String", "Y", "如：74541", "员工工号"],
      ["employeeName", "String", "Y", "如：徐年年", "员工姓名"],
    ]
  },
  {
    name: "1.4 查询业务类型树", desc: "获取三级树形业务类型数据", method: "GET", url: "/api/business-type/tree", scene: "报销单基本信息-业务类型树形下拉选择",
    respParams: [
      ["businessTypeId", "String", "Y", "如：18F0916A8C2C4000", "业务类型业务ID"],
      ["businessTypeNo", "String", "Y", "如：1001001", "业务类型编号"],
      ["businessTypeName", "String", "Y", "如：员工差旅活动", "业务类型名称"],
      ["superiorId", "String", "Y", "\"none\"表示根节点", "上级业务类型ID"],
      ["hasSubordinate", "Integer", "Y", "0/1", "是否有下级节点"],
      ["children", "Array", "N", "子节点数组", "下级业务类型列表（树形）"],
    ]
  },
  {
    name: "1.5 查询城市列表", desc: "获取城市下拉选项数据（含城市等级）", method: "GET", url: "/api/city/list", scene: "补录行程-出发/到达城市下拉；补助计算时查询城市等级",
    respParams: [
      ["cityNo", "String", "Y", "如：10119", "城市编号"],
      ["cityName", "String", "Y", "如：北京", "城市名称"],
      ["cityType", "Integer", "Y", "1-一线/2-二线/3-三线", "城市等级（决定餐补标准）"],
    ]
  },
  {
    name: "1.6 查询项目列表", desc: "获取项目下拉选项数据", method: "GET", url: "/api/project/list", scene: "费用分摊-项目下拉选择",
    respParams: [
      ["projectId", "String", "Y", "如：12BC248B25083001", "项目业务ID"],
      ["projectNo", "String", "Y", "如：nonProjectRelated", "项目编号"],
      ["projectName", "String", "Y", "如：非项目类费用归集", "项目名称"],
    ]
  },
]);

const cat2 = apiSection("2. 报销单接口", [
  {
    name: "2.1 分页查询报销单列表", desc: "按条件分页查询报销单列表", method: "GET", url: "/api/reim/page", scene: "报销单列表页面加载和搜索",
    reqParams: [
      ["current", "Integer", "Y", "Query", "默认1", "当前页码"],
      ["size", "Integer", "Y", "Query", "默认10", "每页大小"],
      ["reimbursementNo", "String", "N", "Query", "", "报销单号（模糊搜索）"],
      ["title", "String", "N", "Query", "", "报销标题（模糊搜索）"],
      ["reason", "String", "N", "Query", "", "事由（模糊搜索）"],
      ["companyId", "String", "N", "Query", "", "费用归属公司ID"],
      ["departmentId", "String", "N", "Query", "", "报销部门ID"],
      ["reimburserId", "String", "N", "Query", "", "报销人ID"],
      ["businessTypeId", "String", "N", "Query", "", "业务类型ID"],
      ["status", "Integer", "N", "Query", "", "状态：0草稿/1已完成/2已作废"],
    ],
    respParams: [
      ["total", "Integer", "Y", "总条数", ""],
      ["pages", "Integer", "Y", "总页数", ""],
      ["current", "Integer", "Y", "当前页", ""],
      ["size", "Integer", "Y", "每页大小", ""],
      ["records[]", "Array", "Y", "列表数据", "数组元素结构见下方"],
      ["records[].id", "Long", "Y", "主键ID", ""],
      ["records[].reimbursementNo", "String", "Y", "报销单号", ""],
      ["records[].reimbursementTitle", "String", "Y", "报销标题", ""],
      ["records[].reimburserName", "String", "Y", "报销人姓名", ""],
      ["records[].reimburserNo", "String", "Y", "报销人工号", ""],
      ["records[].reimDepartmentName", "String", "Y", "报销部门名稱", ""],
      ["records[].reimCompanyName", "String", "Y", "费用归属公司名称", ""],
      ["records[].businessTypeName", "String", "Y", "业务类型名称", ""],
      ["records[].businessTripReason", "String", "Y", "出差事由", ""],
      ["records[].subsidyTotal", "BigDecimal", "Y", "补助总金额", ""],
      ["records[].status", "Integer", "Y", "状态", "0草稿/1已完成/2已作废"],
      ["records[].creationTime", "DateTime", "Y", "创建时间", "yyyy-MM-dd HH:mm:ss"],
    ]
  },
  {
    name: "2.2 查询报销单详情", desc: "查询单个报销单完整信息（含行程、补助、分摊）", method: "GET", url: "/api/reim/{id}", scene: "点击报销单号或编辑按钮进入详情页面",
    respParams: [
      ["main", "Object", "Y", "报销单主信息", "reim_main全部字段"],
      ["trips[]", "Array", "Y", "行程明细列表", "reim_trip全部字段"],
      ["subsidies[]", "Array", "Y", "补助信息列表", "reim_subsidy全部字段"],
      ["allocations[]", "Array", "Y", "费用分摊列表", "reim_cost_allocation全部字段"],
    ]
  },
  {
    name: "2.3 新增报销单（保存草稿）", desc: "创建新的报销单，初始状态为草稿(0)", method: "POST", url: "/api/reim", scene: "点击新增按钮，填写基本信息后保存",
    reqParams: [
      ["reimbursementTitle", "String", "N", "Body", "不超过200字", "报销标题"],
      ["businessTripReason", "String", "N", "Body", "不超过500字", "出差事由"],
      ["reimburserId", "String", "N", "Body", "", "报销人ID"],
      ["reimburserNo", "String", "N", "Body", "", "报销人工号"],
      ["reimburserName", "String", "N", "Body", "", "报销人姓名"],
      ["reimDepartmentId", "String", "N", "Body", "", "报销部门ID"],
      ["reimDepartmentNo", "String", "N", "Body", "", "部门编号"],
      ["reimDepartmentName", "String", "N", "Body", "", "部门名称"],
      ["reimCompanyId", "String", "N", "Body", "", "费用归属公司ID"],
      ["reimCompanyNo", "String", "N", "Body", "", "公司编号"],
      ["reimCompanyName", "String", "N", "Body", "", "公司名称"],
      ["businessTypeId", "String", "N", "Body", "", "业务类型ID"],
      ["businessTypeNo", "String", "N", "Body", "", "业务类型编号"],
      ["businessTypeName", "String", "N", "Body", "", "业务类型名称"],
      ["remarks", "String", "N", "Body", "不超过1000字", "备注"],
    ],
    respParams: [["id", "Long", "Y", "新创建的报销单ID", ""]]
  },
  {
    name: "2.4 更新报销单（保存草稿）", desc: "更新报销单基本信息", method: "PUT", url: "/api/reim/{id}", scene: "编辑草稿状态报销单的基本信息",
    reqParams: [
      ["reimbursementTitle", "String", "N", "Body", "", "同新增接口的Body参数"],
      ["...", "", "N", "Body", "", "同新增接口其他字段（不含id/status/version）"],
      ["version", "Integer", "Y", "Body", "", "乐观锁版本号，必须与当前值一致"],
    ],
  },
  {
    name: "2.5 提交报销单", desc: "报销单从草稿状态(0)变更为已完成(1)，含完整数据校验和事务控制", method: "PUT", url: "/api/reim/{id}/submit", scene: "点击提交按钮，进行全面校验后提交",
    reqParams: [
      ["id", "Long", "Y", "Path", "", "报销单ID"],
      ["version", "Integer", "Y", "Body", "", "乐观锁版本号"],
    ],
    respParams: [
      ["success", "Boolean", "Y", "true", "提交成功标识"],
    ]
  },
  {
    name: "2.6 作废报销单", desc: "将已完成的报销单作废（状态1→2）", method: "PUT", url: "/api/reim/{id}/void", scene: "点击作废按钮",
    reqParams: [
      ["id", "Long", "Y", "Path", "", "报销单ID"],
      ["version", "Integer", "Y", "Body", "", "乐观锁版本号"],
    ],
  },
  {
    name: "2.7 删除草稿", desc: "物理删除草稿状态的报销单及关联数据", method: "DELETE", url: "/api/reim/{id}", scene: "删除草稿状态报销单",
  },
]);

const cat3 = apiSection("3. 行程管理接口", [
  {
    name: "3.1 新增行程", desc: "在报销单下新增一条行程记录，并自动生成关联的补助信息和补助日历", method: "POST", url: "/api/reim/{mainId}/trip", scene: "补录行程弹框中点击保存",
    reqParams: [
      ["travelerId", "String", "Y", "Body", "", "出行人员ID"],
      ["travelerNo", "String", "Y", "Body", "", "出行人员工号"],
      ["travelerName", "String", "Y", "Body", "", "出行人员姓名"],
      ["originCityId", "String", "Y", "Body", "", "出发城市ID"],
      ["originCityName", "String", "Y", "Body", "", "出发城市名称"],
      ["destinationCityId", "String", "Y", "Body", "", "到达城市ID"],
      ["destinationCityName", "String", "Y", "Body", "", "到达城市名称"],
      ["startDate", "Date", "Y", "Body", "yyyy-MM-dd", "出发日期"],
      ["endDate", "Date", "Y", "Body", "yyyy-MM-dd", "到达日期（不可早于出发日期）"],
      ["tripDesc", "String", "N", "Body", "不超过500字", "行程说明"],
    ],
    respParams: [
      ["tripId", "Long", "Y", "新增的行程ID", ""],
      ["subsidyId", "Long", "Y", "自动生成的补助信息ID", "行程和补助关联生成"],
    ]
  },
  {
    name: "3.2 更新行程", desc: "更新行程信息，同步更新关联的补助信息和补助日历", method: "PUT", url: "/api/reim/{mainId}/trip/{tripId}", scene: "补录行程列表中点击编辑并保存",
    reqParams: [["...", "", "Y", "Body", "", "同新增行程的Body参数"]],
  },
  {
    name: "3.3 删除行程", desc: "删除行程及关联的补助信息和补助日历", method: "DELETE", url: "/api/reim/{mainId}/trip/{tripId}", scene: "补录行程列表点击删除并确认",
  },
]);

const cat4 = apiSection("4. 补助管理接口", [
  {
    name: "4.1 查询补助日历", desc: "查询某条补助信息的补助日历明细（按天的补助项）", method: "GET", url: "/api/reim/{mainId}/subsidy/{subsidyId}/calendar", scene: "补助信息列表中点击编辑，打开补助日历弹窗",
    respParams: [
      ["subsidyId", "Long", "Y", "补助信息ID", ""],
      ["calendarData[]", "Array", "Y", "补助日历明细列表", "按天排列"],
      ["calendarData[].id", "Long", "Y", "日历记录ID", ""],
      ["calendarData[].subsidyDate", "Date", "Y", "补助日期", "yyyy-MM-dd"],
      ["calendarData[].dayOfWeek", "String", "Y", "星期一~星期日", ""],
      ["calendarData[].mealStandard", "BigDecimal", "Y", "100.00", "餐补标准金额"],
      ["calendarData[].transportStandard", "BigDecimal", "Y", "40.00", "交补标准金额"],
      ["calendarData[].phoneStandard", "BigDecimal", "Y", "40.00", "通补标准金额"],
      ["calendarData[].isMealSelected", "Integer", "Y", "0/1", "餐补是否勾选"],
      ["calendarData[].isTransportSelected", "Integer", "Y", "0/1", "交补是否勾选"],
      ["calendarData[].isPhoneSelected", "Integer", "Y", "0/1", "通补是否勾选"],
      ["calendarData[].mealApplyAmount", "BigDecimal", "Y", "餐补申请金额", "用户修改后的金额（≤标准）"],
      ["calendarData[].transportApplyAmount", "BigDecimal", "Y", "交补申请金额", "用户修改后的金额（≤标准）"],
      ["calendarData[].phoneApplyAmount", "BigDecimal", "Y", "通补申请金额", "用户修改后的金额（≤标准）"],
      ["subsidyAmount", "BigDecimal", "Y", "补助金额", "日历勾选项申请金额合计"],
      ["standardTotal", "BigDecimal", "Y", "标准总额", "日历勾选项标准金额合计"],
    ]
  },
  {
    name: "4.2 更新补助日历", desc: "保存补助日历中的勾选和金额修改", method: "PUT", url: "/api/reim/{mainId}/subsidy/{subsidyId}/calendar", scene: "补助日历弹框中修改后点击确定",
    reqParams: [
      ["calendarData[]", "Array", "Y", "Body", "补助日历修改列表", "每个元素包含id、isMealSelected、isTransportSelected、isPhoneSelected、mealApplyAmount、transportApplyAmount、phoneApplyAmount"],
    ],
    respParams: [
      ["applyAmount", "BigDecimal", "Y", "更新后的申请金额", ""],
      ["subsidyAmount", "BigDecimal", "Y", "更新后的补助金额", ""],
    ]
  },
]);

const cat5 = apiSection("5. 费用分摊接口", [
  {
    name: "5.1 查询分摊信息", desc: "查询报销单的费用分摊列表", method: "GET", url: "/api/reim/{mainId}/allocation", scene: "费用分摊分区加载数据",
    respParams: [
      ["mainId", "Long", "Y", "报销单ID", ""],
      ["allocations[]", "Array", "Y", "分摊列表", ""],
      ["allocations[].id", "Long", "Y", "记录ID", ""],
      ["allocations[].companyId", "String", "Y", "费用归属公司ID", ""],
      ["allocations[].companyName", "String", "Y", "公司名称", ""],
      ["allocations[].projectId", "String", "Y", "项目ID", ""],
      ["allocations[].projectName", "String", "Y", "项目名称", ""],
      ["allocations[].allocationRatio", "BigDecimal", "Y", "0.0000~1.0000", "分摊比例"],
      ["allocations[].allocationAmount", "BigDecimal", "Y", "分摊金额", ""],
      ["allocations[].sortOrder", "Integer", "Y", "排序序号", "首行为自动计算行不可编辑"],
    ]
  },
  {
    name: "5.2 更新分摊信息", desc: "保存分摊列表（含手动修改比例）", method: "PUT", url: "/api/reim/{mainId}/allocation", scene: "费用分摊分区修改后保存",
    reqParams: [
      ["allocations[]", "Array", "Y", "Body", "分摊列表", "每个元素含id、companyId、projectId、allocationRatio、sortOrder"],
    ],
  },
  {
    name: "5.3 均摊计算", desc: "按分摊条数自动计算均摊比例和金额", method: "PUT", url: "/api/reim/{mainId}/allocation/equal-split", scene: "点击均摊按钮",
    reqParams: [
      ["allocations[]", "Array", "Y", "Body", "当前分摊列表", "每个元素含companyId、projectId（id可为空）"],
    ],
    respParams: [
      ["allocations[]", "Array", "Y", "均摊后的分摊列表", "比例自动计算，除不尽差值放首行"],
    ]
  },
]);

// ── Build document ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
        paragraph: { spacing: { before: 300, after: 180 }, outlineLevel: 1 } },
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
        children: [new TextRun({ text: "差旅报销单 - API接口文档", font: "Microsoft YaHei", size: 16, color: "999999", italics: true })] })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 16 }), new TextRun({ text: " 页", font: "Microsoft YaHei", size: 16 })] })] })
    },
    children: [
      // Title Page
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "差旅报销单（Vetech）", bold: true, font: "Microsoft YaHei", size: 44, color: "2E75B6" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "API接口文档", bold: true, font: "Microsoft YaHei", size: 36, color: "333333" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "版本：V1.0    日期：2025-06-11    作者：后端开发组", font: "Microsoft YaHei", size: 20, color: "666666" })] }),

      // Revision
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("修订记录")] }),
      new Table({ width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: [1200, 1200, 1800, 1800, 3360],
        rows: [
          new TableRow({ children: ["序号", "版本", "日期", "作者", "修改描述"].map(c => hCell(c, [1200, 1200, 1800, 1800, 3360][["序号", "版本", "日期", "作者", "修改描述"].indexOf(c)])), tableHeader: true }),
          new TableRow({ children: [dCell("1", 1200), dCell("V1.0", 1200), dCell("2025-06-11", 1800), dCell("后端开发组", 1800), dCell("初始版本，定义所有业务接口", 3360)] }),
        ] }),

      // TOC
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("目录")] }),
      new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-3" }),

      // Overview
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. 概述")] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "本文档定义差旅报销单系统所有REST API接口，供前端开发人员参考。", font: "Microsoft YaHei", size: 22 })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "接口总数：20个（基础数据6个 + 报销单7个 + 行程3个 + 补助2个 + 分摊3个）", font: "Microsoft YaHei", size: 22 })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Base URL：http://localhost:8080", font: "Consolas", size: 22, color: "C7254E" })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Content-Type：application/json（所有POST/PUT接口）", font: "Microsoft YaHei", size: 22 })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "统一响应格式：", bold: true, font: "Microsoft YaHei", size: 22 })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '  {"code": 200, "msg": "操作成功", "data": { ... }}', font: "Consolas", size: 20 })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '  {"code": 500, "msg": "错误描述信息", "data": null}', font: "Consolas", size: 20 })] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "特殊说明：提交和作废接口需要传version字段进行乐观锁校验，防止并发修改冲突。", font: "Microsoft YaHei", size: 22, color: "C7254E" })] }),

      // API categories
      ...cat1, ...cat2, ...cat3, ...cat4, ...cat5,

      // Error codes
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. 常见错误码")] }),
      ...[
        ["40001", "报销单不存在", "请求的报销单ID在数据库中不存在"],
        ["40002", "报销单状态不允许此操作", "如：已完成状态无法编辑基本信息"],
        ["40003", "行程人员+日期重复", "同一报销单内出行人员和时间范围重叠"],
        ["40004", "分摊比例之和不为100%", "提交时所有分摊比例之和必须=100%"],
        ["40005", "分摊金额不等于补助总金额", "提交时分摊金额合计必须=补助总金额"],
        ["40006", "乐观锁冲突，请刷新后重试", "version不匹配，数据已被他人修改"],
        ["40007", "必填字段未填写完整", "提交时校验所有必填字段"],
        ["40008", "到达日期不可早于出发日期", "补录行程时间校验"],
        ["40009", "补助申请金额不可大于标准金额", "补助日历金额校验"],
        ["40010", "至少保留一条分摊信息", "删除分摊时的最小数量校验"],
      ].map(([code, name, desc]) =>
        new Paragraph({ spacing: { after: 60 }, children: [
          new TextRun({ text: `${code}: `, bold: true, font: "Consolas", size: 20, color: "C7254E" }),
          new TextRun({ text: `${name} — ${desc}`, font: "Microsoft YaHei", size: 20 }),
        ]})
      ),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("E:\\Java vet\\项目文档\\差旅报销单_API接口文档.docx", buf));
console.log("Done: API接口文档 created.");
