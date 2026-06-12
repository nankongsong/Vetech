const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
        HeadingLevel, PageNumber, PageBreak, TableOfContents } = require('docx');

// Common styles
const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBg = { fill: "2E75B6", type: ShadingType.CLEAR };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: headerBg,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 20, color: "FFFFFF" })] })]
  });
}

function dataCell(text, width, align) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ alignment: align || AlignmentType.CENTER, children: [new TextRun({ text: text || "", font: "Microsoft YaHei", size: 18 })] })]
  });
}

function makeTable(title, columns, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({ children: columns.map((c, i) => headerCell(c, colWidths[i])), tableHeader: true });
  const dataRows = rows.map(row => new TableRow({ children: row.map((cell, i) => dataCell(cell, colWidths[i], i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER)) }));
  return [
    new Paragraph({ spacing: { before: 300, after: 150 }, children: [new TextRun({ text: title, bold: true, font: "Microsoft YaHei", size: 22, color: "2E75B6" })] }),
    new Table({ width: { size: totalWidth, type: WidthType.DXA }, columnWidths: colWidths, rows: [headerRow, ...dataRows] })
  ];
}

// Column widths for table definition
const COLS = [800, 1400, 800, 700, 700, 900, 2060]; // total = 7360
const PAGE_W = 9360; // content width

// ── All 11 table definitions ──
const tables = [];

// 1. reim_main
tables.push(makeTable("1、reim_main（报销单主表）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", "主键，自增"],
    ["reimbursement_no", "varchar", "32", "Y", "", "报销单号", "唯一，格式：BX-YYYYMMDD-XXXX"],
    ["reimbursement_title", "varchar", "200", "Y", "", "报销标题", "不超过500字"],
    ["business_trip_reason", "varchar", "500", "Y", "", "出差事由", "不超过500字"],
    ["reimburser_id", "varchar", "32", "Y", "", "报销人ID", "员工ID"],
    ["reimburser_no", "varchar", "20", "Y", "", "报销人工号", "员工工号"],
    ["reimburser_name", "varchar", "50", "Y", "", "报销人姓名", "员工姓名"],
    ["reim_department_id", "varchar", "32", "Y", "", "报销部门ID", "部门ID"],
    ["reim_department_no", "varchar", "20", "Y", "", "报销部门编号", "部门编号"],
    ["reim_department_name", "varchar", "50", "Y", "", "报销部门名称", "部门名称"],
    ["reim_company_id", "varchar", "32", "Y", "", "费用归属公司ID", "公司ID"],
    ["reim_company_no", "varchar", "20", "Y", "", "费用归属公司编号", "公司编号"],
    ["reim_company_name", "varchar", "50", "Y", "", "费用归属公司名称", "公司名称"],
    ["business_type_id", "varchar", "32", "Y", "", "业务类型ID", "三级树形业务类型"],
    ["business_type_no", "varchar", "20", "Y", "", "业务类型编号", ""],
    ["business_type_name", "varchar", "50", "Y", "", "业务类型名称", ""],
    ["subsidy_total", "decimal", "12,2", "N", "0.00", "补助总金额", "所有补助金额合计"],
    ["meal_allowance", "decimal", "12,2", "N", "0.00", "餐费补助合计", "餐费补助总和"],
    ["transportation_allowance", "decimal", "12,2", "N", "0.00", "交通补助合计", "交通补助总和"],
    ["phone_allowance", "decimal", "12,2", "N", "0.00", "通讯补助合计", "通讯补助总和"],
    ["remarks", "varchar", "1000", "N", "", "备注信息", "最多1000字"],
    ["status", "tinyint", "4", "Y", "0", "单据状态", "0-草稿，1-已完成，2-已作废"],
    ["version", "int", "11", "Y", "0", "乐观锁版本号", "@Version，防并发覆盖"],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
    ["update_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "更新时间", "ON UPDATE CURRENT_TIMESTAMP"],
  ], COLS));

