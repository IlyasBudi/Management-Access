// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/login', AuthController.login);
router.post('/select-role', AuthController.selectRole);
router.get('/profile', authMiddleware, AuthController.profile);
router.post('/refresh-token', authMiddleware, AuthController.refreshToken);
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;
