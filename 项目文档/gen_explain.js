const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
        HeadingLevel, PageNumber, PageBreak, TableOfContents } = require('docx');

const bdr = { top: { style: BorderStyle.SINGLE, size: 1, color: "999999" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" }, left: { style: BorderStyle.SINGLE, size: 1, color: "999999" }, right: { style: BorderStyle.SINGLE, size: 1, color: "999999" } };
const hBg = { fill: "2E75B6", type: ShadingType.CLEAR };
const cm = { top: 50, bottom: 50, left: 80, right: 80 };
const PW = 9360;

function hc(t, w) { return new TableCell({ borders: bdr, width: { size: w, type: WidthType.DXA }, shading: hBg, margins: cm, verticalAlign: "center", children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, font: "Microsoft YaHei", size: 16, color: "FFFFFF" })] })] }); }
function dc(t, w, a, o) { return new TableCell({ borders: bdr, width: { size: w, type: WidthType.DXA }, margins: cm, shading: (o && o.bg) || undefined, children: [new Paragraph({ alignment: a || AlignmentType.LEFT, children: [new TextRun({ text: t || "", font: "Microsoft YaHei", size: 16 })] })] }); }

function p(text, opts) { return new Paragraph(Object.assign({ spacing: { after: 80 }, children: [new TextRun(Object.assign({ text, font: "Microsoft YaHei", size: 22 }, (opts || {})))] })); }
function bullet(text) { return new Paragraph({ spacing: { after: 50 }, indent: { left: 720 }, children: [new TextRun({ text: "● " + text, font: "Microsoft YaHei", size: 22 })] }); }
function qa(q, a) {
  return [
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "Q: " + q, bold: true, font: "Microsoft YaHei", size: 22, color: "C7254E" })] }),
    new Paragraph({ spacing: { after: 80 }, indent: { left: 360 }, children: [new TextRun({ text: "A: " + a, font: "Microsoft YaHei", size: 22 })] }),
  ];
}

function code(text) { return new Paragraph({ spacing: { after: 60 }, indent: { left: 360 }, children: [new TextRun({ text, font: "Consolas", size: 18, color: "555555" })] }); }

// ========================
const children = [];

// ── Title page ──
children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "差旅报销单（Vetech）", bold: true, font: "Microsoft YaHei", size: 44, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "项目详解与答辩准备文档", bold: true, font: "Microsoft YaHei", size: 36, color: "333333" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "—— 后端部分（nankongsong）", font: "Microsoft YaHei", size: 24, color: "666666" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "用途：掌握项目全局 + 答辩Q&A准备 + 代码逻辑详解", font: "Microsoft YaHei", size: 20, color: "999999" })] }),
);

children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("目录")] }),
  new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-3" }),
);