// 2. reim_trip
tables.push(makeTable("2、reim_trip（行程明细表）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", ""],
    ["main_id", "bigint", "20", "Y", "", "报销单主表ID", "外键关联reim_main.id"],
    ["traveler_id", "varchar", "32", "Y", "", "出行人员ID", "员工ID"],
    ["traveler_no", "varchar", "20", "Y", "", "出行人员工号", ""],
    ["traveler_name", "varchar", "50", "Y", "", "出行人员姓名", ""],
    ["origin_city_id", "varchar", "20", "Y", "", "出发城市ID", "城市ID"],
    ["origin_city_name", "varchar", "50", "Y", "", "出发城市名称", ""],
    ["destination_city_id", "varchar", "20", "Y", "", "到达城市ID", ""],
    ["destination_city_name", "varchar", "50", "Y", "", "到达城市名称", ""],
    ["start_date", "date", "", "Y", "", "出发日期", "不可晚于到达日期"],
    ["end_date", "date", "", "Y", "", "到达日期", "不可早于出发日期"],
    ["trip_desc", "varchar", "500", "N", "", "行程说明", "不超过500字"],
    ["sort_order", "int", "11", "N", "0", "排序序号", ""],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
  ], COLS));

// 3. reim_subsidy
tables.push(makeTable("3、reim_subsidy（补助信息表）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", ""],
    ["main_id", "bigint", "20", "Y", "", "报销单主表ID", "外键关联reim_main.id"],
    ["trip_id", "bigint", "20", "Y", "", "行程明细ID", "外键关联reim_trip.id"],
    ["traveler_id", "varchar", "32", "Y", "", "出行人员ID", ""],
    ["traveler_no", "varchar", "20", "Y", "", "出行人员工号", ""],
    ["traveler_name", "varchar", "50", "Y", "", "出行人员姓名", ""],
    ["start_date", "date", "", "Y", "", "开始日期", ""],
    ["end_date", "date", "", "Y", "", "结束日期", ""],
    ["subsidy_days", "int", "11", "Y", "", "补助天数", "结束日期-开始日期+1"],
    ["trip_route", "varchar", "100", "N", "", "行程路线", "出发城市-到达城市"],
    ["subsidy_city_id", "varchar", "20", "Y", "", "补助城市ID", "取到达城市"],
    ["subsidy_city_name", "varchar", "50", "Y", "", "补助城市名称", ""],
    ["apply_amount", "decimal", "12,2", "N", "0.00", "申请金额", "用户填写的申请金额"],
    ["subsidy_amount", "decimal", "12,2", "N", "0.00", "补助金额", "补助日历中补助金额合计"],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
  ], COLS));

// 4. reim_subsidy_calendar
tables.push(makeTable("4、reim_subsidy_calendar（补助日历表）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", ""],
    ["subsidy_id", "bigint", "20", "Y", "", "补助信息ID", "外键关联reim_subsidy.id"],
    ["subsidy_date", "date", "", "Y", "", "补助日期", "行程范围内的每一天"],
    ["day_of_week", "varchar", "10", "N", "", "星期", "如：星期一"],
    ["meal_standard", "decimal", "10,2", "N", "0.00", "餐补标准", "根据城市等级：100/80/50"],
    ["transport_standard", "decimal", "10,2", "N", "40.00", "交补标准", "固定40元/天"],
    ["phone_standard", "decimal", "10,2", "N", "40.00", "通补标准", "固定40元/天"],
    ["is_meal_selected", "tinyint", "1", "N", "0", "餐补是否选中", "0-未选，1-选中"],
    ["is_transport_selected", "tinyint", "1", "N", "0", "交补是否选中", "0-未选，1-选中"],
    ["is_phone_selected", "tinyint", "1", "N", "0", "通补是否选中", "0-未选，1-选中"],
    ["meal_apply_amount", "decimal", "10,2", "N", "0.00", "餐补申请金额", "用户修改后的金额，不可大于标准"],
    ["transport_apply_amount", "decimal", "10,2", "N", "0.00", "交补申请金额", "用户修改后的金额"],
    ["phone_apply_amount", "decimal", "10,2", "N", "0.00", "通补申请金额", "用户修改后的金额"],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
  ], COLS));

