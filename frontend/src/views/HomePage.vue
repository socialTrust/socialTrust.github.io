<template>
  <div class="home">
    <h1>Social Trust 게시판에 오신 것을 환영합니다</h1>
    <p>만 명의 회원이 신뢰를 바탕으로 소통하는 공간입니다.</p>

    <div class="features">
      <div class="feature">
        <h3>안전한 커뮤니티</h3>
        <p>회원 인증을 통한 신뢰할 수 있는 소통</p>
      </div>
      <div class="feature">
        <h3>자유로운 토론</h3>
        <p>다양한 주제로 자유롭게 의견 교환</p>
      </div>
      <div class="feature">
        <h3>빠른 검색</h3>
        <p>원하는 정보를 빠르게 찾을 수 있습니다</p>
      </div>
    </div>

    <div class="cta">
      <router-link to="/posts" class="btn btn-primary">게시판 보기</router-link>
      <router-link v-if="!isAuthenticated" to="/register" class="btn btn-secondary">회원가입</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<style scoped>
.home {
  text-align: center;
  padding: 3rem 0;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.feature {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feature h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.cta {
  margin-top: 3rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #2ecc71;
  color: white;
}

.btn-secondary:hover {
  background: #27ae60;
}
</style>
