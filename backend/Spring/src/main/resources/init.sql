-- ============================================================
-- 差旅报销单（Vetech）数据库初始化脚本
-- 数据库：vetech_reim
-- 字符集：utf8mb4  引擎：InnoDB
-- ============================================================

SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS vetech_reim DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vetech_reim;

-- ============================================================
-- 一、基础数据表（6张）
-- ============================================================

-- 1. 公司表
DROP TABLE IF EXISTS reim_company;
CREATE TABLE reim_company (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    company_id VARCHAR(32) NOT NULL COMMENT '公司业务ID',
    company_no VARCHAR(20) NOT NULL COMMENT '公司编号',
    company_name VARCHAR(100) NOT NULL COMMENT '公司名称',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司基础数据表';

-- 2. 部门表
DROP TABLE IF EXISTS reim_department;
CREATE TABLE reim_department (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    department_id VARCHAR(32) NOT NULL COMMENT '部门业务ID',
    department_no VARCHAR(20) NOT NULL COMMENT '部门编号',
    department_name VARCHAR(50) NOT NULL COMMENT '部门名称',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门基础数据表';

-- 3. 员工表
DROP TABLE IF EXISTS reim_employee;
CREATE TABLE reim_employee (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    employee_id VARCHAR(32) NOT NULL COMMENT '员工业务ID',
    employee_no VARCHAR(20) NOT NULL COMMENT '员工工号',
    employee_name VARCHAR(50) NOT NULL COMMENT '员工姓名',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工基础数据表';

-- 4. 业务类型表（三级树形结构）
DROP TABLE IF EXISTS reim_business_type;
CREATE TABLE reim_business_type (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    business_type_id VARCHAR(32) NOT NULL COMMENT '业务类型业务ID',
    business_type_no VARCHAR(20) NOT NULL COMMENT '业务类型编号',
    business_type_name VARCHAR(50) NOT NULL COMMENT '业务类型名称',
    superior_id VARCHAR(32) DEFAULT NULL COMMENT '上级业务类型ID，"none"表示最顶级',
    has_subordinate TINYINT(1) DEFAULT 0 COMMENT '是否有下级节点：0-否，1-是',
    level TINYINT(1) DEFAULT 1 COMMENT '层级：1/2/3',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_superior_id (superior_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务类型基础数据表（树形结构）';

-- 5. 城市表
DROP TABLE IF EXISTS reim_city;
CREATE TABLE reim_city (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    city_no VARCHAR(20) NOT NULL COMMENT '城市编号',
    city_name VARCHAR(50) NOT NULL COMMENT '城市名称',
    city_type TINYINT(1) NOT NULL COMMENT '城市等级：1-一线，2-二线，3-三线',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='城市基础数据表';

-- 6. 项目表
DROP TABLE IF EXISTS reim_project;
CREATE TABLE reim_project (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    project_id VARCHAR(32) NOT NULL COMMENT '项目业务ID',
    project_no VARCHAR(20) NOT NULL COMMENT '项目编号',
    project_name VARCHAR(50) NOT NULL COMMENT '项目名称',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目基础数据表';

-- ============================================================
-- 二、业务主表（6张）
-- ============================================================

-- 7. 报销单主表
DROP TABLE IF EXISTS reim_main;
CREATE TABLE reim_main (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    reimbursement_no VARCHAR(32) NOT NULL COMMENT '报销单号，格式：BXyyyyMMddXXXX',
    reimbursement_title VARCHAR(200) DEFAULT NULL COMMENT '报销标题',
    business_trip_reason VARCHAR(500) DEFAULT NULL COMMENT '出差事由',
    reimburser_id VARCHAR(32) DEFAULT NULL COMMENT '报销人ID',
    reimburser_no VARCHAR(20) DEFAULT NULL COMMENT '报销人工号',
    reimburser_name VARCHAR(50) DEFAULT NULL COMMENT '报销人姓名',
    reim_department_id VARCHAR(32) DEFAULT NULL COMMENT '报销部门ID',
    reim_department_no VARCHAR(20) DEFAULT NULL COMMENT '报销部门编号',
    reim_department_name VARCHAR(50) DEFAULT NULL COMMENT '报销部门名称',
    reim_company_id VARCHAR(32) DEFAULT NULL COMMENT '费用归属公司ID',
    reim_company_no VARCHAR(20) DEFAULT NULL COMMENT '费用归属公司编号',
    reim_company_name VARCHAR(50) DEFAULT NULL COMMENT '费用归属公司名称',
    business_type_id VARCHAR(32) DEFAULT NULL COMMENT '业务类型ID',
    business_type_no VARCHAR(20) DEFAULT NULL COMMENT '业务类型编号',
    business_type_name VARCHAR(50) DEFAULT NULL COMMENT '业务类型名称',
    subsidy_total DECIMAL(12,2) DEFAULT 0.00 COMMENT '补助总金额',
    meal_allowance DECIMAL(12,2) DEFAULT 0.00 COMMENT '餐费补助合计',
    transportation_allowance DECIMAL(12,2) DEFAULT 0.00 COMMENT '交通补助合计',
    phone_allowance DECIMAL(12,2) DEFAULT 0.00 COMMENT '通讯补助合计',
    remarks VARCHAR(1000) DEFAULT NULL COMMENT '备注信息',
    status TINYINT(1) NOT NULL DEFAULT 0 COMMENT '单据状态：0-草稿，1-已完成，2-已作废',
    version INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_reimbursement_no (reimbursement_no),
    KEY idx_reimburser_id (reimburser_id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报销单主表';

-- 8. 行程明细表
DROP TABLE IF EXISTS reim_trip;
CREATE TABLE reim_trip (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    main_id BIGINT NOT NULL COMMENT '报销单主表ID',
    traveler_id VARCHAR(32) NOT NULL COMMENT '出行人员ID',
    traveler_no VARCHAR(20) NOT NULL COMMENT '出行人员工号',
    traveler_name VARCHAR(50) NOT NULL COMMENT '出行人员姓名',
    origin_city_id VARCHAR(20) NOT NULL COMMENT '出发城市ID',
    origin_city_name VARCHAR(50) NOT NULL COMMENT '出发城市名称',
    destination_city_id VARCHAR(20) NOT NULL COMMENT '到达城市ID',
    destination_city_name VARCHAR(50) NOT NULL COMMENT '到达城市名称',
    start_date DATE NOT NULL COMMENT '出发日期',
    end_date DATE NOT NULL COMMENT '到达日期',
    trip_desc VARCHAR(500) DEFAULT NULL COMMENT '行程说明',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_main_id (main_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行程明细表';

-- 9. 补助信息表
DROP TABLE IF EXISTS reim_subsidy;
CREATE TABLE reim_subsidy (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    main_id BIGINT NOT NULL COMMENT '报销单主表ID',
    trip_id BIGINT NOT NULL COMMENT '行程明细ID',
    traveler_id VARCHAR(32) NOT NULL COMMENT '出行人员ID',
    traveler_no VARCHAR(20) NOT NULL COMMENT '出行人员工号',
    traveler_name VARCHAR(50) NOT NULL COMMENT '出行人员姓名',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    subsidy_days INT NOT NULL COMMENT '补助天数',
    trip_route VARCHAR(100) DEFAULT NULL COMMENT '行程路线（出发-到达）',
    subsidy_city_id VARCHAR(20) NOT NULL COMMENT '补助城市ID（取到达城市）',
    subsidy_city_name VARCHAR(50) NOT NULL COMMENT '补助城市名称',
    apply_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT '申请金额',
    subsidy_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT '补助金额（日历勾选项合计）',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_main_id (main_id),
    KEY idx_trip_id (trip_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='补助信息表';

-- 10. 补助日历表
DROP TABLE IF EXISTS reim_subsidy_calendar;
CREATE TABLE reim_subsidy_calendar (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    subsidy_id BIGINT NOT NULL COMMENT '补助信息ID',
    subsidy_date DATE NOT NULL COMMENT '补助日期',
    day_of_week VARCHAR(10) DEFAULT NULL COMMENT '星期（如：星期一）',
    meal_standard DECIMAL(10,2) DEFAULT 0.00 COMMENT '餐补标准金额',
    transport_standard DECIMAL(10,2) DEFAULT 40.00 COMMENT '交补标准金额',
    phone_standard DECIMAL(10,2) DEFAULT 40.00 COMMENT '通补标准金额',
    is_meal_selected TINYINT(1) DEFAULT 1 COMMENT '餐补是否选中：0-否，1-是',
    is_transport_selected TINYINT(1) DEFAULT 1 COMMENT '交补是否选中：0-否，1-是',
    is_phone_selected TINYINT(1) DEFAULT 1 COMMENT '通补是否选中：0-否，1-是',
    meal_apply_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '餐补申请金额（≤标准金额）',
    transport_apply_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '交补申请金额',
    phone_apply_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '通补申请金额',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_subsidy_id (subsidy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='补助日历表（按天明细）';

-- 11. 费用分摊表
DROP TABLE IF EXISTS reim_cost_allocation;
CREATE TABLE reim_cost_allocation (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    main_id BIGINT NOT NULL COMMENT '报销单主表ID',
    company_id VARCHAR(32) NOT NULL COMMENT '费用归属公司ID',
    company_no VARCHAR(20) DEFAULT NULL COMMENT '公司编号',
    company_name VARCHAR(50) DEFAULT NULL COMMENT '公司名称',
    project_id VARCHAR(32) NOT NULL COMMENT '项目ID',
    project_no VARCHAR(20) DEFAULT NULL COMMENT '项目编号',
    project_name VARCHAR(50) DEFAULT NULL COMMENT '项目名称',
    allocation_ratio DECIMAL(5,4) DEFAULT 0.0000 COMMENT '分摊比例（0~1，如1.0000=100%）',
    allocation_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT '分摊金额',
    sort_order INT DEFAULT 0 COMMENT '排序序号（第1行为自动计算行）',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_main_id (main_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='费用分摊表';

-- 12. 异动日志表（审计追溯）
DROP TABLE IF EXISTS reim_audit_log;
CREATE TABLE reim_audit_log (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    main_id BIGINT NOT NULL COMMENT '报销单主表ID',
    reimbursement_no VARCHAR(32) NOT NULL COMMENT '报销单号',
    operation VARCHAR(20) NOT NULL COMMENT '操作类型：SUBMIT-提交，VOID-作废，DELETE-删除',
    from_status TINYINT(1) DEFAULT NULL COMMENT '变更前状态：0-草稿，1-已完成，2-已作废',
    to_status TINYINT(1) DEFAULT NULL COMMENT '变更后状态：0-草稿，1-已完成，2-已作废',
    operator_id VARCHAR(32) NOT NULL DEFAULT 'SYSTEM' COMMENT '操作人ID（未接入登录时默认为SYSTEM）',
    operator_name VARCHAR(50) NOT NULL DEFAULT 'SYSTEM' COMMENT '操作人姓名',
    remark VARCHAR(200) DEFAULT NULL COMMENT '备注',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    PRIMARY KEY (id),
    KEY idx_main_id (main_id),
    KEY idx_operation (operation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='异动日志表（审计追溯）';

-- 13. 附件表
DROP TABLE IF EXISTS reim_attachment;
CREATE TABLE reim_attachment (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    main_id BIGINT NOT NULL COMMENT '报销单主表ID',
    file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '服务器存储相对路径',
    file_size BIGINT NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
    content_type VARCHAR(100) DEFAULT NULL COMMENT 'MIME类型',
    creation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    PRIMARY KEY (id),
    KEY idx_main_id (main_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='附件表';

-- ============================================================
-- 三、Mock数据（来源于概要设计5.3节）
-- ============================================================

-- 公司数据（5条）
INSERT INTO reim_company (company_id, company_no, company_name) VALUES
('1C54557F1782E000', '0407', '胜意科技北京分公司'),
('19218A262C976000', '0408', '胜意科技上海分公司'),
('1C61686865DA8000', '0409', '胜意科技武汉分公司'),
('1717271D1DA15000', '0410', '胜意科技杭州分公司'),
('16AE93CC7EF92002', '0411', '胜意科技荆州分公司');

-- 部门数据（7条）
INSERT INTO reim_department (department_id, department_no, department_name) VALUES
('13AB8D7B52A9B002', '072001', '客户成功事业部'),
('13BFD31C6029A002', '072002', '企业消费事业部'),
('14515BB4BFB92003', '072003', '企业费控事业部'),
('19206611C47A6000', '072004', '集采事业部'),
('19D32F9FE9647000', '072005', '航旅事业部'),
('13C7E2BAE0393001', '072006', '运营事业部'),
('14055D22BB808001', '072007', '营销事业部');

-- 员工数据（6条）
INSERT INTO reim_employee (employee_id, employee_no, employee_name) VALUES
('13AB3A3F72409002', '74541', '徐年年'),
('13AB498CC6409002', '74008', '郑雨雪'),
('13AB4A56BB009002', '21552', '邹薇'),
('13AB591FE8009002', '80681', '王成军'),
('13AB77281A408001', '89899', '潘展飞'),
('13AB7925EB808001', '10503', '姜林');

-- 业务类型数据（14条，三级树形）
INSERT INTO reim_business_type (business_type_id, business_type_no, business_type_name, superior_id, has_subordinate, level, sort_order) VALUES
('18F0916A8C2C4000', '1001001', '员工差旅活动', 'none', 1, 1, 1),
('18F091913EEC4000', '100100101', '境内出差', '18F0916A8C2C4000', 1, 2, 1),
('1B5FEB7DD4396000', '10010010101', '项目出差', '18F091913EEC4000', 0, 3, 1),
('1A92E43082EFC000', '10010010102', '市场拓展出差', '18F091913EEC4000', 0, 3, 2),
('13AB3A4138008001', '100100102', '境外出差', '18F0916A8C2C4000', 1, 2, 2),
('13AB3A4248008002', '10010010201', '国外考察', '13AB3A4138008001', 0, 3, 1),
('13AB3A4154008001', '10010010202', '售后维护出差', '13AB3A4138008001', 0, 3, 2),
('13AB3A4172008001', '1001002', '人力资源', 'none', 1, 1, 2),
('13AB3A418F808001', '100100201', '个人团队培训', '13AB3A4172008001', 0, 3, 1),
('13AB3A41AC408001', '100100202', '招聘会', '13AB3A4172008001', 0, 3, 2),
('13AB3A41CD808002', '1001003', '员工福利', 'none', 1, 1, 3),
('13AB3A41ED408002', '100100301', '员工旅游', '13AB3A41CD808002', 0, 3, 1),
('13AB3A420CC08002', '100100302', '员工团建', '13AB3A41CD808002', 0, 3, 2),
('13AB3A422A808001', '100100303', '员工体检', '13AB3A41CD808002', 0, 3, 3);

-- 城市数据（5条）
INSERT INTO reim_city (city_no, city_name, city_type) VALUES
('10119', '北京', 1),
('10621', '上海', 1),
('10458', '武汉', 2),
('10216', '杭州', 2),
('10455', '荆州', 3);

-- 项目数据（8条）
INSERT INTO reim_project (project_id, project_no, project_name) VALUES
('12BC248B25083001', 'nonProjectRelated', '非项目类费用归集'),
('1C811ABF96195000', 'centralChina', '华中客户定制化项目'),
('1C5931735AC4A000', 'southChina', '华南客户定制化项目'),
('1771EC45F2443000', 'northChina', '华北客户定制化项目'),
('1762792DB4E9A002', 'eastChina', '华东客户定制化项目'),
('17071065FC29A002', 'southWest', '西南客户定制化项目'),
('162664EBE9ABE001', 'northWest', '西北客户定制化项目'),
('162664B8526BE002', 'northEast', '东北客户定制化项目');