// 5. reim_cost_allocation
tables.push(makeTable("5、reim_cost_allocation（费用分摊表）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", ""],
    ["main_id", "bigint", "20", "Y", "", "报销单主表ID", "外键关联reim_main.id"],
    ["company_id", "varchar", "32", "Y", "", "费用归属公司ID", ""],
    ["company_no", "varchar", "20", "N", "", "公司编号", ""],
    ["company_name", "varchar", "50", "N", "", "公司名称", ""],
    ["project_id", "varchar", "32", "Y", "", "项目ID", ""],
    ["project_no", "varchar", "20", "N", "", "项目编号", ""],
    ["project_name", "varchar", "50", "N", "", "项目名称", ""],
    ["allocation_ratio", "decimal", "5,4", "Y", "0.0000", "分摊比例", "存值区间0-1，如1.0000=100%"],
    ["allocation_amount", "decimal", "12,2", "Y", "0.00", "分摊金额", "补助总金额×分摊比例"],
    ["sort_order", "int", "11", "N", "0", "排序序号", "第一条为自动计算行不可编辑"],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
  ], COLS));

// 6. reim_company
tables.push(makeTable("6、reim_company（公司基础数据表）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", ""],
    ["company_id", "varchar", "32", "Y", "", "公司业务ID", "如：1C54557F1782E000"],
    ["company_no", "varchar", "20", "Y", "", "公司编号", "如：0407"],
    ["company_name", "varchar", "50", "Y", "", "公司名称", "如：胜意科技北京分公司"],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
  ], COLS));

// 7. reim_department
tables.push(makeTable("7、reim_department（部门基础数据表）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", ""],
    ["department_id", "varchar", "32", "Y", "", "部门业务ID", "如：13AB8D7B52A9B002"],
    ["department_no", "varchar", "20", "Y", "", "部门编号", "如：072001"],
    ["department_name", "varchar", "50", "Y", "", "部门名称", "如：客户成功事业部"],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
  ], COLS));

// 8. reim_employee
tables.push(makeTable("8、reim_employee（员工基础数据表）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", ""],
    ["employee_id", "varchar", "32", "Y", "", "员工业务ID", "如：13AB3A3F72409002"],
    ["employee_no", "varchar", "20", "Y", "", "员工工号", "如：74541"],
    ["employee_name", "varchar", "50", "Y", "", "员工姓名", "如：徐年年"],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
  ], COLS));

// 9. reim_business_type
tables.push(makeTable("9、reim_business_type（业务类型基础数据表，树形结构）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", ""],
    ["business_type_id", "varchar", "32", "Y", "", "业务类型业务ID", "如：18F0916A8C2C4000"],
    ["business_type_no", "varchar", "20", "Y", "", "业务类型编号", "如：1001001"],
    ["business_type_name", "varchar", "50", "Y", "", "业务类型名称", "如：员工差旅活动"],
    ["superior_id", "varchar", "32", "N", "", "上级业务类型ID", "\"none\"表示最顶级"],
    ["has_subordinate", "tinyint", "1", "N", "0", "是否有下级节点", "0-否，1-是"],
    ["level", "tinyint", "1", "N", "1", "层级", "1/2/3级"],
    ["sort_order", "int", "11", "N", "0", "排序序号", ""],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
  ], COLS));

