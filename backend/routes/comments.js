const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// 특정 게시글의 댓글 목록 조회
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at, c.updated_at,
              u.username, u.id as user_id
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.json({ comments: result.rows });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 댓글 작성 (인증 필요)
router.post(
  '/',
  authMiddleware,
  [
    body('postId').isInt().withMessage('유효한 게시글 ID가 필요합니다.'),
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('댓글은 1-1000자여야 합니다.'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { postId, content } = req.body;
      const userId = req.user.userId;

      // 게시글 존재 확인
      const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
      if (postCheck.rows.length === 0) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      }

      // 댓글 작성
      const result = await pool.query(
        `INSERT INTO comments (post_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, post_id, user_id, content, created_at`,
        [postId, userId, content]
      );

      res.status(201).json({
        message: '댓글이 작성되었습니다.',
        comment: result.rows[0],
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
);

// 댓글 수정 (인증 필요, 작성자만)
router.put(
  '/:id',
  authMiddleware,
  [body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('댓글은 1-1000자여야 합니다.')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.userId;

      // 댓글 소유자 확인
      const checkResult = await pool.query('SELECT user_id FROM comments WHERE id = $1', [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
      }

      if (checkResult.rows[0].user_id !== userId) {
        return res.status(403).json({ message: '수정 권한이 없습니다.' });
      }

      // 댓글 수정
      const result = await pool.query(
        'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
        [content, id]
      );

      res.json({
        message: '댓글이 수정되었습니다.',
        comment: result.rows[0],
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
);

// 댓글 삭제 (인증 필요, 작성자만)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 댓글 소유자 확인
    const checkResult = await pool.query('SELECT user_id FROM comments WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    // 댓글 삭제
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);

    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
