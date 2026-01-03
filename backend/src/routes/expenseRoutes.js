const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, expenseController.getAllExpenses);
router.post('/', authenticateToken, authorizeRoles('admin', 'account'), expenseController.createExpense);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), expenseController.deleteExpense);

module.exports = router;
