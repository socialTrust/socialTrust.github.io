const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// 게시글 목록 조회 (페이지네이션)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // 전체 게시글 수
    const countResult = await pool.query('SELECT COUNT(*) FROM posts');
    const totalPosts = parseInt(countResult.rows[0].count);

    // 게시글 목록
    const result = await pool.query(
      `SELECT p.id, p.title, p.view_count, p.created_at,
              u.username, u.id as user_id,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      posts: result.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        limit,
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 조회수 증가
    await pool.query('UPDATE posts SET view_count = view_count + 1 WHERE id = $1', [id]);

    // 게시글 조회
    const result = await pool.query(
      `SELECT p.id, p.title, p.content, p.view_count, p.created_at, p.updated_at,
              u.username, u.id as user_id
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 작성 (인증 필요)
router.post(
  '/',
  authMiddleware,
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('제목은 1-200자여야 합니다.'),
    body('content').trim().isLength({ min: 1 }).withMessage('내용을 입력하세요.'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content } = req.body;
      const userId = req.user.userId;

      const result = await pool.query(
        'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
        [userId, title, content]
      );

      res.status(201).json({
        message: '게시글이 작성되었습니다.',
        post: result.rows[0],
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
);

// 게시글 수정 (인증 필요, 작성자만)
router.put(
  '/:id',
  authMiddleware,
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('제목은 1-200자여야 합니다.'),
    body('content').trim().isLength({ min: 1 }).withMessage('내용을 입력하세요.'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user.userId;

      // 게시글 소유자 확인
      const checkResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      }

      if (checkResult.rows[0].user_id !== userId) {
        return res.status(403).json({ message: '수정 권한이 없습니다.' });
      }

      // 게시글 수정
      const result = await pool.query(
        'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *',
        [title, content, id]
      );

      res.json({
        message: '게시글이 수정되었습니다.',
        post: result.rows[0],
      });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
);

// 게시글 삭제 (인증 필요, 작성자만)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 게시글 소유자 확인
    const checkResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    // 게시글 삭제 (CASCADE로 댓글도 자동 삭제)
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