// ═══════════════ PART 1: PROJECT OVERVIEW ═══════════════
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("第一部分：项目全局理解")] }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 这个项目是做什么的？")] }),
  p("一句话概括：员工出差自己垫钱 → 回来填报销单 → 企业核销结算。我们做的是'填报销单'这个环节的信息化系统。"),
  p("业务流程（一张报销单的一生）："),
  bullet("① 员工出差回来，打开系统 → 看到报销单列表"),
  bullet("② 点击'新增'，填写基本信息（谁报销、哪个部门、什么业务类型、出差事由）"),
  bullet("③ 补录行程：去了哪（武汉→北京）、哪天去的、哪天回的 → 系统自动算补助"),
  bullet("④ 系统根据到达城市等级，自动生成补助日历（每天多少钱）"),
  bullet("⑤ 员工可调整补助（比如某天有人请吃饭，就取消餐补）"),
  bullet("⑥ 费用分摊：这笔补助费用分摊到哪些项目上，各占多少比例"),
  bullet("⑦ 确认无误，点击'提交' → 系统做最终校验 → 报销单完成"),
  bullet("⑧ 后续如有问题可作废。注意：我们不做审批环节"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 团队怎么分工？")] }),
  p("团队3人，我负责后端全部（数据库设计 + API接口 + 业务逻辑）。前端两人负责Vue页面。"),
  p("前后端如何协作："),
  bullet("后端写REST API，返回JSON数据"),
  bullet("前端调API拿数据、展示页面"),
  bullet("接口文档（API文档 + 表结构定义）是我写好给前端看的'合同'"),
  bullet("前端只需要知道'调哪个URL、传什么参数、返回什么数据'，不需要知道数据库怎么存的"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.3 用了什么技术？为什么选这些？")] }),
  p("后端技术栈和选型理由："),
  bullet("Spring Boot 3.2.12：企业主流框架。选3.2.12是因为老师给的开发手册就是这个版本，稳定可靠。不用最新的3.5.x——训练项目求稳不追新"),
  bullet("MyBatis-Plus 3.5.11：MyBatis增强工具。相比JPA，MP更灵活（复杂SQL写在XML里），且是中国企业最主流的ORM框架。BaseMapper自动生成CRUD，少写80%样板代码"),
  bullet("MySQL 8.0：最通用的关系型数据库，训练环境标配"),
  bullet("Java 17：Spring Boot 3.x最低要求，LTS长期支持版本"),
  bullet("Lombok：消灭getter/setter样板代码，代码更简洁"),
);

// ═══════════════ PART 2: BACKEND DETAILS ═══════════════
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("第二部分：后端详细实现 — 每个功能怎么做的")] }),

  // 2.1 数据库设计
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 数据库设计：为什么是11张表？")] }),
  p("设计原则：一张现实中的'概念'一张表，不冗余存储，通过ID关联。"),
  p("业务主表（5张）—— 和报销单直接相关："),
  bullet("reim_main（报销单主表）：一张报销单一条记录。含基本信息 + 补助合计 + 状态 + version乐观锁"),
  bullet("reim_trip（行程明细表）：一次报销可以有多次行程（如先去北京再去上海）。关联main_id"),
  bullet("reim_subsidy（补助信息表）：每条行程对应一条补助总览。含补助天数/路线/城市/金额"),
  bullet("reim_subsidy_calendar（补助日历表）：把补助'按天展开'。比如北京3天→3条记录，每条含日期/星期/三种补助的选中状态和金额"),
  bullet("reim_cost_allocation（费用分摊表）：一笔报销的补助要分到多个项目上"),
  p("基础数据表（6张）—— 下拉选项的数据来源："),
  bullet("reim_company/department/employee/city/project：提供页面下拉框的选项"),
  bullet("reim_business_type（业务类型）：特殊在它是'树形结构'（三级），如 员工差旅活动 > 境内出差 > 项目出差"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("设计决策Q&A")] }),
  ...qa("为什么用bigint自增ID，不用varchar(32)？","bigint自增：①性能好（索引小、插入快）②简单（不需要手动生成UUID）③适合单机应用。varchar UUID适合分布式系统——但我们这是单体应用，不需要。"),
  ...qa("为什么补助日历要'按天存明细行'而不是存JSON？","按天存：①前端checkbox直接映射到每条记录（勾选=UPDATE一行）②SQL查询和统计方便（SUM即可）③MyBatis-Plus批量更新容易。JSON的话前端解析麻烦，SQL里算合计也困难。"),
  ...qa("为什么表之间不用数据库外键约束？","企业实践：外键约束在应用层管理（Service层校验），不在数据库层建。原因：①外键影响写入性能 ②级联删除在代码里显式控制更清晰 ③数据量大时外键是瓶颈。我们的级联删除在代码里显式写清楚了。"),
  ...qa("为什么reim_main有version字段？","乐观锁。更新时WHERE version=旧值，如果别人先改了导致version变了，我的UPDATE就影响0行→知道冲突了→提示用户刷新。比悲观锁（SELECT...FOR UPDATE）好，因为报销单并发冲突概率低，乐观锁不阻塞读操作。"),

  // 2.2 项目结构
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 代码分层架构：为什么要这样分层？")] }),
  p("标准四层架构，每层只做自己该做的事："),
  bullet("Controller层（接入层）：接收HTTP请求，参数校验，调用Service，返回Result。不写任何业务逻辑"),
  bullet("Service层（业务层）：核心。写所有业务规则、校验、事务控制。一个Service方法=一个完整的业务操作"),
  bullet("Mapper层（数据访问层）：只负责和数据库交互。继承BaseMapper自动获得CRUD，复杂查询写XML"),
  bullet("Entity层（实体层）：Java对象和数据库表一一映射（@TableName），纯数据载体"),
  p("为什么要这样分？"),
  bullet("单一职责：改业务逻辑只改Service，改数据库只改Mapper，互不影响"),
  bullet("可测试：每层可以单独Mock测试"),
  bullet("企业标准：这是胜意科技模板里的分层方式，面试/答辩问到能说清楚"),

  // 2.3 Core: 新增行程
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.3 核心功能1：新增行程 — 级联创建补助+日历")] }),
  p("这是'最复杂的写操作'。用户填完一个行程点保存，后端要做6件事，而且必须'要么全成功、要么全失败'。"),
  p("执行流程（都在一个@Transactional方法里）："),
  bullet("Step 1 校验：日期合法性（到达≥出发，不晚于今天）、必填字段"),
  bullet("Step 2 唯一性检查：查数据库，同一个报销单里、同一个出行人、日期范围不能和已有行程重叠"),
  bullet("Step 3 保存行程：INSERT INTO reim_trip"),
  bullet("Step 4 查城市等级：根据到达城市ID查reim_city，获取cityType → 决定餐补标准（1=100元, 2=80元, 3=50元）"),
  bullet("Step 5 生成补助信息：INSERT INTO reim_subsidy（天数=endDate-startDate+1）"),
  bullet("Step 6 按天生成补助日历：for循环从startDate到endDate，每天INSERT一条reim_subsidy_calendar（日期+星期+三种补助标准+默认全选中+申请金额=标准金额）"),
  p("如果Step 6失败了怎么办？——@Transactional会让Step 3/4/5也全部回滚，数据库回到'没执行过'的状态。这就是事务的作用。"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("可能的问题和应对")] }),
  ...qa("重复提交怎么办（用户手快点了两次保存）？","后端做唯一性校验（出行人+日期重叠检查），第二次提交会被拒绝，返回错误码40003。"),
  ...qa("城市等级查不到怎么办（新城市没配数据）？","代码有兜底：查不到城市时默认按二线城市（80元/天）计算。不会因为缺基础数据而报500错误。"),
  ...qa("跨天跨城怎么算？如武汉→北京，1号-5号，到北京是二线城市吗？","补助城市取'到达城市'，即北京（一线100元）。概要设计里写明了：'出发城市-到达城市：武汉-北京; 1号~5号补助按北京匹配'。"),

  // 2.4 Core: 补助日历
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.4 核心功能2：补助日历 — 勾选矩阵的存储和更新")] }),
  p("补助日历是一个'日期 × 补助类型'的二维矩阵。数据库里每行=一个日期，列=三种补助的选中状态和金额。"),
  p("前后端协作方式："),
  bullet("前端GET /api/reim/{id}/subsidy/{subsidyId}/calendar → 拿到按天排列的JSON数组 → 渲染成表格"),
  bullet("用户勾选/取消/改金额 → 前端收集所有变化 → PUT整批发送"),
  bullet("后端逐个UPDATE，同时校验'申请金额≤标准金额'（超了返回40009）"),
  bullet("更新完重新计算补助合计 → 更新reim_subsidy和reim_main"),

  // 2.5 Core: 费用分摊
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.5 核心功能3：费用分摊 — 均摊算法的精确处理")] }),
  p("分摊规则：第1行自动计算（100% - 其他行总和），不可手动编辑；第2+行可手动输入比例。"),
  p("均摊算法的关键——'除不尽怎么办'："),
  bullet("例：补助总金额100元，分3条。100÷3=33.333..."),
  bullet("前N-1条：比例=0.3333 (1/3 保留4位小数)，金额=100×0.3333=33.33"),
  bullet("第1条（首行）：比例=1-0.3333×2=0.3334（差值放首行），金额=100×0.3334=33.34"),
  bullet("最后一条：金额=总金额-前面累加和=100-33.33-33.33=33.34（用减法保证不差一分钱）"),
  p("这样做的好处：金额合计精确等于补助总金额，不会因为四舍五入差1分钱。"),

  // 2.6 Core: 提交
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.6 核心功能4：提交报销单 — 最复杂的事务方法")] }),
  p("提交是'把所有校验串起来'的入口。任何一个校验不通过，整个提交失败。"),
  p("提交执行步骤（@Transactional内，约10步）："),
  bullet("1. 查报销单 WHERE id=? AND version=? — 乐观锁"),
  bullet("2. 校验status==0 — 只有草稿能提交"),
  bullet("3. 必填字段：标题/事由/报销人/部门/公司/业务类型全部非空 → 否则40007"),
  bullet("4. 至少一条行程 → 否则40007"),
  bullet("5. 每条行程做唯一性复查（防止提交时数据已被改）"),
  bullet("6. 分摊比例之和≈100% → 否则40004"),
  bullet("7. 分摊金额合计==补助总金额 → 否则40005"),
  bullet("8. UPDATE status=1, version=version+1"),
  bullet("9. 重新计算补助合计（meal/transport/phone_allowance + subsidy_total）"),
  bullet("10. 提交成功"),
  p("为什么要把这么多校验放在一个事务里？——如果第8步成功但第9步失败，补助合计就不对了。所有步骤必须在同一个数据库事务中，利用ACID特性保证一致性。"),

  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("关键问题")] }),
  ...qa("两个人同时提交同一报销单会怎样？","乐观锁保证只有一个人成功。A先到→查到version=0→UPDATE成功→version变成1。B后到→WHERE version=0找不到记录（因为已经是1了）→返回40006。不会出现重复提交。"),
  ...qa("如果校验通过了，但在UPDATE前数据库挂了怎么办？","数据库挂→Spring抛出JDBC异常→@Transactional自动回滚→报销单保持草稿状态。用户重试即可。"),

  // 2.7 作废删除
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.7 作废和删除")] }),
  bullet("作废：已完成→已作废（状态1→2），version+1。只有已完成能作废，草稿不能作废（先提交再作废）"),
  bullet("删除草稿：物理删除（真删数据），级联删除行程→补助→日历→分摊。只有草稿能删。@Transactional保证级联原子性"),
  p("为什么不物理删除已完成的报销单？——企业规范：已提交的单据不能物理删除，只能作废（逻辑删除），保证审计追溯。"),

  // 2.8
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.8 报销单号生成")] }),
  p("格式：BX-20250612-0001（BX-年月日-4位序号）"),
  p("生成逻辑：查当天最大的序号 → +1 → 左补零到4位。如果当天还没有报销单，从0001开始。"),
  p("为什么用这种格式？——①一眼看出是哪天创建的 ②同一天序号递增不会重复 ③企业常见做法。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.9 统一错误码设计")] }),
  p("为什么不用HTTP状态码区分错误？——HTTP状态码只能区分大类（400/500），不能精确到业务错误。我们定义10个业务错误码，前端可以根据code做不同处理："),
  bullet("40001-40002：资源/状态问题 → 提示用户检查"),
  bullet("40003-40005：业务校验不通过 → 提示具体原因"),
  bullet("40006：乐观锁冲突 → 提示刷新重试"),
  bullet("40007-40010：数据问题 → 提示补充/修改"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.10 全局异常处理")] }),
  p("GlobalExceptionHandler + @RestControllerAdvice："),
  bullet("业务异常(BizException) → 返回自定义code+message → 前端精确提示"),
  bullet("系统异常(RuntimeException) → 返回500+'系统内部错误' → 不暴露SQL/堆栈给前端（安全考虑）"),
);

