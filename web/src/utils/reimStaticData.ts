/**
 * 差旅报销单 —— 全量静态数据源
 * 来源于《差旅报销单概要设计.docx》5.3 节
 * 可用作前端本地开发 / API 不可用时的 fallback 数据
 */

// ==================== 5.3.1 费用归属公司 ====================
export const STATIC_COMPANY_DATA = [
  { companyId: '1C54557F1782E000', companyNo: '0407', companyName: '胜意科技北京分公司' },
  { companyId: '19218A262C976000', companyNo: '0408', companyName: '胜意科技上海分公司' },
  { companyId: '1C61686865DA8000', companyNo: '0409', companyName: '胜意科技武汉分公司' },
  { companyId: '1717271D1DA15000', companyNo: '0410', companyName: '胜意科技杭州分公司' },
  { companyId: '16AE93CC7EF92002', companyNo: '0411', companyName: '胜意科技荆州分公司' },
]

// ==================== 5.3.2 报销部门 ====================
export const STATIC_DEPARTMENT_DATA = [
  { departmentId: '13AB8D7B52A9B002', departmentNo: '072001', departmentName: '客户成功事业部' },
  { departmentId: '13BFD31C6029A002', departmentNo: '072002', departmentName: '企业消费事业部' },
  { departmentId: '14515BB4BFB92003', departmentNo: '072003', departmentName: '企业费控事业部' },
  { departmentId: '19206611C47A6000', departmentNo: '072004', departmentName: '集采事业部' },
  { departmentId: '19D32F9FE9647000', departmentNo: '072005', departmentName: '航旅事业部' },
  { departmentId: '13C7E2BAE0393001', departmentNo: '072006', departmentName: '运营事业部' },
  { departmentId: '14055D22BB808001', departmentNo: '072007', departmentName: '营销事业部' },
]

// ==================== 5.3.3 员工数据（报销人 / 出行人） ====================
export const STATIC_EMPLOYEE_DATA = [
  { employeeId: '13AB3A3F72409002', employeeNo: '74541', employeeName: '徐年年' },
  { employeeId: '13AB498CC6409002', employeeNo: '74008', employeeName: '郑雨雪' },
  { employeeId: '13AB4A56BB009002', employeeNo: '21552', employeeName: '邹薇' },
  { employeeId: '13AB591FE8009002', employeeNo: '80681', employeeName: '王成军' },
  { employeeId: '13AB77281A408001', employeeNo: '89899', employeeName: '潘展飞' },
  { employeeId: '13AB7925EB808001', employeeNo: '10503', employeeName: '姜林' },
]

// ==================== 5.3.4 业务类型（扁平数组 → 需调用 buildBusinessTypeTree 转树形） ====================
export const STATIC_BUSINESS_TYPE_FLAT = [
  { businessTypeId: '18F0916A8C2C4000', businessTypeNo: '1001001', businessTypeName: '员工差旅活动', thereSubordinateNode: '1', superiorId: 'none' },
  { businessTypeId: '18F091913EEC4000', businessTypeNo: '100100101', businessTypeName: '境内出差', thereSubordinateNode: '1', superiorId: '18F0916A8C2C4000' },
  { businessTypeId: '1B5FEB7DD4396000', businessTypeNo: '10010010101', businessTypeName: '项目出差', thereSubordinateNode: '0', superiorId: '18F091913EEC4000' },
  { businessTypeId: '1A92E43082EFC000', businessTypeNo: '10010010102', businessTypeName: '市场拓展出差', thereSubordinateNode: '0', superiorId: '18F091913EEC4000' },
  { businessTypeId: '13AB3A4138008001', businessTypeNo: '100100102', businessTypeName: '境外出差', thereSubordinateNode: '1', superiorId: '18F0916A8C2C4000' },
  { businessTypeId: '13AB3A4248008002', businessTypeNo: '10010010201', businessTypeName: '国外考察', thereSubordinateNode: '0', superiorId: '13AB3A4138008001' },
  { businessTypeId: '13AB3A4154008001', businessTypeNo: '10010010202', businessTypeName: '售后维护出差', thereSubordinateNode: '0', superiorId: '13AB3A4138008001' },
  { businessTypeId: '13AB3A4172008001', businessTypeNo: '1001002', businessTypeName: '人力资源', thereSubordinateNode: '1', superiorId: 'none' },
  { businessTypeId: '13AB3A418F808001', businessTypeNo: '100100201', businessTypeName: '个人团队培训', thereSubordinateNode: '0', superiorId: '13AB3A4172008001' },
  { businessTypeId: '13AB3A41AC408001', businessTypeNo: '100100202', businessTypeName: '招聘会', thereSubordinateNode: '0', superiorId: '13AB3A4172008001' },
  { businessTypeId: '13AB3A41CD808002', businessTypeNo: '1001003', businessTypeName: '员工福利', thereSubordinateNode: '1', superiorId: 'none' },
  { businessTypeId: '13AB3A41ED408002', businessTypeNo: '100100301', businessTypeName: '员工旅游', thereSubordinateNode: '0', superiorId: '13AB3A41CD808002' },
  { businessTypeId: '13AB3A420CC08002', businessTypeNo: '100100302', businessTypeName: '员工团建', thereSubordinateNode: '0', superiorId: '13AB3A41CD808002' },
  { businessTypeId: '13AB3A422A808001', businessTypeNo: '100100303', businessTypeName: '员工体检', thereSubordinateNode: '0', superiorId: '13AB3A41CD808002' },
]

// ==================== 5.3.5 城市数据 ====================
export const STATIC_CITY_DATA = [
  { cityNo: '10119', cityName: '北京', cityType: 1 as const },
  { cityNo: '10621', cityName: '上海', cityType: 1 as const },
  { cityNo: '10458', cityName: '武汉', cityType: 2 as const },
  { cityNo: '10216', cityName: '杭州', cityType: 1 as const },
  { cityNo: '10455', cityName: '荆州', cityType: 3 as const },
]

// ==================== 5.3.6 项目数据 ====================
export const STATIC_PROJECT_DATA = [
  { projectId: '12BC248B25083001', projectNo: 'nonProjectRelated', projectName: '非项目类费用归集' },
  { projectId: '1C811ABF96195000', projectNo: 'centralChina', projectName: '华中客户定制化项目' },
  { projectId: '1C5931735AC4A000', projectNo: 'southChina', projectName: '华南客户定制化项目' },
  { projectId: '1771EC45F2443000', projectNo: 'northChina', projectName: '华北客户定制化项目' },
  { projectId: '1762792DB4E9A002', projectNo: 'eastChina', projectName: '华东客户定制化项目' },
  { projectId: '17071065FC29A002', projectNo: 'southWest', projectName: '西南客户定制化项目' },
  { projectId: '162664EBE9ABE001', projectNo: 'northWest', projectName: '西北客户定制化项目' },
  { projectId: '162664B8526BE002', projectNo: 'northEast', projectName: '东北客户定制化项目' },
]