// 10. reim_city
tables.push(makeTable("10、reim_city（城市基础数据表）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", ""],
    ["city_no", "varchar", "20", "Y", "", "城市编号", "如：10119"],
    ["city_name", "varchar", "50", "Y", "", "城市名称", "如：北京"],
    ["city_type", "tinyint", "1", "Y", "", "城市等级", "1-一线，2-二线，3-三线"],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
  ], COLS));

// 11. reim_project
tables.push(makeTable("11、reim_project（项目基础数据表）",
  ["字段名称", "字段类型", "字段长度", "是否必填", "默认值", "中文名", "说明"],
  [
    ["id", "bigint", "20", "Y", "自增", "主键ID", ""],
    ["project_id", "varchar", "32", "Y", "", "项目业务ID", "如：12BC248B25083001"],
    ["project_no", "varchar", "20", "Y", "", "项目编号", "如：nonProjectRelated"],
    ["project_name", "varchar", "50", "Y", "", "项目名称", "如：非项目类费用归集"],
    ["creation_time", "datetime", "", "Y", "CURRENT_TIMESTAMP", "创建时间", ""],
  ], COLS));

// ── Mock Data Section ──
function mockTable(title, headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const hRow = new TableRow({ children: headers.map((c, i) => headerCell(c, colWidths[i])), tableHeader: true });
  const dRows = rows.map(row => new TableRow({ children: row.map((cell, i) => dataCell(cell, colWidths[i], AlignmentType.LEFT)) }));
  return [
    new Paragraph({ spacing: { before: 200, after: 120 }, children: [new TextRun({ text: title, bold: true, font: "Microsoft YaHei", size: 20, color: "333333" })] }),
    new Table({ width: { size: totalWidth, type: WidthType.DXA }, columnWidths: colWidths, rows: [hRow, ...dRows] })
  ];
}

const mockCols = [1400, 1300, 2400, 2260];

