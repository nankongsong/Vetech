import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/scores'
    },
    {
      path: '/scores',
      name: 'scores',
      component: () => import('../views/ScoreListView.vue')
    }
  ]
})

export default router
