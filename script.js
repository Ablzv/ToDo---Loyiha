/**
 * Uyga Vazifa: Todo - Modern Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const todoApp = document.getElementById('todoApp');
  const taskList = document.getElementById('taskList');
  const addTaskForm = document.getElementById('addTaskForm');
  const newTaskInput = document.getElementById('newTaskInput');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const quickTags = document.getElementById('quickTags');
  const emptyState = document.getElementById('emptyState');

  // Stats Elements
  const totalCountEl = document.getElementById('totalCount');
  const pendingCountEl = document.getElementById('pendingCount');
  const completedCountEl = document.getElementById('completedCount');
  const tabBadgeAll = document.getElementById('tabBadgeAll');
  const tabBadgePending = document.getElementById('tabBadgePending');
  const tabBadgeCompleted = document.getElementById('tabBadgeCompleted');
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');

  // Storage Keys
  const STORAGE_KEY = 'uyga_vazifa_tasks';
  const THEME_KEY = 'uyga_vazifa_theme';

  // State
  let currentFilter = 'all'; // 'all' | 'pending' | 'completed'
  let searchQuery = '';

  // Initial Sample Tasks (matching the user's reference)
  const defaultTasks = [
    { id: '1', text: 'Ona tili', completed: true, createdAt: '10:00' },
    { id: '2', text: 'Matematika, ona tili, adabiyot, kimyo, fizika, huquq, tarix', completed: true, createdAt: '10:15' },
    { id: '3', text: 'Adabiyot', completed: true, createdAt: '11:30' },
    { id: '4', text: 'Matematika', completed: true, createdAt: '12:00' },
    { id: '5', text: 'Fizika va Ingliz tili mavzularini takrorlash', completed: false, createdAt: '14:20' }
  ];

  // Load Tasks from LocalStorage or initialize with defaults
  let tasks = loadTasks();

  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading tasks from localStorage', e);
    }
    return defaultTasks;
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage', e);
    }
  }

  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(THEME_KEY, 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(THEME_KEY, 'dark');
    }
  }

  themeToggleBtn.addEventListener('click', toggleTheme);
  initTheme();

  // Format Current Time
  function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Update Stats & Progress Bar
  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalCountEl.textContent = total;
    pendingCountEl.textContent = pending;
    completedCountEl.textContent = completed;

    tabBadgeAll.textContent = total;
    tabBadgePending.textContent = pending;
    tabBadgeCompleted.textContent = completed;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressBar.style.width = `${percent}%`;
    progressPercentage.textContent = `${percent}%`;

    // Disable clear completed if none
    clearCompletedBtn.style.opacity = completed > 0 ? '1' : '0.4';
    clearCompletedBtn.style.pointerEvents = completed > 0 ? 'auto' : 'none';
  }

  // Render Tasks
  function renderTasks() {
    taskList.innerHTML = '';

    // Filter by tab
    let filtered = tasks.filter(task => {
      if (currentFilter === 'pending') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    });

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(task => task.text.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      emptyState.style.display = 'flex';
      taskList.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      taskList.style.display = 'flex';

      filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
          <div class="task-left">
            <label class="custom-checkbox" title="${task.completed ? 'Bajarilmagan deb belgilash' : 'Bajarilgan deb belgilash'}">
              <input type="checkbox" ${task.completed ? 'checked' : ''} data-action="toggle">
              <span class="checkmark">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </label>
            <div class="task-content">
              <span class="task-text" title="Tahrirlash uchun ikki marta bosing">${escapeHtml(task.text)}</span>
              <span class="task-time">${task.createdAt || 'Yangi'}</span>
            </div>
          </div>
          <div class="task-actions">
            <button class="btn-delete" data-action="delete" title="O'chirish">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>O'chirish</span>
            </button>
          </div>
        `;

        taskList.appendChild(li);
      });
    }

    updateStats();
  }

  // Security Helper: escape HTML
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Add Task
  addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = newTaskInput.value.trim();
    if (!text) return;

    const newTask = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: getCurrentTime()
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();

    newTaskInput.value = '';
    newTaskInput.focus();
  });

  // Quick Subject Chips
  quickTags.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const subject = chip.dataset.subject;
    if (newTaskInput.value) {
      newTaskInput.value += `, ${subject}`;
    } else {
      newTaskInput.value = `${subject}: `;
    }
    newTaskInput.focus();
  });

  // Task List Delegation (Toggle & Delete & Edit)
  taskList.addEventListener('click', (e) => {
    const item = e.target.closest('.task-item');
    if (!item) return;
    const taskId = item.dataset.id;
    const action = e.target.dataset.action || e.target.closest('[data-action]')?.dataset.action;

    // Toggle Task
    if (action === 'toggle' || e.target.matches('input[type="checkbox"]')) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
      }
      return;
    }

    // Delete Task
    if (action === 'delete') {
      item.style.transform = 'scale(0.9) translateX(20px)';
      item.style.opacity = '0';
      item.style.transition = 'all 0.25s ease-out';

      setTimeout(() => {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
      }, 250);
      return;
    }
  });

  // Inline Edit on Double Click
  taskList.addEventListener('dblclick', (e) => {
    const textEl = e.target.closest('.task-text');
    if (!textEl) return;
    const item = textEl.closest('.task-item');
    const taskId = item.dataset.id;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentText = task.text;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = currentText;

    textEl.replaceWith(input);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    function finishEdit() {
      const val = input.value.trim();
      if (val) {
        task.text = val;
        saveTasks();
      }
      renderTasks();
    }

    input.addEventListener('blur', finishEdit);
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        input.blur();
      } else if (ev.key === 'Escape') {
        renderTasks();
      }
    });
  });

  // Filter Tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderTasks();
    });
  });

  // Search Input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.style.display = searchQuery.length > 0 ? 'flex' : 'none';
    renderTasks();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    renderTasks();
  });

  // Clear Completed Tasks
  clearCompletedBtn.addEventListener('click', () => {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) return;

    if (confirm("Barcha bajarilgan vazifalarni o'chirmoqchimisiz?")) {
      tasks = tasks.filter(t => !t.completed);
      saveTasks();
      renderTasks();
    }
  });

  // Initial render
  renderTasks();
});
