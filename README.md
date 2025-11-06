# Social Trust Board

만 명 규모의 회원이 이용할 수 있는 소셜 트러스트 게시판 시스템입니다.

## 프로젝트 구조

```
socialTrust.github.io/
├── backend/          # Node.js + Express 백엔드 API
├── frontend/         # Vue.js 3 프론트엔드
└── database/         # PostgreSQL 스키마
```

## 기술 스택

### 백엔드
- Node.js + Express
- PostgreSQL
- JWT 인증
- bcryptjs (비밀번호 해싱)

### 프론트엔드
- Vue.js 3 (Composition API)
- Vue Router 4
- Pinia (상태 관리)
- Axios
- Vite

## 주요 기능

✅ **필수 기능**
- 회원가입/로그인 (JWT 기반 인증)
- 게시글 작성/수정/삭제 (CRUD)
- 댓글 작성/수정/삭제
- 게시글 검색
- 페이지네이션

🎯 **특징**
- RESTful API 설계
- 반응형 디자인
- 인증 미들웨어
- XSS 방지를 위한 입력 검증
- 조회수 카운팅
- 댓글 수 표시

## 설치 및 실행

### 1. 데이터베이스 설정

PostgreSQL을 설치하고 데이터베이스를 생성합니다:

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE socialtrust_board;

# 스키마 적용
\c socialtrust_board
\i database/schema.sql
```

### 2. 백엔드 설정

```bash
cd backend

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 데이터베이스 정보와 JWT 시크릿 설정

# 개발 서버 실행
npm run dev

# 또는 프로덕션 실행
npm start
```

**환경 변수 (.env)**
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=socialtrust_board
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:8080
```

### 3. 프론트엔드 설정

```bash
cd frontend

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env
# 필요시 백엔드 API URL 수정

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

**환경 변수 (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 게시글
- `GET /api/posts` - 게시글 목록 (페이지네이션)
- `GET /api/posts/:id` - 게시글 상세
- `POST /api/posts` - 게시글 작성 (인증 필요)
- `PUT /api/posts/:id` - 게시글 수정 (인증 필요)
- `DELETE /api/posts/:id` - 게시글 삭제 (인증 필요)

### 댓글
- `GET /api/comments/post/:postId` - 특정 게시글의 댓글 목록
- `POST /api/comments` - 댓글 작성 (인증 필요)
- `PUT /api/comments/:id` - 댓글 수정 (인증 필요)
- `DELETE /api/comments/:id` - 댓글 삭제 (인증 필요)

### 검색
- `GET /api/search?q=keyword` - 게시글 검색

## 배포

### 백엔드 배포 (Railway/Render 등)

1. Railway 또는 Render에 프로젝트 생성
2. PostgreSQL 데이터베이스 프로비저닝
3. 환경 변수 설정
4. backend 폴더를 배포

### 프론트엔드 배포 (GitHub Pages)

```bash
cd frontend
npm run build

# dist 폴더를 GitHub Pages 저장소에 배포
```

또는 Vercel, Netlify 등의 서비스 사용 가능

## 보안 고려사항

- 비밀번호는 bcrypt로 해싱하여 저장
- JWT 토큰으로 인증 관리
- SQL Injection 방지 (Parameterized Queries)
- CORS 설정으로 허용된 도메인만 접근 가능
- 입력 검증을 통한 XSS 방지

## 성능 최적화

- 데이터베이스 인덱스 설정
- 페이지네이션으로 대량 데이터 처리
- 커넥션 풀링 (최대 20개 연결)
- 조회수 증가 시 별도 쿼리로 성능 개선

## 라이선스

MIT

## 기여

이슈와 풀 리퀘스트는 언제나 환영합니다!