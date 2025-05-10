const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardCtrl');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Dashboard routes
router.get('/stats', getDashboardStats);

module.exports = router;
