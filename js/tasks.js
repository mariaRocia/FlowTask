(function () {
  const priorityOrder = {
    Alta: 0,
    Media: 1,
    Baixa: 2
  };

  const statusFlow = ["A fazer", "Em andamento", "Concluido"];

  const tasks = [
    {
      id: 101,
      title: "Estruturar homepage comercial ",
      description: "Criar a primeira versao da vitrine institucional da plataforma.",
      priority: "Alta",
      deadline: "2026-03-24",
      responsibleId: 2,
      status: "Em andamento"
    },
    {
      id: 102,
      title: "Definir componentes do dashboard ",
      description: "Mapear blocos visuais e indicadores principais para a tela inicial.",
      priority: "Media",
      deadline: "2026-03-28",
      responsibleId: 3,
      status: "A fazer"
    },
    {
      id: 103,
      title: "Revisar backlog semanal ",
      description: "Organizar prioridades do sprint com base no feedback da equipe.",
      priority: "Baixa",
      deadline: "2026-03-21",
      responsibleId: 1,
      status: "Concluido"
    }
  ];

  function getTasks() {
    return [...tasks];
  }

  function createTask(payload) {
    const task = {
      id: Date.now(),
      title: payload.title.trim(),
      description: payload.description.trim(),
      priority: payload.priority,
      deadline: payload.deadline,
      responsibleId: Number(payload.responsibleId),
      status: "A fazer"
    };

    tasks.unshift(task);
    return task;
  }

  function deleteTask(taskId) {
    const index = tasks.findIndex(function (task) {
      return task.id === Number(taskId);
    });

    if (index >= 0) {
      tasks.splice(index, 1);
      return true;
    }

    return false;
  }

  function advanceTaskStatus(taskId) {
    const task = tasks.find(function (item) {
      return item.id === Number(taskId);
    });

    if (!task) {
      return null;
    }

    const currentIndex = statusFlow.indexOf(task.status);
    task.status = statusFlow[(currentIndex + 1) % statusFlow.length];
    return task;
  }

  function getSortedTasks(filters) {
    return getTasks()
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