// ═══════════════ PART 3: TECH DEEP DIVE ═══════════════
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("第三部分：技术深度 — 为什么这么做？")] }),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 @Transactional 事务 — 深入理解")] }),
  p("我们项目里用事务的场景：提交报销单、新增行程、删除行程、更新补助日历、更新分摊。"),
  p("为什么用@Transactional而不是手动事务？"),
  bullet("① 声明式事务代码简洁（一个注解 vs 十几行try-catch-commit-rollback）"),
  bullet("② Spring自动管理事务生命周期：方法正常结束→commit，抛异常→rollback"),
  bullet("③ rollbackFor=Exception.class：默认只回滚RuntimeException，我们指定了所有异常都回滚"),
  p("事务隔离级别：默认READ_COMMITTED。为什么不用SERIALIZABLE？"),
  bullet("SERIALIZABLE级别太高，会锁表，性能差。我们的并发冲突通过乐观锁解决，不需要数据库级别串行化。"),
  p("分布式事务？——不需要。我们是单体应用，所有表在同一个MySQL实例里，本地事务就够了。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 乐观锁 @Version — 和悲观锁的对比")] }),
  p("乐观锁（我们用的）："),
  bullet("原理：读时不加锁，写时检查version。UPDATE WHERE id=? AND version=?"),
  bullet("优点：不阻塞读操作，并发性能好"),
  bullet("适用：'冲突概率低'的场景（报销单编辑，两个人同时改同一张单的概率很低）"),
  p("悲观锁（我们没用的）："),
  bullet("原理：SELECT...FOR UPDATE，读的时候就锁住行，别人读不了"),
  bullet("缺点：锁持有时间长（用户编辑可能几分钟），阻塞其他操作"),
  bullet("适用：'冲突概率高'或'必须绝对串行'的场景"),
  p("老师在评分标准里提到了'锁相关操作'——这个version字段就是我们的锁实现，能讲清楚乐观锁vs悲观锁的区别和选型理由，就是加分项。"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.3 BigDecimal精度 — 为什么金额不用double")] }),
  p("直接演示：0.1 + 0.2 = 0.30000000000000004（二进制浮点精度丢失）"),
  p("金额如果用double，100笔分摊加完可能差0.01元，企业财务系统绝对不允许。BigDecimal是精确的十进制运算。"),
  p("容易犯错的地方："),
  bullet("❌ new BigDecimal(0.1) — 还是用了double的近似值"),
  bullet("✅ new BigDecimal('0.1') 或 new BigDecimal('100') — 字符串或整数构造"),

  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.4 MyBatis-Plus BaseMapper — 怎么少写80%代码")] }),
  p("不用MP的情况：每个表要写 insert/update/delete/selectById/selectList/selectPage 六个方法+SQL"),
  p("用MP：extends BaseMapper<ReimMain>，这些方法自动就有了。我们只写'特殊查询'（如行程唯一性检查）。"),
  p("分页：Page对象 + PaginationInnerInterceptor拦截器，自动在SQL后面拼LIMIT。不用手动写分页逻辑。"),
);

