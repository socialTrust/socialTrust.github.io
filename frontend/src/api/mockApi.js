import {
  mockUsers,
  mockPosts,
  mockComments,
  mockToken,
  mockCurrentUser,
} from './mockData';

// 네트워크 지연 시뮬레이션 (밀리초)
const DELAY = 500;

// Promise 기반 지연 함수
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 성공 응답 생성
const createResponse = (data) => ({
  data,
  status: 200,
  statusText: 'OK',
});

// 에러 응답 생성
const createError = (message, status = 400) => {
  const error = new Error(message);
  error.response = {
    data: { message },
    status,
    statusText: status === 400 ? 'Bad Request' : 'Error',
  };
  return error;
};

// Mock Auth API
export const mockAuthAPI = {
  async register(data) {
    await delay(DELAY);

    // 중복 체크
    const exists = mockUsers.find(
      (u) => u.username === data.username || u.email === data.email
    );

    if (exists) {
      throw createError('이미 사용 중인 사용자명 또는 이메일입니다.');
    }

    const newUser = {
      id: mockUsers.length + 1,
      username: data.username,
      email: data.email,
    };

    mockUsers.push(newUser);

    return createResponse({
      message: '회원가입이 완료되었습니다.',
      token: mockToken,
      user: newUser,
    });
  },

  async login(data) {
    await delay(DELAY);

    const user = mockUsers.find((u) => u.email === data.email);

    if (!user) {
      throw createError('이메일 또는 비밀번호가 잘못되었습니다.', 401);
    }

    return createResponse({
      message: '로그인 성공',
      token: mockToken,
      user,
    });
  },
};

// Mock Posts API
export const mockPostsAPI = {
  async getList(page = 1, limit = 20) {
    await delay(DELAY);

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = mockPosts.slice(start, end);

    return createResponse({
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(mockPosts.length / limit),
        totalPosts: mockPosts.length,
        limit,
      },
    });
  },

  async getDetail(id) {
    await delay(DELAY);

    const post = mockPosts.find((p) => p.id === parseInt(id));

    if (!post) {
      throw createError('게시글을 찾을 수 없습니다.', 404);
    }

    // 조회수 증가 시뮬레이션
    post.view_count += 1;

    return createResponse(post);
  },

  async create(data) {
    await delay(DELAY);

    const newPost = {
      id: mockPosts.length + 1,
      user_id: mockCurrentUser.id,
      username: mockCurrentUser.username,
      title: data.title,
      content: data.content,
      view_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockPosts.unshift(newPost);

    return createResponse({
      message: '게시글이 작성되었습니다.',
      post: newPost,
    });
  },

  async update(id, data) {
    await delay(DELAY);

    const postIndex = mockPosts.findIndex((p) => p.id === parseInt(id));

    if (postIndex === -1) {
      throw createError('게시글을 찾을 수 없습니다.', 404);
    }

    const post = mockPosts[postIndex];

    if (post.user_id !== mockCurrentUser.id) {
      throw createError('수정 권한이 없습니다.', 403);
    }

    post.title = data.title;
    post.content = data.content;
    post.updated_at = new Date().toISOString();

    mockPosts[postIndex] = post;

    return createResponse({
      message: '게시글이 수정되었습니다.',
      post,
    });
  },

  async delete(id) {
    await delay(DELAY);

    const postIndex = mockPosts.findIndex((p) => p.id === parseInt(id));

    if (postIndex === -1) {
      throw createError('게시글을 찾을 수 없습니다.', 404);
    }

    const post = mockPosts[postIndex];

    if (post.user_id !== mockCurrentUser.id) {
      throw createError('삭제 권한이 없습니다.', 403);
    }

    mockPosts.splice(postIndex, 1);

    // 해당 게시글의 댓글도 삭제
    delete mockComments[id];

    return createResponse({
      message: '게시글이 삭제되었습니다.',
    });
  },

  async search(keyword, page = 1, limit = 20) {
    await delay(DELAY);

    const filteredPosts = mockPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(keyword.toLowerCase()) ||
        p.content.toLowerCase().includes(keyword.toLowerCase())
    );

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = filteredPosts.slice(start, end);

    return createResponse({
      keyword,
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredPosts.length / limit),
        totalPosts: filteredPosts.length,
        limit,
      },
    });
  },
};

// Mock Comments API
export const mockCommentsAPI = {
  async getList(postId) {
    await delay(DELAY);

    const comments = mockComments[postId] || [];

    return createResponse({
      comments,
    });
  },

  async create(data) {
    await delay(DELAY);

    const postId = data.postId;

    if (!mockComments[postId]) {
      mockComments[postId] = [];
    }

    const newComment = {
      id: Date.now(), // 간단한 ID 생성
      post_id: postId,
      user_id: mockCurrentUser.id,
      username: mockCurrentUser.username,
      content: data.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockComments[postId].push(newComment);

    // 게시글의 댓글 수 증가
    const post = mockPosts.find((p) => p.id === postId);
    if (post) {
      post.comment_count += 1;
    }

    return createResponse({
      message: '댓글이 작성되었습니다.',
      comment: newComment,
    });
  },

  async update(id, data) {
    await delay(DELAY);

    let found = false;
    let updatedComment = null;

    for (const postId in mockComments) {
      const commentIndex = mockComments[postId].findIndex((c) => c.id === parseInt(id));

      if (commentIndex !== -1) {
        const comment = mockComments[postId][commentIndex];

        if (comment.user_id !== mockCurrentUser.id) {
          throw createError('수정 권한이 없습니다.', 403);
        }

        comment.content = data.content;
        comment.updated_at = new Date().toISOString();

        mockComments[postId][commentIndex] = comment;
        updatedComment = comment;
        found = true;
        break;
      }
    }

    if (!found) {
      throw createError('댓글을 찾을 수 없습니다.', 404);
    }

    return createResponse({
      message: '댓글이 수정되었습니다.',
      comment: updatedComment,
    });
  },

  async delete(id) {
    await delay(DELAY);

    let found = false;

    for (const postId in mockComments) {
      const commentIndex = mockComments[postId].findIndex((c) => c.id === parseInt(id));

      if (commentIndex !== -1) {
        const comment = mockComments[postId][commentIndex];

        if (comment.user_id !== mockCurrentUser.id) {
          throw createError('삭제 권한이 없습니다.', 403);
        }

        mockComments[postId].splice(commentIndex, 1);

        // 게시글의 댓글 수 감소
        const post = mockPosts.find((p) => p.id === parseInt(postId));
        if (post && post.comment_count > 0) {
          post.comment_count -= 1;
        }

        found = true;
        break;
      }
    }

    if (!found) {
      throw createError('댓글을 찾을 수 없습니다.', 404);
    }

    return createResponse({
      message: '댓글이 삭제되었습니다.',
    });
  },
};
