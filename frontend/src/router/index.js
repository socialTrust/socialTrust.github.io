import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue'),
  },
  {
    path: '/posts',
    name: 'PostList',
    component: () => import('../views/PostList.vue'),
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: () => import('../views/PostDetail.vue'),
  },
  {
    path: '/posts/create',
    name: 'PostCreate',
    component: () => import('../views/PostCreate.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/posts/:id/edit',
    name: 'PostEdit',
    component: () => import('../views/PostEdit.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/SearchPage.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 인증 가드
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
