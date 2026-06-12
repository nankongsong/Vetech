import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/reimburse',
    },
    {
      path: '/reimburse',
      name: 'reimburseList',
      component: () => import('../views/reimburse/ReimbursementList.vue'),
      meta: { title: '报销单列表' },
    },
    {
      path: '/reimburse/add',
      name: 'reimburseAdd',
      component: () => import('../views/reimburse/ReimbursementEdit.vue'),
      meta: { title: '新增报销单' },
    },
    {
      path: '/reimburse/:id/edit',
      name: 'reimburseEdit',
      component: () => import('../views/reimburse/ReimbursementEdit.vue'),
      meta: { title: '编辑报销单' },
    },
  ],
})

export default router
