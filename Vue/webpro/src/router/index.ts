import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
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
      component: () => import('../App.vue')
    }
  ]
})
export default router
