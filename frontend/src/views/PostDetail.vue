<template>
  <div class="post-detail">
    <div v-if="loading" class="loading">로딩 중...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="post">
      <div class="post-header">
        <h2>{{ post.title }}</h2>
        <div class="post-meta">
          <span>작성자: {{ post.username }}</span>
          <span>조회수: {{ post.view_count }}</span>
          <span>{{ formatDate(post.created_at) }}</span>
        </div>
      </div>

      <div class="post-content">
        {{ post.content }}
      </div>

      <div class="post-actions" v-if="isAuthor">
        <button @click="editPost" class="btn btn-edit">수정</button>
        <button @click="deletePost" class="btn btn-delete">삭제</button>
      </div>

      <div class="comments-section">
        <h3>댓글 ({{ comments.length }})</h3>

        <div v-if="isAuthenticated" class="comment-form">
          <textarea
            v-model="newComment"
            placeholder="댓글을 입력하세요"
            rows="3"
          ></textarea>
          <button @click="submitComment" class="btn btn-primary" :disabled="!newComment.trim()">
            댓글 작성
          </button>
        </div>

        <div v-else class="login-required">
          댓글을 작성하려면 <router-link to="/login">로그인</router-link>하세요.
        </div>

        <div class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment">
            <div class="comment-header">
              <strong>{{ comment.username }}</strong>
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <div v-if="editingCommentId === comment.id" class="comment-edit">
              <textarea v-model="editCommentText" rows="2"></textarea>
              <div class="comment-edit-actions">
                <button @click="updateComment(comment.id)" class="btn btn-sm">저장</button>
                <button @click="cancelEditComment" class="btn btn-sm btn-cancel">취소</button>
              </div>
            </div>
            <div v-else>
              <p class="comment-content">{{ comment.content }}</p>
              <div v-if="isCommentAuthor(comment)" class="comment-actions">
                <button @click="startEditComment(comment)" class="btn-text">수정</button>
                <button @click="deleteComment(comment.id)" class="btn-text">삭제</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="back-btn">
        <button @click="goBack" class="btn btn-secondary">목록으로</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { postsAPI } from '../api/posts';
import { commentsAPI } from '../api/comments';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const post = ref(null);
const comments = ref([]);
const newComment = ref('');
const editingCommentId = ref(null);
const editCommentText = ref('');
const loading = ref(false);
const error = ref('');

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.currentUser);
const isAuthor = computed(() => post.value?.user_id === currentUser.value?.id);

const isCommentAuthor = (comment) => comment.user_id === currentUser.value?.id;

const fetchPost = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await postsAPI.getDetail(route.params.id);
    post.value = response.data;
  } catch (err) {
    error.value = '게시글을 불러오는데 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

const fetchComments = async () => {
  try {
    const response = await commentsAPI.getList(route.params.id);
    comments.value = response.data.comments;
  } catch (err) {
    console.error('Failed to fetch comments:', err);
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;

  try {
    await commentsAPI.create({
      postId: parseInt(route.params.id),
      content: newComment.value,
    });
    newComment.value = '';
    fetchComments();
  } catch (err) {
    alert('댓글 작성에 실패했습니다.');
  }
};

const startEditComment = (comment) => {
  editingCommentId.value = comment.id;
  editCommentText.value = comment.content;
};

const cancelEditComment = () => {
  editingCommentId.value = null;
  editCommentText.value = '';
};

const updateComment = async (commentId) => {
  try {
    await commentsAPI.update(commentId, { content: editCommentText.value });
    editingCommentId.value = null;
    editCommentText.value = '';
    fetchComments();
  } catch (err) {
    alert('댓글 수정에 실패했습니다.');
  }
};

const deleteComment = async (commentId) => {
  if (!confirm('댓글을 삭제하시겠습니까?')) return;

  try {
    await commentsAPI.delete(commentId);
    fetchComments();
  } catch (err) {
    alert('댓글 삭제에 실패했습니다.');
  }
};

const editPost = () => {
  router.push(`/posts/${route.params.id}/edit`);
};

const deletePost = async () => {
  if (!confirm('게시글을 삭제하시겠습니까?')) return;

  try {
    await postsAPI.delete(route.params.id);
    router.push('/posts');
  } catch (err) {
    alert('게시글 삭제에 실패했습니다.');
  }
};

const goBack = () => {
  router.push('/posts');
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR');
};

onMounted(() => {
  fetchPost();
  fetchComments();
});
</script>

<style scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
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

.post-header {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.post-header h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  gap: 1rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.post-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  white-space: pre-wrap;
  line-height: 1.8;
  margin-bottom: 1rem;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-edit {
  background: #3498db;
  color: white;
}

.btn-edit:hover {
  background: #2980b9;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}

.comments-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.comments-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.comment-form {
  margin-bottom: 2rem;
}

.comment-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-required {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 1rem;
}

.login-required a {
  color: #3498db;
  text-decoration: none;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-date {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.comment-content {
  margin-bottom: 0.5rem;
  white-space: pre-wrap;
}

.comment-actions {
  display: flex;
  gap: 1rem;
}

.btn-text {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.btn-text:hover {
  text-decoration: underline;
}

.comment-edit textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-family: inherit;
}

.comment-edit-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
  background: #3498db;
  color: white;
}

.btn-cancel {
  background: #95a5a6;
}

.back-btn {
  margin-top: 1rem;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}
</style>
