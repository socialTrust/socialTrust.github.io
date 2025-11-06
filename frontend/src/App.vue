<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <nav class="nav">
          <router-link to="/" class="logo">Social Trust</router-link>
          <div class="nav-links">
            <router-link to="/posts">게시판</router-link>
            <router-link to="/search">검색</router-link>
            <template v-if="isAuthenticated">
              <router-link to="/posts/create">글쓰기</router-link>
              <span class="user-info">{{ currentUser?.username }}</span>
              <button @click="handleLogout" class="btn-logout">로그아웃</button>
            </template>
            <template v-else>
              <router-link to="/login">로그인</router-link>
              <router-link to="/register">회원가입</router-link>
            </template>
          </div>
        </nav>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <router-view />
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 Social Trust Board. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.currentUser);

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style>
.header {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.nav-links a:hover {
  opacity: 0.8;
}

.nav-links a.router-link-active {
  border-bottom: 2px solid white;
}

.user-info {
  color: #ecf0f1;
}

.btn-logout {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #c0392b;
}

.main {
  min-height: calc(100vh - 180px);
  padding: 2rem 0;
}

.footer {
  background: #34495e;
  color: white;
  padding: 2rem 0;
  text-align: center;
  margin-top: 2rem;
}
</style>
