const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const router = express.Router();

// 회원가입
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('사용자명은 3-50자여야 합니다.'),
    body('email').isEmail().withMessage('유효한 이메일을 입력하세요.'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다.'),
  ],
  async (req, res) => {
    try {
      // 유효성 검사
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // 중복 확인
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: '이미 사용 중인 사용자명 또는 이메일입니다.' });
      }

      // 비밀번호 해시화
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 사용자 생성
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, passwordHash]
      );

      const user = result.rows[0];

      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: '회원가입이 완료되었습니다.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
);

// 로그인
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력하세요.'),
    body('password').notEmpty().withMessage('비밀번호를 입력하세요.'),
  ],
  async (req, res) => {
    try {
      // 유효성 검사
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // 사용자 찾기
      const result = await pool.query(
        'SELECT id, username, email, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
      }

      const user = result.rows[0];

      // 비밀번호 확인
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        message: '로그인 성공',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
);

module.exports = router;
