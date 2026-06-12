<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { Check, Delete, Edit, Message, Search, Star } from '@element-plus/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import { getScoreList, type ScoreRecord, type ScoreSearchParams } from '@/api/score'

const tableData = ref<ScoreRecord[]>([])
const formInline = reactive<ScoreSearchParams>({
  studentId: null,
  name: null,
  age: null
})
const tableData2 = ref<ScoreRecord[]>([])
// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载状态
const loading = ref(false)
function handleSearch() {
  currentPage.value = 1
  fetchData()
}
// 重置方法
const onReset = () => {
  formInline.studentId = ''
  formInline.name = ''
  formInline.age = ''
}
async function fetchData() {
  loading.value = true
  try {
    //    只传有值的参数，避免空字符串导致后端报错
    const params: Record<string, any> = {
      current: currentPage.value,
      size: pageSize.value
    }
    if (formInline.studentId) params.studentId = formInline.studentId
    if (formInline.name) params.name = formInline.name
    if (formInline.age) params.age = formInline.age

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
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="main">
    <div>
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="编号">
          <el-input v-model="formInline.studentId" placeholder="编号" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="formInline.name" placeholder="姓名" />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input v-model="formInline.age" placeholder="age" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="studentId" label="学生编号" width="180" />
        <el-table-column prop="studentName" label="学生姓名" width="180" />
        <el-table-column prop="age" label="学生年龄" width="180" />
        <el-table-column prop="courseName" label="科目" width="180" />
        <el-table-column prop="courseId" label="课程编号" width="180" />
        <el-table-column prop="score" label="成绩" width="180" />
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
    </div>
  </div>
</template>

<style scoped>

.main {
  width: 100%;
}
.demo-form-inline {
  width: 100%;
}
header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
.pagination-wrapper {
  place-content: center;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