const mockData = [
  mockTable("Mock数据：reim_company（公司表）",
    ["公司业务ID", "公司编号", "公司名称", "说明"],
    [
      ["1C54557F1782E000", "0407", "胜意科技北京分公司", "一线城市"],
      ["19218A262C976000", "0408", "胜意科技上海分公司", "一线城市"],
      ["1C61686865DA8000", "0409", "胜意科技武汉分公司", "二线城市"],
      ["1717271D1DA15000", "0410", "胜意科技杭州分公司", "二线城市"],
      ["16AE93CC7EF92002", "0411", "胜意科技荆州分公司", "三线城市"],
    ], mockCols),
  mockTable("Mock数据：reim_department（部门表）",
    ["部门业务ID", "部门编号", "部门名称", "说明"],
    [
      ["13AB8D7B52A9B002", "072001", "客户成功事业部", ""],
      ["13BFD31C6029A002", "072002", "企业消费事业部", ""],
      ["14515BB4BFB92003", "072003", "企业费控事业部", ""],
      ["19206611C47A6000", "072004", "集采事业部", ""],
      ["19D32F9FE9647000", "072005", "航旅事业部", ""],
      ["13C7E2BAE0393001", "072006", "运营事业部", ""],
      ["14055D22BB808001", "072007", "营销事业部", ""],
    ], mockCols),
  mockTable("Mock数据：reim_employee（员工表）",
    ["员工业务ID", "员工工号", "员工姓名", "说明"],
    [
      ["13AB3A3F72409002", "74541", "徐年年", ""],
      ["13AB498CC6409002", "74008", "郑雨雪", ""],
      ["13AB4A56BB009002", "21552", "邹薇", ""],
      ["13AB591FE8009002", "80681", "王成军", ""],
      ["13AB77281A408001", "89899", "潘展飞", ""],
      ["13AB7925EB808001", "10503", "姜林", ""],
    ], mockCols),
  mockTable("Mock数据：reim_business_type（业务类型表，14条三级树形数据）",
    ["业务类型ID", "业务类型编号", "业务类型名称", "上级ID / 是否有下级"],
    [
      ["18F0916A8C2C4000", "1001001", "员工差旅活动", "上级:none | 有下级:是(1级)"],
      ["18F091913EEC4000", "100100101", "境内出差", "上级:18F0916A8C2C4000 | 有下级:是(2级)"],
      ["1B5FEB7DD4396000", "10010010101", "项目出差", "上级:18F091913EEC4000 | 无下级(3级)"],
      ["1A92E43082EFC000", "10010010102", "市场拓展出差", "上级:18F091913EEC4000 | 无下级(3级)"],
      ["13AB3A4138008001", "100100102", "境外出差", "上级:18F0916A8C2C4000 | 有下级:是(2级)"],
      ["13AB3A4248008002", "10010010201", "国外考察", "上级:13AB3A4138008001 | 无下级(3级)"],
      ["13AB3A4154008001", "10010010202", "售后维护出差", "上级:13AB3A4138008001 | 无下级(3级)"],
      ["13AB3A4172008001", "1001002", "人力资源", "上级:none | 有下级:是(1级)"],
      ["13AB3A418F808001", "100100201", "个人团队培训", "上级:13AB3A4172008001 | 无下级(3级)"],
      ["13AB3A41AC408001", "100100202", "招聘会", "上级:13AB3A4172008001 | 无下级(3级)"],
      ["13AB3A41CD808002", "1001003", "员工福利", "上级:none | 有下级:是(1级)"],
      ["13AB3A41ED408002", "100100301", "员工旅游", "上级:13AB3A41CD808002 | 无下级(3级)"],
      ["13AB3A420CC08002", "100100302", "员工团建", "上级:13AB3A41CD808002 | 无下级(3级)"],
      ["13AB3A422A808001", "100100303", "员工体检", "上级:13AB3A41CD808002 | 无下级(3级)"],
    ], mockCols),
  mockTable("Mock数据：reim_city（城市表，含城市等级）",
    ["城市编号", "城市名称", "城市等级", "补助标准(餐补/交补/通补)"],
    [
      ["10119", "北京", "1-一线城市", "100/40/40 元/天"],
      ["10621", "上海", "1-一线城市", "100/40/40 元/天"],
      ["10458", "武汉", "2-二线城市", "80/40/40 元/天"],
      ["10216", "杭州", "2-二线城市", "80/40/40 元/天"],
      ["10455", "荆州", "3-三线城市", "50/40/40 元/天"],
    ], mockCols),
  mockTable("Mock数据：reim_project（项目表）",
    ["项目业务ID", "项目编号", "项目名称", "说明"],
    [
      ["12BC248B25083001", "nonProjectRelated", "非项目类费用归集", "默认项目"],
      ["1C811ABF96195000", "centralChina", "华中客户定制化项目", ""],
      ["1C5931735AC4A000", "southChina", "华南客户定制化项目", ""],
      ["1771EC45F2443000", "northChina", "华北客户定制化项目", ""],
      ["1762792DB4E9A002", "eastChina", "华东客户定制化项目", ""],
      ["17071065FC29A002", "southWest", "西南客户定制化项目", ""],
      ["162664EBE9ABE001", "northWest", "西北客户定制化项目", ""],
      ["162664B8526BE002", "northEast", "东北客户定制化项目", ""],
    ], mockCols),
];

