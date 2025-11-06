<template>
  <div class="post-edit">
    <h2>게시글 수정</h2>

    <div v-if="loading" class="loading">로딩 중...</div>

    <form v-else-if="form.title" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">제목</label>
        <input
          type="text"
          id="title"
          v-model="form.title"
          required
          maxlength="200"
          placeholder="제목을 입력하세요"
        />
      </div>

      <div class="form-group">
        <label for="content">내용</label>
        <textarea
          id="content"
          v-model="form.content"
          required
          rows="15"
          placeholder="내용을 입력하세요"
        ></textarea>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? '수정 중...' : '수정하기' }}
        </button>
        <button type="button" @click="goBack" class="btn btn-secondary">
          취소
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePostsStore } from '../stores/posts';

const router = useRouter();
const route = useRoute();
const postsStore = usePostsStore();

const form = ref({
  title: '',
  content: '',
});

const loading = ref(false);
const submitting = ref(false);
const error = ref('');

const fetchPost = async () => {
  loading.value = true;

  try {
    const postId = route.params.id;

    // Store에서 캐시된 게시글 먼저 확인
    const cachedPost = postsStore.getPostById(postId);

    if (cachedPost) {
      // 캐시된 데이터가 있으면 즉시 폼 채우기
      form.value.title = cachedPost.title;
      form.value.content = cachedPost.content;
      console.log(`✨ 캐시된 게시글로 편집 폼 초기화 - ID ${postId}`);
    }

    // Store를 통해 데이터 가져오기 (캐시가 없으면 API 호출)
    const post = await postsStore.fetchPostById(postId);
    form.value.title = post.title;
    form.value.content = post.content;
  } catch (err) {
    error.value = '게시글을 불러오는데 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  error.value = '';

  try {
    // Store를 통해 게시글 수정 (캐시 무효화 포함)
    await postsStore.updatePost(route.params.id, form.value);
    console.log('✅ 게시글 수정 완료, 캐시 갱신됨');

    // 수정된 게시글 상세 페이지로 이동
    router.push(`/posts/${route.params.id}`);
  } catch (err) {
    error.value = err.response?.data?.message || '게시글 수정에 실패했습니다.';
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push(`/posts/${route.params.id}`);
};

onMounted(() => {
  fetchPost();
});
</script>

<style scoped>
.post-edit {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #3498db;
}

textarea {
  resize: vertical;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}
</style>
