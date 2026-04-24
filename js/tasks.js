(function () {
  const priorityOrder = {
    Alta: 0,
    Media: 1,
    Baixa: 2
  };

  async function getTasks() {
    return window.FlowTaskApi.requestJson("/api/tasks", undefined, "Nao foi possivel carregar as tarefas.");
  }

  async function createTask(payload) {
    return window.FlowTaskApi.requestJson(
      "/api/tasks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      },
      "Nao foi possivel salvar a tarefa."
    );
  }

  async function deleteTask(taskId) {
    await window.FlowTaskApi.requestJson(
      "/api/tasks/" + encodeURIComponent(String(taskId)),
      {
        method: "DELETE"
      },
      "Nao foi possivel excluir a tarefa."
    );

    return true;
  }

  async function advanceTaskStatus(taskId) {
    return window.FlowTaskApi.requestJson(
      "/api/tasks/" + encodeURIComponent(String(taskId)) + "/status",
      {
        method: "PATCH"
      },
      "Nao foi possivel atualizar o status."
    );
  }

  async function getSortedTasks(filters) {
    const tasks = await getTasks();

    return tasks
      .filter(function (task) {
        const matchesPriority =
          !filters.priority || filters.priority === "Todos" || task.priority === filters.priority;
        const matchesUser =
          !filters.userId || filters.userId === "Todos" || String(task.responsibleId) === String(filters.userId);
        const matchesStatus =
          !filters.status || filters.status === "Todos" || task.status === filters.status;

        return matchesPriority && matchesUser && matchesStatus;
      })
      .sort(function (taskA, taskB) {
        const priorityDifference = priorityOrder[taskA.priority] - priorityOrder[taskB.priority];

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return new Date(taskA.deadline) - new Date(taskB.deadline);
      });
  }

  window.FlowTaskTasks = {
    getTasks: getTasks,
    createTask: createTask,
    deleteTask: deleteTask,
    advanceTaskStatus: advanceTaskStatus,
    getSortedTasks: getSortedTasks
  };
})();
