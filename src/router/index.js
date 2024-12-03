import { createRouter, createWebHistory } from 'vue-router'
import DashBoard from '@/components/DashBoard.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: DashBoard
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
