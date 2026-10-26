/* ============================================================
   Daily Task Manager — Vanilla JavaScript
   Modular, readable code with meaningful names.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Constants & State ---------- */
  const STORAGE_KEY = "daily-tasks";

  let tasks = [];               // array of task objects
  let currentFilter = "all";    // all | completed | pending
  let pendingDeleteId = null;    // id of task awaiting delete confirmation

  /* ---------- DOM References ---------- */
  const form = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const taskPriority = document.getElementById("task-priority");
  const taskCategory = document.getElementById("task-category");
  const taskDue = document.getElementById("task-due");
  const errorMessage = document.getElementById("error-message");

  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");

  const clearRow = document.getElementById("clear-row");
  const clearCompletedBtn = document.getElementById("clear-completed");

  const taskList = document.getElementById("task-list");
  const emptyState = document.getElementById("empty-state");
  const emptyMessage = document.getElementById("empty-message");

  const countTotal = document.getElementById("count-total");
  const countCompleted = document.getElementById("count-completed");
  const countPending = document.getElementById("count-pending");

  const confirmModal = document.getElementById("confirm-modal");
  const cancelDeleteBtn = document.getElementById("cancel-delete");
  const confirmDeleteBtn = document.getElementById("confirm-delete");

  /* ---------- Storage Helpers ---------- */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Failed to load tasks:", err);
      tasks = [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error("Failed to save tasks:", err);
    }
  }

  /* ---------- Utilities ---------- */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (err) {
      return dateStr;
    }
  }

  function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }

  /* ---------- CRUD Operations ---------- */
  function addTask(data) {
    const task = {
      id: generateId(),
      text: data.text,
      completed: false,
      priority: data.priority,
      category: data.category,
      dueDate: data.dueDate,
    };
    tasks.unshift(task);
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      render();
    }
  }

  function editTask(id, updates) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      Object.assign(task, updates);
      saveTasks();
      render();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    render();
  }

  /* ---------- Event Handlers ---------- */
  function handleSubmit(event) {
    event.preventDefault();
    const text = taskInput.value.trim();

    // Validation: prevent empty / whitespace-only tasks
    if (!text) {
      errorMessage.textContent = "Please enter a task — empty tasks are not allowed.";
      return;
    }
    errorMessage.textContent = "";

    addTask({
      text: text,
      priority: taskPriority.value,
      category: taskCategory.value,
      dueDate: taskDue.value,
    });

    // Reset form fields
    taskInput.value = "";
    taskDue.value = "";
    taskPriority.value = "medium";
    taskCategory.value = "personal";
    taskInput.focus();
  }

  function handleSearch() {
    render();
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.filter === filter)
    );
    render();
  }

  function requestDelete(id) {
    pendingDeleteId = id;
    confirmModal.hidden = false;
  }

  function closeConfirm() {
    pendingDeleteId = null;
    confirmModal.hidden = true;
  }

  function confirmDelete() {
    if (pendingDeleteId) deleteTask(pendingDeleteId);
    closeConfirm();
  }

  /* ---------- Rendering ---------- */
  function getFilteredTasks() {
    const query = searchInput.value.trim().toLowerCase();
    return tasks.filter((task) => {
      if (currentFilter === "completed" && !task.completed) return false;
      if (currentFilter === "pending" && task.completed) return false;
      if (query && !task.text.toLowerCase().includes(query)) return false;
      return true;
    });
  }

  function updateCounters() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    countTotal.textContent = total;
    countCompleted.textContent = completed;
    countPending.textContent = total - completed;

    clearRow.hidden = completed === 0;
  }

  function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " done" : "");
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement("div");
    checkbox.className = "task-checkbox" + (task.completed ? " checked" : "");
    checkbox.title = task.completed ? "Mark as pending" : "Mark as completed";
    checkbox.addEventListener("click", () => toggleTask(task.id));

    // Body
    const body = document.createElement("div");
    body.className = "task-body";

    const text = document.createElement("div");
    text.className = "task-text";
    text.textContent = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    meta.appendChild(makeBadge("badge-priority-" + task.priority, "⚑ " + capitalize(task.priority)));
    meta.appendChild(makeBadge("badge-category-" + task.category, "📂 " + capitalize(task.category)));
    if (task.dueDate) {
      meta.appendChild(makeBadge("badge-duedate", "📅 " + formatDate(task.dueDate)));
    }

    body.appendChild(text);
    body.appendChild(meta);

    // Actions
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn edit";
    editBtn.title = "Edit task";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => startEdit(li, task));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn delete";
    deleteBtn.title = "Delete task";
    deleteBtn.textContent = "🗑";
    deleteBtn.addEventListener("click", () => requestDelete(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(body);
    li.appendChild(actions);
    return li;
  }

  function makeBadge(className, label) {
    const span = document.createElement("span");
    span.className = "badge " + className;
    span.textContent = label;
    return span;
  }

  function startEdit(li, task) {
    li.innerHTML = "";

    const row = document.createElement("div");
    row.className = "edit-row";

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = task.text;

    const fields = document.createElement("div");
    fields.className = "edit-fields";

    const prioritySelect = document.createElement("select");
    ["low", "medium", "high"].forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = capitalize(p);
      if (p === task.priority) opt.selected = true;
      prioritySelect.appendChild(opt);
    });

    const categorySelect = document.createElement("select");
    ["study", "work", "personal", "other"].forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = capitalize(c);
      if (c === task.category) opt.selected = true;
      categorySelect.appendChild(opt);
    });

    const dueInput = document.createElement("input");
    dueInput.type = "date";
    dueInput.value = task.dueDate;

    fields.appendChild(prioritySelect);
    fields.appendChild(categorySelect);
    fields.appendChild(dueInput);

    const actions = document.createElement("div");
    actions.className = "edit-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-ghost";
    cancelBtn.textContent = "Cancel";

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-primary";
    saveBtn.textContent = "Save";

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);

    row.appendChild(textInput);
    row.appendChild(fields);
    row.appendChild(actions);
    li.appendChild(row);

    textInput.focus();

    const saveEdit = () => {
      const trimmed = textInput.value.trim();
      if (!trimmed) {
        textInput.focus();
        return;
      }
      editTask(task.id, {
        text: trimmed,
        priority: prioritySelect.value,
        category: categorySelect.value,
        dueDate: dueInput.value,
      });
    };

    saveBtn.addEventListener("click", saveEdit);
    cancelBtn.addEventListener("click", () => render());
    textInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEdit();
    });
  }

  function updateEmptyState(visibleTasks) {
    if (tasks.length === 0) {
      emptyState.hidden = false;
      taskList.innerHTML = "";
      emptyMessage.textContent = "No tasks yet. Add your first task above!";
      return;
    }
    if (visibleTasks.length === 0) {
      emptyState.hidden = false;
      taskList.innerHTML = "";
      const query = searchInput.value.trim();
      if (query) {
        emptyMessage.textContent = 'No tasks match your search.';
      } else if (currentFilter === "completed") {
        emptyMessage.textContent = "No completed tasks yet.";
      } else if (currentFilter === "pending") {
        emptyMessage.textContent = "No pending tasks. Nice work!";
      } else {
        emptyMessage.textContent = "No tasks yet. Add your first task above!";
      }
    } else {
      emptyState.hidden = true;
    }
  }

  function render() {
    const visibleTasks = getFilteredTasks();

    // Render list
    taskList.innerHTML = "";
    visibleTasks.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });

    updateCounters();
    updateEmptyState(visibleTasks);
  }

  /* ---------- Init ---------- */
  function init() {
    loadTasks();

    form.addEventListener("submit", handleSubmit);
    searchInput.addEventListener("input", handleSearch);
    filterButtons.forEach((btn) =>
      btn.addEventListener("click", () => setFilter(btn.dataset.filter))
    );
    clearCompletedBtn.addEventListener("click", clearCompleted);
    cancelDeleteBtn.addEventListener("click", closeConfirm);
    confirmDeleteBtn.addEventListener("click", confirmDelete);

    // Close modal when clicking the overlay
    confirmModal.addEventListener("click", (e) => {
      if (e.target === confirmModal) closeConfirm();
    });
    const today =
new Date();

document.getElementById("today-date").textContent =
today.toDateString();
const themeBtn=document.getElementById("theme-toggle");

themeBtn.onclick=()=>{

document.body.classList.toggle("dark");

};


    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
