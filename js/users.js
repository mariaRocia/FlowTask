(function () {
  async function getUsers() {
    return window.FlowTaskApi.requestJson("/api/users", undefined, "Nao foi possivel carregar os usuarios.");
  }

  async function findUserById(id) {
    const users = await getUsers();

    return (
      users.find(function (user) {
        return user.id === Number(id);
      }) || null
    );
  }

  async function createUser(payload) {
    return window.FlowTaskApi.requestJson(
      "/api/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      },
      "Nao foi possivel salvar o usuario."
    );
  }

  window.FlowTaskUsers = {
    getUsers: getUsers,
    findUserById: findUserById,
    createUser: createUser
  };
})();
