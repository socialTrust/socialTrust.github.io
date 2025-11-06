import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { postsAPI } from '../api/posts';

/**
 * Posts Store - 정적 게시글 캐싱
 *
 * 전략:
 * - 게시글은 불변 컨텐츠로 간주 (수정 시 새 URL)
 * - 메모리 캐싱으로 새로고침 없는 빠른 네비게이션
 * - 생성/수정/삭제 시에만 캐시 무효화
 */
export const usePostsStore = defineStore('posts', () => {
  // State
  const postsCache = ref(new Map()); // key: postId, value: post object
  const listCache = ref(new Map()); // key: "page:X", value: {posts, pagination}
  const searchCache = ref(new Map()); // key: "search:keyword:page", value: {posts, pagination}
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const getPostById = computed(() => (id) => {
    return postsCache.value.get(String(id));
  });

  const getListByPage = computed(() => (page) => {
    return listCache.value.get(`page:${page}`);
  });

  const getSearchResults = computed(() => (keyword, page) => {
    return searchCache.value.get(`search:${keyword}:${page}`);
  });

  // Actions

  /**
   * 게시글 리스트 가져오기 (캐시 우선)
   */
  const fetchPosts = async (page = 1, limit = 10, forceRefresh = false) => {
    const cacheKey = `page:${page}`;

    // 캐시 확인
    if (!forceRefresh && listCache.value.has(cacheKey)) {
      console.log(`[Cache Hit] Post list page ${page}`);
      return listCache.value.get(cacheKey);
    }

    // API 호출
    loading.value = true;
    error.value = null;

    try {
      console.log(`[Cache Miss] Fetching post list page ${page}`);
      const response = await postsAPI.getList(page, limit);
      const data = response.data;

      // 리스트 캐시 저장
      listCache.value.set(cacheKey, data);

      // 개별 게시글도 캐시에 저장
      data.posts.forEach(post => {
        postsCache.value.set(String(post.id), post);
      });

      return data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch posts';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 개별 게시글 가져오기 (캐시 우선)
   */
  const fetchPostById = async (id, forceRefresh = false) => {
    const postId = String(id);

    // 캐시 확인
    if (!forceRefresh && postsCache.value.has(postId)) {
      console.log(`[Cache Hit] Post ${postId}`);
      return postsCache.value.get(postId);
    }

    // API 호출
    loading.value = true;
    error.value = null;

    try {
      console.log(`[Cache Miss] Fetching post ${postId}`);
      const response = await postsAPI.getDetail(id);
      const post = response.data;

      // 캐시 저장
      postsCache.value.set(postId, post);

      return post;
    } catch (err) {
      error.value = err.message || 'Failed to fetch post';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 검색 (캐시 우선)
   */
  const searchPosts = async (keyword, page = 1, limit = 10, forceRefresh = false) => {
    const cacheKey = `search:${keyword}:${page}`;

    // 캐시 확인
    if (!forceRefresh && searchCache.value.has(cacheKey)) {
      console.log(`[Cache Hit] Search "${keyword}" page ${page}`);
      return searchCache.value.get(cacheKey);
    }

    // API 호출
    loading.value = true;
    error.value = null;

    try {
      console.log(`[Cache Miss] Searching "${keyword}" page ${page}`);
      const response = await postsAPI.search(keyword, page, limit);
      const data = response.data;

      // 검색 결과 캐시 저장
      searchCache.value.set(cacheKey, data);

      // 개별 게시글도 캐시에 저장
      data.posts.forEach(post => {
        postsCache.value.set(String(post.id), post);
      });

      return data;
    } catch (err) {
      error.value = err.message || 'Failed to search posts';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 생성
   */
  const createPost = async (postData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await postsAPI.create(postData);
      const newPost = response.data;

      // 생성 후 리스트 캐시 무효화 (새 게시글이 추가되므로)
      listCache.value.clear();
      searchCache.value.clear();

      // 새 게시글은 캐시에 저장
      postsCache.value.set(String(newPost.id), newPost);

      console.log('[Cache Invalidated] Post created, list cache cleared');
      return newPost;
    } catch (err) {
      error.value = err.message || 'Failed to create post';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 수정
   */
  const updatePost = async (id, postData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await postsAPI.update(id, postData);
      const updatedPost = response.data;

      // 수정된 게시글 캐시 갱신
      postsCache.value.set(String(id), updatedPost);

      // 리스트 캐시 무효화 (제목 등이 변경될 수 있음)
      listCache.value.clear();
      searchCache.value.clear();

      console.log(`[Cache Updated] Post ${id} updated, list cache cleared`);
      return updatedPost;
    } catch (err) {
      error.value = err.message || 'Failed to update post';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 삭제
   */
  const deletePost = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      await postsAPI.delete(id);

      // 삭제된 게시글 캐시에서 제거
      postsCache.value.delete(String(id));

      // 리스트 캐시 무효화
      listCache.value.clear();
      searchCache.value.clear();

      console.log(`[Cache Invalidated] Post ${id} deleted, all caches cleared`);
    } catch (err) {
      error.value = err.message || 'Failed to delete post';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 특정 게시글 조회수 증가 (캐시 업데이트)
   */
  const incrementViewCount = (id) => {
    const postId = String(id);
    const post = postsCache.value.get(postId);

    if (post) {
      post.views = (post.views || 0) + 1;
      postsCache.value.set(postId, { ...post });
    }
  };

  /**
   * 전체 캐시 초기화 (필요시)
   */
  const clearAllCache = () => {
    postsCache.value.clear();
    listCache.value.clear();
    searchCache.value.clear();
    console.log('[Cache Cleared] All caches cleared');
  };

  /**
   * 캐시 상태 확인 (디버깅용)
   */
  const getCacheStats = () => {
    return {
      postsCount: postsCache.value.size,
      listPagesCount: listCache.value.size,
      searchResultsCount: searchCache.value.size,
      totalCachedItems: postsCache.value.size + listCache.value.size + searchCache.value.size
    };
  };

  return {
    // State
    loading,
    error,

    // Getters
    getPostById,
    getListByPage,
    getSearchResults,

    // Actions
    fetchPosts,
    fetchPostById,
    searchPosts,
    createPost,
    updatePost,
    deletePost,
    incrementViewCount,
    clearAllCache,
    getCacheStats
  };
});