// ── Build Document ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "差旅报销单 - 表结构定义文档", font: "Microsoft YaHei", size: 16, color: "999999", italics: true })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 16 }), new TextRun({ text: " 页", font: "Microsoft YaHei", size: 16 })]
      })] })
    },
    children: [
      // Title
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "差旅报销单（Vetech）", bold: true, font: "Microsoft YaHei", size: 44, color: "2E75B6" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "数据库表结构定义文档", bold: true, font: "Microsoft YaHei", size: 36, color: "333333" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "版本：V1.0    日期：2025-06-11    作者：后端开发组", font: "Microsoft YaHei", size: 20, color: "666666" })] }),

      // Revision History
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("修订记录")] }),
      new Table({
        width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: [1200, 1200, 1800, 1800, 3360],
        rows: [
          new TableRow({ children: ["序号", "版本", "修改日期", "作者", "修改描述"].map(c => headerCell(c, [1200, 1200, 1800, 1800, 3360][["序号", "版本", "修改日期", "作者", "修改描述"].indexOf(c)])), tableHeader: true }),
          new TableRow({ children: [dataCell("1", 1200), dataCell("V1.0", 1200), dataCell("2025-06-11", 1800), dataCell("后端开发组", 1800), dataCell("初始版本，定义全部11张表结构及Mock数据", 3360, AlignmentType.LEFT)] }),
        ]
      }),

      // Table of Contents
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("目录")] }),
      new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-2" }),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. 概述")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "本文档定义差旅报销单系统的完整数据库表结构。共包含 5 张业务主表 + 6 张基础数据表 = 11 张表。", font: "Microsoft YaHei", size: 22 })] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "数据库：vetech_reim  字符集：utf8mb4  引擎：InnoDB", font: "Microsoft YaHei", size: 22 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "主键策略：bigint 自增  乐观锁字段：version（仅reim_main表）", font: "Microsoft YaHei", size: 22 })] }),

      // E-R Diagram description
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. 表关系说明（E-R）")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "业务表关系：", bold: true, font: "Microsoft YaHei", size: 22 })] }),
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "reim_main (1) ──< (N) reim_trip ──< (N) reim_subsidy ──< (N) reim_subsidy_calendar", font: "Microsoft YaHei", size: 20 })] }),
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "reim_main (1) ──< (N) reim_cost_allocation", font: "Microsoft YaHei", size: 20 })] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "基础数据表独立，通过 *_id 字段与业务表关联（逻辑外键，非数据库外键约束）。", font: "Microsoft YaHei", size: 20 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "删除策略：删除报销单时级联删除关联的行程、补助、补助日历、分摊数据（应用层控制）。", font: "Microsoft YaHei", size: 20 })] }),

      // Business Tables
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. 业务主表定义")] }),
      ...tables.slice(0, 5).flat(),

      // Reference Tables
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. 基础数据表定义")] }),
      ...tables.slice(5).flat(),

      // Mock Data
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Mock数据")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "以下Mock数据来源于概要设计文档5.3节，初始化时插入对应基础数据表。", font: "Microsoft YaHei", size: 22 })] }),
      ...mockData.flat(),

      // Indexes
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. 索引建议")] }),
      ...[
        ["reim_main", "idx_status (status)", "列表按状态筛选"],
        ["reim_main", "idx_reimburser_id (reimburser_id)", "按报销人筛选"],
        ["reim_main", "uk_reimbursement_no (reimbursement_no)", "报销单号唯一索引"],
        ["reim_trip", "idx_main_id (main_id)", "关联查询行程"],
        ["reim_subsidy", "idx_main_id (main_id)", "关联查询补助"],
        ["reim_subsidy", "idx_trip_id (trip_id)", "关联查询行程补助"],
        ["reim_subsidy_calendar", "idx_subsidy_id (subsidy_id)", "关联查询日历"],
        ["reim_cost_allocation", "idx_main_id (main_id)", "关联查询分摊"],
        ["reim_business_type", "idx_superior_id (superior_id)", "树形查询"],
      ].map(([table, index, desc]) =>
        new Paragraph({ spacing: { after: 60 }, children: [
          new TextRun({ text: `${table}: `, bold: true, font: "Microsoft YaHei", size: 20 }),
          new TextRun({ text: `${index}  — ${desc}`, font: "Microsoft YaHei", size: 20 })
        ]})
      ),

    ]
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("E:\\Java vet\\项目文档\\差旅报销单_表结构定义.docx", buf));
console.log("Done: 表结构定义文档 created.");
