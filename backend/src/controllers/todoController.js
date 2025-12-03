const Todo = require('../models/Todo');

// POST /api/todos
const createTodo = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const todo = await Todo.create({
      title,
      description,
      user: req.user._id,
    });

    return res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
};

// GET /api/todos
// Supports pagination via ?page=&limit=
const getTodos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [todos, total] = await Promise.all([
      Todo.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Todo.countDocuments({ user: req.user._id }),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      data: todos,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/todos/:id
const updateTodoStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be pending or completed' });
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { status },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    return res.json(todo);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/todos/:id
const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({ _id: id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTodo,
  getTodos,
  updateTodoStatus,
  deleteTodo,
};


