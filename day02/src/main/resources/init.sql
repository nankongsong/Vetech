-- =============================================
-- 创建数据库（如不存在则创建）
-- =============================================
CREATE DATABASE IF NOT EXISTS day02_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE day02_db;

-- =============================================
-- 1. 学生表 student
-- =============================================
DROP TABLE IF EXISTS sc;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS student;

CREATE TABLE student
(
    id     INT AUTO_INCREMENT PRIMARY KEY COMMENT '学生编号',
    name   VARCHAR(50)  NOT NULL COMMENT '学生姓名',
    age    INT          NOT NULL COMMENT '年龄',
    gender VARCHAR(4)   NOT NULL COMMENT '性别'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='学生表';

-- =============================================
-- 2. 课程表 course
-- =============================================
CREATE TABLE course
(
    id         INT AUTO_INCREMENT PRIMARY KEY COMMENT '课程编号',
    name       VARCHAR(100) NOT NULL COMMENT '课程名称',
    teacher_id INT          NOT NULL COMMENT '教师编号'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='课程表';

-- =============================================
-- 3. 成绩表 sc
-- =============================================
CREATE TABLE sc
(
    student_id INT           NOT NULL COMMENT '学生编号',
    course_id  INT           NOT NULL COMMENT '课程编号',
    score      DECIMAL(5, 2) NOT NULL COMMENT '分数',
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES student (id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='成绩表';

-- =============================================
-- 插入学生数据（25条）
-- =============================================
INSERT INTO student (name, age, gender)
VALUES ('张三', 20, '男'),
       ('李四', 21, '男'),
       ('王五', 19, '女'),
       ('赵六', 22, '男'),
       ('孙七', 20, '女'),
       ('周八', 21, '男'),
       ('吴九', 23, '女'),
       ('郑十', 20, '男'),
       ('钱十一', 22, '女'),
       ('陈十二', 19, '男'),
       ('刘梅', 21, '女'),
       ('黄伟', 20, '男'),
       ('林芳', 22, '女'),
       ('杨洋', 19, '男'),
       ('朱丽', 21, '女'),
       ('马超', 23, '男'),
       ('胡歌', 20, '男'),
       ('何冰', 22, '女'),
       ('罗浩', 21, '男'),
       ('高圆圆', 20, '女'),
       ('唐强', 19, '男'),
       ('邓紫', 22, '女'),
       ('许磊', 21, '男'),
       ('韩雪', 23, '女'),
       ('冯刚', 20, '男');

-- =============================================
-- 插入课程数据（20条）
-- =============================================
INSERT INTO course (name, teacher_id)
VALUES ('数学', 101),
       ('语文', 102),
       ('英语', 103),
       ('物理', 104),
       ('化学', 105),
       ('生物', 106),
       ('历史', 107),
       ('地理', 108),
       ('政治', 109),
       ('计算机', 110),
       ('体育', 111),
       ('音乐', 112),
       ('美术', 113),
       ('心理学', 114),
       ('经济学', 115),
       ('统计学', 116),
       ('日语', 117),
       ('哲学', 118),
       ('法学', 119),
       ('管理学', 120);

-- =============================================
-- 插入成绩数据（60条，覆盖多位学生多门课程）
-- =============================================
-- 张三的成绩（5门）
INSERT INTO sc (student_id, course_id, score)
VALUES (1, 1, 85.5),   -- 张三 数学
       (1, 2, 78.0),   -- 张三 语文
       (1, 3, 92.0),   -- 张三 英语
       (1, 4, 88.5),   -- 张三 物理
       (1, 5, 76.0);   -- 张三 化学

-- 李四的成绩（5门）
INSERT INTO sc (student_id, course_id, score)
VALUES (2, 1, 90.0),   -- 李四 数学
       (2, 2, 82.5),
       (2, 3, 79.0),
       (2, 4, 91.0),
       (2, 5, 85.0);

-- 王五的成绩（4门）
INSERT INTO sc (student_id, course_id, score)
VALUES (3, 1, 72.0),
       (3, 2, 88.0),
       (3, 3, 95.5),
       (3, 6, 83.0);

-- 赵六的成绩（4门）
INSERT INTO sc (student_id, course_id, score)
VALUES (4, 1, 68.0),
       (4, 2, 75.5),
       (4, 4, 81.0),
       (4, 7, 89.5);

-- 孙七的成绩（3门）
INSERT INTO sc (student_id, course_id, score)
VALUES (5, 1, 94.0),
       (5, 3, 77.0),
       (5, 5, 86.5);

-- 周八的成绩（4门）
INSERT INTO sc (student_id, course_id, score)
VALUES (6, 2, 91.0),
       (6, 4, 73.5),
       (6, 6, 88.0),
       (6, 8, 79.0);

-- 吴九的成绩（3门）
INSERT INTO sc (student_id, course_id, score)
VALUES (7, 1, 55.0),
       (7, 3, 67.5),
       (7, 7, 82.0);

-- 郑十的成绩（4门）
INSERT INTO sc (student_id, course_id, score)
VALUES (8, 1, 87.0),
       (8, 2, 93.5),
       (8, 5, 78.0),
       (8, 8, 84.0);

-- 钱十一的成绩（3门）
INSERT INTO sc (student_id, course_id, score)
VALUES (9, 3, 96.0),
       (9, 4, 82.5),
       (9, 6, 74.0);

-- 陈十二的成绩（4门）
INSERT INTO sc (student_id, course_id, score)
VALUES (10, 1, 81.5),
       (10, 2, 69.0),
       (10, 7, 90.0),
       (10, 8, 77.5);

-- 刘梅的成绩（3门）
INSERT INTO sc (student_id, course_id, score)
VALUES (11, 1, 89.0),
       (11, 3, 84.5),
       (11, 5, 71.0);

-- 黄伟的成绩（3门）
INSERT INTO sc (student_id, course_id, score)
VALUES (12, 2, 76.0),
       (12, 4, 93.0),
       (12, 6, 85.5);

-- 林芳的成绩（3门）
INSERT INTO sc (student_id, course_id, score)
VALUES (13, 1, 62.5),
       (13, 3, 88.0),
       (13, 7, 79.5);

-- 杨洋的成绩（3门）
INSERT INTO sc (student_id, course_id, score)
VALUES (14, 1, 97.0),
       (14, 5, 83.0),
       (14, 8, 90.5);

-- 朱丽的成绩（2门）
INSERT INTO sc (student_id, course_id, score)
VALUES (15, 2, 85.0),
       (15, 4, 78.5);

-- 马超的成绩（2门）
INSERT INTO sc (student_id, course_id, score)
VALUES (16, 1, 73.0),
       (16, 6, 91.5);

-- 胡歌的成绩（2门）
INSERT INTO sc (student_id, course_id, score)
VALUES (17, 3, 86.0),
       (17, 7, 68.5);

-- 何冰的成绩（2门）
INSERT INTO sc (student_id, course_id, score)
VALUES (18, 2, 94.0),
       (18, 5, 77.0);

-- 罗浩的成绩（2门）
INSERT INTO sc (student_id, course_id, score)
VALUES (19, 1, 59.0),
       (19, 8, 82.5);

-- 高圆圆的成绩（2门）
INSERT INTO sc (student_id, course_id, score)
VALUES (20, 4, 87.5),
       (20, 6, 72.0);
