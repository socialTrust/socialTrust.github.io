<template>
  <div class="post-list">
    <div class="header">
      <h2>게시판</h2>
      <router-link v-if="isAuthenticated" to="/posts/create" class="btn btn-primary">글쓰기</router-link>
    </div>

    <div v-if="loading" class="loading">로딩 중...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <table class="posts-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>조회수</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id" @click="goToPost(post.id)" class="post-row">
            <td>{{ post.id }}</td>
            <td class="title">
              {{ post.title }}
              <span v-if="post.comment_count > 0" class="comment-count">[{{ post.comment_count }}]</span>
            </td>
            <td>{{ post.username }}</td>
            <td>{{ post.view_count }}</td>
            <td>{{ formatDate(post.created_at) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="pagination">
        <button
          @click="changePage(page - 1)"
          :disabled="page === 1"
          class="btn-page"
        >
          이전
        </button>
        <span class="page-info">{{ page }} / {{ pagination.totalPages }}</span>
        <button
          @click="changePage(page + 1)"
          :disabled="page === pagination.totalPages"
          class="btn-page"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePostsStore } from '../stores/posts';

const router = useRouter();
const authStore = useAuthStore();
const postsStore = usePostsStore();

const posts = ref([]);
const pagination = ref(null);
const page = ref(1);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const loading = computed(() => postsStore.loading);
const error = computed(() => postsStore.error);

const fetchPosts = async () => {
  try {
    // Store에서 캐시된 데이터 먼저 확인
    const cachedData = postsStore.getListByPage(page.value);

    if (cachedData) {
      // 캐시된 데이터가 있으면 즉시 표시 (새로고침 없는 빠른 네비게이션)
      posts.value = cachedData.posts;
      pagination.value = cachedData.pagination;
      console.log(`✨ 캐시된 데이터 사용 - 페이지 ${page.value}`);
    }

    // Store를 통해 데이터 가져오기 (캐시가 없으면 API 호출)
    const data = await postsStore.fetchPosts(page.value);
    posts.value = data.posts;
    pagination.value = data.pagination;
  } catch (err) {
    console.error('게시글 로딩 실패:', err);
  }
};

const goToPost = (id) => {
  router.push(`/posts/${id}`);
};

const changePage = (newPage) => {
  page.value = newPage;
  fetchPosts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.post-list {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h2 {
  color: #2c3e50;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: #e74c3c;
}

.posts-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.posts-table th,
.posts-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.posts-table th {
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
}

.post-row {
  cursor: pointer;
  transition: background 0.2s;
}

.post-row:hover {
  background: #f8f9fa;
}

.title {
  font-weight: 500;
  color: #2c3e50;
}

.comment-count {
  color: #3498db;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-page {
  padding: 0.5rem 1rem;
  border: 1px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #3498db;
  color: white;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #7f8c8d;
}
</style>
