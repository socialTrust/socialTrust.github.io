// Mock 사용자 데이터
export const mockUsers = [
  {
    id: 1,
    username: 'user1',
    email: 'user1@example.com',
  },
  {
    id: 2,
    username: 'user2',
    email: 'user2@example.com',
  },
];

// Mock 게시글 데이터
export const mockPosts = [
  {
    id: 1,
    user_id: 1,
    username: 'user1',
    title: '첫 번째 게시글입니다',
    content: '안녕하세요! 이것은 첫 번째 테스트 게시글입니다.\n여러 줄의 내용을 포함하고 있습니다.',
    view_count: 42,
    comment_count: 3,
    created_at: new Date('2024-01-15T10:30:00').toISOString(),
    updated_at: new Date('2024-01-15T10:30:00').toISOString(),
  },
  {
    id: 2,
    user_id: 2,
    username: 'user2',
    title: 'Vue.js 게시판 개발 후기',
    content: 'Vue.js로 게시판을 만들어봤습니다.\nComposition API가 정말 편리하네요!',
    view_count: 128,
    comment_count: 5,
    created_at: new Date('2024-01-16T14:20:00').toISOString(),
    updated_at: new Date('2024-01-16T14:20:00').toISOString(),
  },
  {
    id: 3,
    user_id: 1,
    username: 'user1',
    title: '프론트엔드 개발 팁 공유',
    content: '오늘 배운 프론트엔드 개발 팁을 공유합니다.\n1. 컴포넌트 재사용성\n2. 상태 관리\n3. 최적화',
    view_count: 89,
    comment_count: 2,
    created_at: new Date('2024-01-17T09:15:00').toISOString(),
    updated_at: new Date('2024-01-17T09:15:00').toISOString(),
  },
  {
    id: 4,
    user_id: 2,
    username: 'user2',
    title: 'PostgreSQL 성능 최적화',
    content: '데이터베이스 인덱스 설정으로 쿼리 성능을 10배 향상시켰습니다.',
    view_count: 234,
    comment_count: 8,
    created_at: new Date('2024-01-18T16:45:00').toISOString(),
    updated_at: new Date('2024-01-18T16:45:00').toISOString(),
  },
  {
    id: 5,
    user_id: 1,
    username: 'user1',
    title: 'REST API 설계 원칙',
    content: 'RESTful API를 설계할 때 지켜야 할 원칙들에 대해 정리했습니다.',
    view_count: 156,
    comment_count: 4,
    created_at: new Date('2024-01-19T11:00:00').toISOString(),
    updated_at: new Date('2024-01-19T11:00:00').toISOString(),
  },
];

// Mock 댓글 데이터
export const mockComments = {
  1: [
    {
      id: 1,
      post_id: 1,
      user_id: 2,
      username: 'user2',
      content: '좋은 글 감사합니다!',
      created_at: new Date('2024-01-15T11:00:00').toISOString(),
      updated_at: new Date('2024-01-15T11:00:00').toISOString(),
    },
    {
      id: 2,
      post_id: 1,
      user_id: 1,
      username: 'user1',
      content: '댓글 감사합니다~',
      created_at: new Date('2024-01-15T11:30:00').toISOString(),
      updated_at: new Date('2024-01-15T11:30:00').toISOString(),
    },
    {
      id: 3,
      post_id: 1,
      user_id: 2,
      username: 'user2',
      content: '많은 도움이 되었습니다!',
      created_at: new Date('2024-01-15T12:00:00').toISOString(),
      updated_at: new Date('2024-01-15T12:00:00').toISOString(),
    },
  ],
  2: [
    {
      id: 4,
      post_id: 2,
      user_id: 1,
      username: 'user1',
      content: 'Vue.js 정말 좋죠!',
      created_at: new Date('2024-01-16T15:00:00').toISOString(),
      updated_at: new Date('2024-01-16T15:00:00').toISOString(),
    },
    {
      id: 5,
      post_id: 2,
      user_id: 2,
      username: 'user2',
      content: 'Composition API 추천합니다',
      created_at: new Date('2024-01-16T15:30:00').toISOString(),
      updated_at: new Date('2024-01-16T15:30:00').toISOString(),
    },
  ],
};

// Mock 토큰
export const mockToken = 'mock-jwt-token-12345';

// Mock 현재 사용자
export const mockCurrentUser = mockUsers[0];
