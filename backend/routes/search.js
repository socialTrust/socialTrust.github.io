const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// 게시글 검색
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!keyword.trim()) {
      return res.status(400).json({ message: '검색어를 입력하세요.' });
    }

    // 전체 검색 결과 수
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM posts
       WHERE title ILIKE $1 OR content ILIKE $1`,
      [`%${keyword}%`]
    );
    const totalPosts = parseInt(countResult.rows[0].count);

    // 검색 결과
    const result = await pool.query(
      `SELECT p.id, p.title, p.view_count, p.created_at,
              u.username, u.id as user_id,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.title ILIKE $1 OR p.content ILIKE $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${keyword}%`, limit, offset]
    );

    res.json({
      keyword,
      posts: result.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        limit,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
