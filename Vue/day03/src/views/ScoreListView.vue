<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getScoreList, type ScoreRecord, type ScoreSearchParams } from '@/api/score'

// 搜索表单
const searchForm = reactive<ScoreSearchParams>({
  studentId: null,
  name: null,
  age: null,
})

// 表格数据
const tableData = ref<ScoreRecord[]>([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载状态
const loading = ref(false)

// 查询数据
async function fetchData() {
  loading.value = true
  try {
    // 只传有值的参数，避免空字符串导致后端报错
    const params: Record<string, any> = {
      current: currentPage.value,
      size: pageSize.value,
    }
    if (searchForm.studentId) params.studentId = searchForm.studentId
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.age) params.age = searchForm.age

    const res = await getScoreList(params)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('查询成绩失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  fetchData()
}

// 重置
function handleReset() {
  searchForm.studentId = null
  searchForm.name = null
  searchForm.age = null
  currentPage.value = 1
  fetchData()
}

// 分页变化
function handlePageChange(page: number) {
  currentPage.value = page
  fetchData()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchData()
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="score-container">
    <h2>学生成绩列表</h2>

    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="学生编号">
          <el-input
            v-model.number="searchForm.studentId"
            placeholder="请输入编号"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="学生姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入姓名"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input
            v-model.number="searchForm.age"
            placeholder="请输入年龄"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        empty-text="暂无数据"
      >
        <el-table-column prop="studentId" label="学生编号" width="120" align="center" />
        <el-table-column prop="studentName" label="学生姓名" width="140" align="center" />
        <el-table-column prop="age" label="年龄" width="100" align="center" />
        <el-table-column prop="courseName" label="对应课程名" min-width="180" align="center" />
        <el-table-column prop="score" label="考试分数" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.score >= 80 ? 'success' : row.score >= 60 ? 'warning' : 'danger'">
              {{ row.score }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.score-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.score-container h2 {
  margin-bottom: 20px;
  color: #303133;
}

.search-card {
  margin-bottom: 16px;
}

.search-card .el-form {
  display: flex;
  flex-wrap: wrap;
}

.table-card {
  min-height: 400px;
  width: 1000px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
