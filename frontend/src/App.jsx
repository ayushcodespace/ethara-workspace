import { useEffect, useMemo, useState } from 'react';
import api from './services/api';
import './App.css';
import Landing from './Landing';

const getAuthHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const initialTaskForm = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  project: '',
  assignedTo: '',
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );
  
  // Landing page state
  const [showLanding, setShowLanding] = useState(true);

  const [authMode, setAuthMode] = useState('login');
  const [authRole, setAuthRole] = useState('member');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [memberAssignment, setMemberAssignment] = useState({ projectId: '', memberId: '' });
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [dashboard, setDashboard] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2600);
  };

  const saveSession = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
  };

  const clearSession = () => {
    setToken('');
    setUser(null);
    setTasks([]);
    setProjects([]);
    setMembers([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Send user back to landing page on logout
    setShowLanding(true); 
  };

  const fetchTasks = async (currentToken) => {
    setIsLoadingTasks(true);
    setTaskError('');
    try {
      const response = await api.get('/tasks', getAuthHeaders(currentToken));
      setTasks(response.data);
    } catch (error) {
      setTaskError(error?.response?.data?.message || 'Unable to fetch tasks right now.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchProjects = async (currentToken) => {
    try {
      const response = await api.get('/projects', getAuthHeaders(currentToken));
      setProjects(response.data);
      setMemberAssignment((prev) => ({
        ...prev,
        projectId: prev.projectId || response.data?.[0]?._id || '',
      }));
      setTaskForm((prev) => ({
        ...prev,
        project: prev.project || response.data?.[0]?._id || '',
      }));
    } catch (error) {
      showToast(error?.response?.data?.message || 'Could not fetch projects.', 'error');
    }
  };

  const fetchMembers = async (currentToken) => {
    if (user?.role !== 'admin') return;
    try {
      const response = await api.get('/users/members', getAuthHeaders(currentToken));
      setMembers(response.data);
      setMemberAssignment((prev) => ({
        ...prev,
        memberId: prev.memberId || response.data?.[0]?._id || '',
      }));
      setTaskForm((prev) => ({
        ...prev,
        assignedTo: prev.assignedTo || response.data?.[0]?._id || '',
      }));
    } catch (error) {
      showToast(error?.response?.data?.message || 'Could not fetch members.', 'error');
    }
  };

  const fetchDashboard = async (currentToken) => {
    try {
      const response = await api.get('/dashboard/summary', getAuthHeaders(currentToken));
      setDashboard(response.data);
    } catch (error) {
      showToast(error?.response?.data?.message || 'Could not fetch dashboard.', 'error');
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchTasks(token);
    fetchProjects(token);
    fetchMembers(token);
    fetchDashboard(token);
  }, [token, user?.role]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const statusMatch = statusFilter === 'all' ? true : task.status === statusFilter;
      return titleMatch && statusMatch;
    });
  }, [tasks, searchTerm, statusFilter]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');

    if (
      !authEmail.trim() ||
      !authPassword.trim() ||
      (authMode === 'register' && !authName.trim())
    ) {
      setAuthError('Please fill all required fields.');
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint =
        authMode === 'register' ? '/auth/register' : `/auth/login/${authRole}`;
      const payload =
        authMode === 'register'
          ? {
              name: authName.trim(),
              email: authEmail.trim(),
              password: authPassword,
              role: authRole,
            }
          : { email: authEmail.trim(), password: authPassword };

      const response = await api.post(endpoint, payload);
      saveSession(response.data);
      setAuthName('');
      setAuthEmail('');
      setAuthPassword('');
      showToast(authMode === 'register' ? 'Account created successfully.' : 'Logged in successfully.');
    } catch (error) {
      setAuthError(error?.response?.data?.message || 'Authentication failed.');
      showToast('Authentication failed.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    if (!projectForm.name.trim()) {
      showToast('Project name is required.', 'error');
      return;
    }
    setIsCreatingProject(true);
    try {
      const response = await api.post(
        '/projects',
        { name: projectForm.name.trim(), description: projectForm.description.trim() },
        getAuthHeaders(token)
      );
      setProjects((prev) => [response.data, ...prev]);
      setProjectForm({ name: '', description: '' });
      setTaskForm((prev) => ({ ...prev, project: response.data._id }));
      showToast('Project created.');
    } catch (error) {
      showToast(error?.response?.data?.message || 'Could not create project.', 'error');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleAddMemberToProject = async (event) => {
    event.preventDefault();
    if (!memberAssignment.projectId || !memberAssignment.memberId) {
      showToast('Choose both project and member.', 'error');
      return;
    }

    setIsAddingMember(true);
    try {
      const response = await api.post(
        `/projects/${memberAssignment.projectId}/members`,
        { memberId: memberAssignment.memberId },
        getAuthHeaders(token)
      );
      setProjects((prev) =>
        prev.map((project) => (project._id === response.data._id ? response.data : project))
      );
      showToast('Member added to project.');
    } catch (error) {
      showToast(error?.response?.data?.message || 'Could not add member to project.', 'error');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleTaskCreate = async (event) => {
    event.preventDefault();
    setTaskError('');

    if (!taskForm.title.trim()) {
      setTaskError('Task title is required.');
      showToast('Task title is required.', 'error');
      return;
    }

    if (user?.role === 'admin' && (!taskForm.project || !taskForm.assignedTo)) {
      setTaskError('Project and assignee are required for admin task creation.');
      showToast('Select project and assignee first.', 'error');
      return;
    }

    setIsSubmittingTask(true);
    try {
      const payload =
        user?.role === 'admin'
          ? {
              title: taskForm.title.trim(),
              description: taskForm.description.trim(),
              priority: taskForm.priority,
              dueDate: taskForm.dueDate || undefined,
              project: taskForm.project,
              assignedTo: taskForm.assignedTo,
              status: 'pending',
            }
          : {
              title: taskForm.title.trim(),
              description: taskForm.description.trim(),
              priority: taskForm.priority,
              dueDate: taskForm.dueDate || undefined,
            };

      const response = await api.post('/tasks', payload, getAuthHeaders(token));
      setTasks((prev) => [response.data, ...prev]);
      setTaskForm(initialTaskForm);
      fetchDashboard(token);
      showToast('Task created.');
    } catch (error) {
      setTaskError(error?.response?.data?.message || 'Could not create task.');
      showToast('Could not create task.', 'error');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const response = await api.put(
        `/tasks/${task._id}`,
        { status: nextStatus },
        getAuthHeaders(token)
      );
      setTasks((prev) => prev.map((item) => (item._id === task._id ? response.data : item)));
      fetchDashboard(token);
      showToast(`Task marked as ${nextStatus}.`);
    } catch (error) {
      showToast(error?.response?.data?.message || 'Status update failed.', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`, getAuthHeaders(token));
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      fetchDashboard(token);
      showToast('Task deleted.');
    } catch (error) {
      showToast(error?.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  if (!token) {
    if (showLanding) {
      return <Landing onGetStarted={() => setShowLanding(false)} />;
    }

    return (
      <main className="app-shell">
        <section className="auth-card">
          <p className="eyebrow">Ethara Workspace</p>
          <h1>{authMode === 'register' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="subtitle">A premium workspace for role-based team productivity.</p>

          <div className="auth-switch">
            <button
              type="button"
              className={authMode === 'login' ? 'switch-btn active' : 'switch-btn'}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'switch-btn active' : 'switch-btn'}
              onClick={() => setAuthMode('register')}
            >
              Signup
            </button>
          </div>

          <form className="form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <>
                <label className="field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={authName}
                    onChange={(event) => setAuthName(event.target.value)}
                    placeholder="Your full name"
                    disabled={authLoading}
                  />
                </label>
                <label className="field">
                  <span>Account role</span>
                  <select
                    value={authRole}
                    onChange={(event) => setAuthRole(event.target.value)}
                    disabled={authLoading}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </>
            )}

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                placeholder="you@company.com"
                disabled={authLoading}
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                disabled={authLoading}
              />
            </label>

            {authMode === 'login' && (
              <label className="field">
                <span>Login as</span>
                <select
                  value={authRole}
                  onChange={(event) => setAuthRole(event.target.value)}
                  disabled={authLoading}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}

            <button className="primary-btn" type="submit" disabled={authLoading}>
              {authLoading ? 'Please wait...' : authMode === 'register' ? 'Create Account' : 'Login'}
            </button>
            {authError && <p className="inline-error">{authError}</p>}
          </form>

          <button 
            className="ghost-btn" 
            style={{ width: '100%', marginTop: '16px' }} 
            onClick={() => setShowLanding(true)}
          >
            &larr; Back to Home
          </button>
        </section>
        {toast && <Toast toast={toast} />}
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Private Workspace</p>
            <h1>
              {user?.name ? `${user.name}'s ${user?.role === 'admin' ? 'Admin' : 'Member'} Board` : 'Task Board'}
            </h1>
            <p className="subtitle">Plan clearly. Execute confidently.</p>
          </div>
          <button className="ghost-btn" type="button" onClick={clearSession}>
            Logout
          </button>
        </header>

        <section className="stats-grid">
          <StatCard label="Total Tasks" value={dashboard.total} />
          <StatCard label="Completed" value={dashboard.completed} />
          <StatCard label="Pending" value={dashboard.pending} />
          <StatCard label="Overdue" value={dashboard.overdue} />
        </section>

        {user?.role === 'admin' && (
          <section className="panel">
            <h2>Create project</h2>
            <form className="form task-form" onSubmit={handleCreateProject}>
              <label className="field">
                <span>Project name</span>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Q3 Product Launch"
                  disabled={isCreatingProject}
                />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Goals, timelines, and stakeholders..."
                  disabled={isCreatingProject}
                />
              </label>
              <button className="primary-btn" type="submit" disabled={isCreatingProject}>
                {isCreatingProject ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </section>
        )}

        {user?.role === 'admin' && (
          <section className="panel">
            <h2>Team and project access</h2>
            <form className="form task-form" onSubmit={handleAddMemberToProject}>
              <label className="field">
                <span>Select project</span>
                <select
                  value={memberAssignment.projectId}
                  onChange={(event) =>
                    setMemberAssignment((prev) => ({ ...prev, projectId: event.target.value }))
                  }
                  disabled={isAddingMember}
                >
                  <option value="">Choose project</option>
                  <option value="test_id_123">Project Alpha</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Select member</span>
                <select
                  value={memberAssignment.memberId}
                  onChange={(event) =>
                    setMemberAssignment((prev) => ({ ...prev, memberId: event.target.value }))
                  }
                  disabled={isAddingMember}
                >
                  <option value="">Choose member</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </label>
              <button className="primary-btn" type="submit" disabled={isAddingMember}>
                {isAddingMember ? 'Adding...' : 'Add Member To Project'}
              </button>
            </form>

            <div className="project-list">
              {projects.map((project) => (
                <div className="project-item" key={project._id}>
                  <h3>{project.name}</h3>
                  <p>{project.description || 'No project description.'}</p>
                  <div className="chips-wrap">
                    {(project.members || []).length === 0 ? (
                      <span className="meta-chip">No members yet</span>
                    ) : (
                      project.members.map((member) => (
                        <span key={member._id} className="meta-chip">
                          {member.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {user?.role === 'admin' && (
          <section className="panel">
            <h2>Create and assign task</h2>
            <form className="form task-form" onSubmit={handleTaskCreate}>
            <label className="field">
              <span>Title</span>
              <input
                type="text"
                value={taskForm.title}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Define a clear task title"
                disabled={isSubmittingTask}
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                value={taskForm.description}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Add delivery details, notes, and ownership context..."
                disabled={isSubmittingTask}
              />
            </label>
            <label className="field">
              <span>Priority</span>
              <select
                value={taskForm.priority}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, priority: event.target.value }))}
                disabled={isSubmittingTask}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="field">
              <span>Due date</span>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                disabled={isSubmittingTask}
              />
            </label>
            {user?.role === 'admin' && (
              <>
                <label className="field">
                  <span>Project</span>
                  <select
                    value={taskForm.project}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, project: event.target.value }))
                    }
                    disabled={isSubmittingTask}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Assign to member</span>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, assignedTo: event.target.value }))
                    }
                    disabled={isSubmittingTask}
                  >
                    <option value="">Select a member</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <button className="primary-btn" type="submit" disabled={isSubmittingTask}>
              {isSubmittingTask ? 'Saving...' : 'Add Task'}
            </button>
            {taskError && <p className="inline-error">{taskError}</p>}
            </form>
          </section>
        )}

        <section className="panel">
          <div className="task-toolbar">
            <h2>Task list</h2>
            <div className="filters">
              <input
                type="search"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <div className="status-toggle">
                <button
                  type="button"
                  className={statusFilter === 'all' ? 'toggle-btn active' : 'toggle-btn'}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={statusFilter === 'pending' ? 'toggle-btn active' : 'toggle-btn'}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={statusFilter === 'completed' ? 'toggle-btn active' : 'toggle-btn'}
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {isLoadingTasks ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <p>Fetching your tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">[]</div>
              <h3>No tasks found</h3>
              <p>Try adjusting filters or create your next priority task.</p>
            </div>
          ) : (
            <div className="task-grid">
              {filteredTasks.map((task) => (
                <article className="task-card" key={task._id}>
                  <div className="task-head">
                    <h3>{task.title}</h3>
                    <span className={`status-pill ${task.status === 'completed' ? 'done' : 'todo'}`}>
                      {task.status}
                    </span>
                  </div>
                  <p>{task.description || 'No description provided.'}</p>
                  <div className="task-foot">
                    <span className={`priority-tag ${task.priority || 'medium'}`}>
                      {(task.priority || 'medium').toUpperCase()}
                    </span>
                    <span className="meta-chip">{task.project?.name || 'No Project'}</span>
                    <div className="actions">
                      <button type="button" className="small-btn" onClick={() => handleToggleStatus(task)}>
                        {task.status === 'completed' ? 'Mark Pending' : 'Mark Done'}
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          className="small-btn danger"
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      {toast && <Toast toast={toast} />}
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function Toast({ toast }) {
  return <div className={`toast ${toast.type === 'error' ? 'error' : 'success'}`}>{toast.message}</div>;
}

export default App;