// ═══════════════ PART 4: Q&A ═══════════════
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("第四部分：答辩高频问题准备")] }),

  ...qa("你在这个项目里具体做了什么？","我负责整个后端：①设计11张数据库表并编写init.sql ②定义20个REST API接口 ③实现核心业务逻辑（报销单CRUD、行程级联操作、补助计算、分摊均摊、提交校验）④编写5份文档（表结构、API接口、详细设计、WBS、自测报告）。代码总量约38个Java文件。"),
  ...qa("你遇到的最大技术难点是什么？","行程级联操作的事务一致性。新增一条行程要同时操作3张表（trip/subsidy/calendar），任何一步失败都必须全部回滚。我用@Transactional注解解决了这个问题。另一个难点是分摊均摊的金额精度问题，我用'最后一行金额=总金额-前面累加和'的减法方式保证了合计精确等于总金额。"),
  ...qa("你们的系统高并发下有什么问题？怎么解决？","当前是训练项目，并发量不大。但我们已做了防御：①乐观锁防止并发修改覆盖 ②事务隔离保证数据一致性。如果未来真的高并发，可以考虑Redis缓存基础数据（公司/部门等不常变的数据）来减少数据库压力。"),
  ...qa("如果数据库突然挂了，用户正在提交报销单怎么办？","数据库连接失败→Spring抛出异常→@Transactional自动回滚→前端收到500错误→提示用户'系统繁忙，请稍后重试'。报销单保持草稿状态，不会丢失已填的数据（草稿是边填边存的）。"),
  ...qa("为什么不直接把审批流程也做了？","项目范围定义就是'不做审批部分'。①概要设计里明确写了'单据状态只有草稿/已完成/已作废三种'②审批涉及工作流引擎（如Activiti/Flowable），引入了不必要的复杂度③训练时间有限，把报销单核心流程做精比做大更重要。但我们的架构预留了扩展性：如果以后要加审批，只需在status字段加一个'待审批'状态，提交后进入审批流程即可。"),
  ...qa("前端怎么知道调用哪个接口？","我写的API接口文档就是'前后端合同'。文档里每个接口标注了URL、方法、入参字段和类型、出参字段和类型、错误码。前端看着文档写代码，不需要看后端源码。"),
  ...qa("你们的代码规范吗？","①严格分层（Controller-Service-Mapper-Entity）②统一Result<T>响应格式③中文注释（老师要求）④@Transactional管理事务⑤全局异常处理⑥错误码统一管理。参考的是阿里巴巴Java开发规范。"),
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
        run: { size: 24, bold: true, font: "Microsoft YaHei", color: "333333" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "差旅报销单 - 项目详解与答辩准备", font: "Microsoft YaHei", size: 16, color: "999999", italics: true })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 16 }), new TextRun({ text: " 页", font: "Microsoft YaHei", size: 16 })] })] }) },
    children
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("E:\\Java vet\\项目文档\\差旅报销单_项目详解与答辩准备.docx", buf));
console.log("Done!");
