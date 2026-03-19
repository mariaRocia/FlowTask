(function () {
  const users = [
    { id: 1, name: "Ana Souza", email: " ana@flowtask.com", role: "Product Owner" },
    { id: 2, name: "Carlos Lima", email: " carlos@flowtask.com", role: "Designer UI" },
    { id: 3, name: "Marina Costa", email: " marina@flowtask.com", role: "Desenvolvedora Front-end" }
  ];

  function getUsers() {
    return [...users];
  }

  function findUserById(id) {
    return (
      users.find(function (user) {
        return user.id === Number(id);
      }) || null
    );
  }

  function createUser(payload) {
    const user = {
      id: Date.now(),
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      role: payload.role.trim()
    };

    users.unshift(user);
    return user;
  }

  window.FlowTaskUsers = {
    getUsers: getUsers,
    findUserById: findUserById,
    createUser: createUser
  };
})();
