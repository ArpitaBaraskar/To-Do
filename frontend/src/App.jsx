import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';

const API_BASE_URL = 'http://localhost:5000'; // backend base URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [todoForm, setTodoForm] = useState({ title: '', description: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        mode === 'register'
          ? {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
            }
          : {
              email: authForm.email,
              password: authForm.password,
            };

      const res = await api.post(endpoint, payload);
      const { token, user: userData } = res.data;

      localStorage.setItem('token', token);
      setUser(userData);
      setAuthForm({ name: '', email: '', password: '' });
      await fetchTodos(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/auth/user/profile');
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodos = async (pageToLoad = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/todos?page=${pageToLoad}&limit=10`);
      setTodos(res.data.data);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleTodoChange = (e) => {
    const { name, value } = e.target;
    setTodoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/todos', todoForm);
      setTodoForm({ title: '', description: '' });
      await fetchTodos(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create todo');
    }
  };

  const handleToggleStatus = async (todo) => {
    try {
      const newStatus = todo.status === 'pending' ? 'completed' : 'pending';
      await api.patch(`/api/todos/${todo._id}`, { status: newStatus });
      await fetchTodos(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await api.delete(`/api/todos/${id}`);
      await fetchTodos(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete todo');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTodos([]);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
      fetchTodos(1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo Manager</h1>
        {isLoggedIn && user && (
          <div className="user-info">
            <span>
              {user.name} ({user.email})
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {!isLoggedIn ? (
          <div className="auth-card">
            <div className="auth-toggle">
              <button
                className={mode === 'login' ? 'active' : ''}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                className={mode === 'register' ? 'active' : ''}
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {mode === 'register' && (
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={authForm.name}
                    onChange={handleAuthChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={authForm.email}
                  onChange={handleAuthChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  required
                />
              </div>

              {error && <div className="error">{error}</div>}

              <button type="submit" className="btn btn-primary">
                {mode === 'register' ? 'Register' : 'Login'}
              </button>
            </form>
          </div>
        ) : (
          <div className="todo-layout">
            <section className="todo-create">
              <h2>Create Todo</h2>
              <form onSubmit={handleCreateTodo}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={todoForm.title}
                    onChange={handleTodoChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description (optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={todoForm.description}
                    onChange={handleTodoChange}
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <button type="submit" className="btn btn-primary">
                  Add Todo
                </button>
              </form>
            </section>

            <section className="todo-list-section">
              <div className="todo-list-header">
                <h2>Your Todos</h2>
                {loading && <span className="loading">Loading...</span>}
              </div>

              {todos.length === 0 && !loading ? (
                <p>No todos yet. Create your first one!</p>
              ) : (
                <ul className="todo-list">
                  {todos.map((todo) => (
                    <li key={todo._id} className={`todo-item ${todo.status}`}>
                      <div>
                        <h3>{todo.title}</h3>
                        {todo.description && <p>{todo.description}</p>}
                        <span className={`status badge ${todo.status}`}>
                          {todo.status}
                        </span>
                      </div>
                      <div className="todo-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleToggleStatus(todo)}
                        >
                          Mark {todo.status === 'pending' ? 'Completed' : 'Pending'}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteTodo(todo._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  disabled={page <= 1}
                  onClick={() => fetchTodos(page - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => fetchTodos(page + 1)}
                >
                  Next
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;


