const express = require('express');
const { createTodo, getTodos, updateTodoStatus, deleteTodo } = require('../controllers/todoController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// All todo routes are protected
router.post('/', auth, createTodo);
router.get('/', auth, getTodos);
router.patch('/:id', auth, updateTodoStatus);
router.delete('/:id', auth, deleteTodo);

module.exports = router;


