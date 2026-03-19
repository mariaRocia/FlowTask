(function () {
  const statusConfig = {
    total: { label: "Total de tarefas", icon: "assignment", cardClass: "total" },
    completed: { label: "Concluidas", icon: "task_alt", cardClass: "done" },
    progress: { label: "Em andamento", icon: "hourglass_top", cardClass: "in-progress" },
    todo: { label: "A fazer", icon: "pending_actions", cardClass: "todo" }
  };

  const dom = {};

  document.addEventListener("DOMContentLoaded", function () {
    cacheDom();
    initMaterialize();
    bindEvents();
    renderAll();
  });

  function cacheDom() {
    dom.dashboardCards = document.getElementById("dashboard-cards");
    dom.usersList = document.getElementById("users-list");
    dom.usersCountChip = document.getElementById("users-count-chip");
    dom.tasksTableBody = document.getElementById("tasks-table-body");
    dom.emptyState = document.getElementById("empty-state");
    dom.userForm = document.getElementById("user-form");
    dom.taskForm = document.getElementById("task-form");
    dom.modalTaskForm = document.getElementById("modal-task-form");
    dom.taskResetButton = document.getElementById("task-reset-button");
    dom.filterPriority = document.getElementById("filter-priority");
    dom.filterUser = document.getElementById("filter-user");
    dom.filterStatus = document.getElementById("filter-status");
    dom.heroTotal = document.getElementById("hero-total");
    dom.heroTeam = document.getElementById("hero-team");
    dom.heroProgress = document.getElementById("hero-progress");
    dom.taskUserSelect = document.getElementById("task-user");
    dom.modalTaskUserSelect = document.getElementById("modal-task-user");
  }

  function initMaterialize() {
    M.AutoInit();
    M.updateTextFields();
  }

  function bindEvents() {
    dom.userForm.addEventListener("submit", handleUserSubmit);
    dom.taskForm.addEventListener("submit", function (event) {
      handleTaskSubmit(event, dom.taskForm, false);
    });
    dom.modalTaskForm.addEventListener("submit", function (event) {
      handleTaskSubmit(event, dom.modalTaskForm, true);
    });
    dom.taskResetButton.addEventListener("click", function () {
      window.setTimeout(function () {
        resetForm(dom.taskForm);
      }, 0);
    });

    [dom.filterPriority, dom.filterUser, dom.filterStatus].forEach(function (select) {
      select.addEventListener("change", renderTasksTable);
    });

    dom.tasksTableBody.addEventListener("click", handleTaskActions);
  }

  function handleUserSubmit(event) {
    event.preventDefault();
    const formData = new FormData(dom.userForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      role: String(formData.get("role") || "").trim()
    };

    if (!payload.name || !payload.email || !payload.role) {
      showToast("Preencha todos os campos do usuario.");
      return;
    }

    if (!isValidEmail(payload.email)) {
      showToast("Informe um email valido.");
      return;
    }

    FlowTaskUsers.createUser(payload);
    resetForm(dom.userForm);
    renderAll();
    showToast("Usuario salvo com sucesso.");
  }

  function handleTaskSubmit(event, form, closeModalAfterSave) {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      priority: String(formData.get("priority") || "").trim(),
      deadline: String(formData.get("deadline") || "").trim(),
      responsibleId: String(formData.get("responsibleId") || "").trim()
    };

    if (!payload.title || !payload.description || !payload.priority || !payload.deadline || !payload.responsibleId) {
      showToast("Preencha todos os campos obrigatorios da tarefa.");
      return;
    }

    FlowTaskTasks.createTask(payload);
    resetForm(form);
    renderAll();
    showToast("Tarefa criada com sucesso.");

    if (closeModalAfterSave) {
      const modal = M.Modal.getInstance(document.getElementById("modal-task"));
      if (modal) {
        modal.close();
      }
    }
  }

  function handleTaskActions(event) {
    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) {
      return;
    }

    const taskId = actionButton.getAttribute("data-task-id");
    const action = actionButton.getAttribute("data-action");

    if (action === "advance-status") {
      FlowTaskTasks.advanceTaskStatus(taskId);
      renderAll();
      showToast("Status da tarefa atualizado.");
    }

    if (action === "delete-task") {
      FlowTaskTasks.deleteTask(taskId);
      renderAll();
      showToast("Tarefa removida.");
    }
  }

  function renderAll() {
    renderUserOptions();
    renderUsersList();
    renderDashboard();
    renderTasksTable();
    renderHeroMetrics();
    reinitializeSelects();
  }

  function renderUsersList() {
    const users = FlowTaskUsers.getUsers();
    dom.usersCountChip.textContent = users.length + " usuarios";

    if (!users.length) {
      dom.usersList.innerHTML = '<div class="collection-item">Nenhum usuario cadastrado.</div>';
      return;
    }

    dom.usersList.innerHTML = users
      .map(function (user) {
        return (
          '<div class="collection-item">' +
          '<div class="user-meta">' +
          "<strong>" + escapeHtml(user.name) + "</strong>" +
          "<span>" + escapeHtml(user.email) + " . " + escapeHtml(user.role) + "</span>" +
          "</div>" +
          '<span class="chip count-chip">Ativo</span>' +
          "</div>"
        );
      })
      .join("");
  }

  function renderUserOptions() {
    const users = FlowTaskUsers.getUsers();
    const currentFilterUser = dom.filterUser.value || "Todos";
    const defaultOption = '<option value="" disabled selected>Selecione o responsavel</option>';
    const filterDefault = '<option value="Todos" selected>Todos os responsaveis</option>';
    const options = users
      .map(function (user) {
        return '<option value="' + user.id + '">' + escapeHtml(user.name) + "</option>";
      })
      .join("");

    dom.taskUserSelect.innerHTML = defaultOption + options;
    dom.modalTaskUserSelect.innerHTML = defaultOption + options;
    dom.filterUser.innerHTML = filterDefault + options;
    dom.filterUser.value = currentFilterUser;
  }

  function renderDashboard() {
    const tasks = FlowTaskTasks.getTasks();
    const stats = {
      total: tasks.length,
      completed: tasks.filter(function (task) { return task.status === "Concluido"; }).length,
      progress: tasks.filter(function (task) { return task.status === "Em andamento"; }).length,
      todo: tasks.filter(function (task) { return task.status === "A fazer"; }).length
    };

    dom.dashboardCards.innerHTML = Object.keys(statusConfig)
      .map(function (key) {
        const item = statusConfig[key];
        return (
          '<div class="col s12 m6 l3">' +
          '<div class="card stats-card ' + item.cardClass + '">' +
          '<div class="card-content">' +
          '<div class="metric-icon"><i class="material-icons">' + item.icon + "</i></div>" +
          '<div class="metric-value">' + stats[key] + "</div>" +
          '<div class="metric-label">' + item.label + "</div>" +
          "</div></div></div>"
        );
      })
      .join("");
  }

  function renderTasksTable() {
    const filters = {
      priority: dom.filterPriority.value,
      userId: dom.filterUser.value,
      status: dom.filterStatus.value
    };
    const tasks = FlowTaskTasks.getSortedTasks(filters);

    dom.emptyState.classList.toggle("hide", tasks.length > 0);
    dom.tasksTableBody.innerHTML = tasks
      .map(function (task) {
        const responsible = FlowTaskUsers.findUserById(task.responsibleId);
        const responsibleName = responsible ? responsible.name : "Nao atribuido";

        return (
          "<tr>" +
          "<td><span class=\"task-title\">" + escapeHtml(task.title) + "</span><span class=\"task-meta\">" + escapeHtml(task.description) + "</span></td>" +
          "<td>" + escapeHtml(responsibleName) + "</td>" +
          "<td>" + buildPriorityBadge(task.priority) + "</td>" +
          "<td>" + formatDate(task.deadline) + "</td>" +
          "<td>" + buildStatusBadge(task.status) + "</td>" +
          "<td><div class=\"task-actions\">" +
          '<button class="icon-action status-action tooltipped" type="button" data-position="top" data-tooltip="Avancar status" data-action="advance-status" data-task-id="' + task.id + '"><i class="material-icons">sync</i></button>' +
          '<button class="icon-action delete-action tooltipped" type="button" data-position="top" data-tooltip="Excluir tarefa" data-action="delete-task" data-task-id="' + task.id + '"><i class="material-icons">delete</i></button>' +
          "</div></td>" +
          "</tr>"
        );
      })
      .join("");

    M.Tooltip.init(document.querySelectorAll(".tooltipped"));
  }

  function renderHeroMetrics() {
    const tasks = FlowTaskTasks.getTasks();
    const users = FlowTaskUsers.getUsers();
    const completed = tasks.filter(function (task) { return task.status === "Concluido"; }).length;
    const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    dom.heroTotal.textContent = String(tasks.length);
    dom.heroTeam.textContent = String(users.length);
    dom.heroProgress.textContent = completionRate + "%";
  }

  function buildPriorityBadge(priority) {
    return '<span class="priority-badge priority-' + normalizeClass(priority) + '">' + escapeHtml(priority) + "</span>";
  }

  function buildStatusBadge(status) {
    return '<span class="status-badge status-' + normalizeClass(status) + '">' + escapeHtml(status) + "</span>";
  }

  function resetForm(form) {
    form.reset();
    M.updateTextFields();
    Array.prototype.forEach.call(form.querySelectorAll("textarea"), function (textarea) {
      M.textareaAutoResize(textarea);
    });
    reinitializeSelects();
  }

  function reinitializeSelects() {
    document.querySelectorAll("select").forEach(function (select) {
      const instance = M.FormSelect.getInstance(select);
      if (instance) {
        instance.destroy();
      }
    });
    M.FormSelect.init(document.querySelectorAll("select"));
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "-";
    }
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString + "T00:00:00"));
  }

  function normalizeClass(value) {
    return String(value).toLowerCase().replace(/\s+/g, "-");
  }

  function showToast(message) {
    M.toast({ html: message, classes: "rounded" });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
