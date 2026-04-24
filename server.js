import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  advanceTaskStatus,
  closeDatabase,
  createTask,
  createUser,
  deleteTask,
  findUserById,
  getTasks,
  getUsers,
  initializeDatabase
} from "./database.js";

const rootDir = process.cwd();
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

await initializeDatabase();

const server = createServer(async function (request, response) {
  try {
    const requestUrl = new URL(request.url || "/", "http://localhost");
    const pathname = requestUrl.pathname;

    if (pathname.startsWith("/api/")) {
      await handleApi(request, response, pathname);
      return;
    }

    await handleStatic(response, pathname);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { message: "Erro interno no servidor." });
  }
});

server.listen(port, function () {
  console.log("FlowTask server running on http://localhost:" + port);
});

process.on("SIGINT", async function () {
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async function () {
  await closeDatabase();
  process.exit(0);
});

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/users") {
    const users = await getUsers();
    sendJson(response, 200, users);
    return;
  }

  if (request.method === "POST" && pathname === "/api/users") {
    const payload = await readBody(request);

    if (!payload.name || !payload.email || !payload.role) {
      sendJson(response, 400, { message: "Preencha todos os campos do usuario." });
      return;
    }

    if (!isValidEmail(payload.email)) {
      sendJson(response, 400, { message: "Informe um email valido." });
      return;
    }

    try {
      const user = await createUser({
        name: String(payload.name).trim(),
        email: String(payload.email).trim().toLowerCase(),
        role: String(payload.role).trim()
      });
      sendJson(response, 201, user);
    } catch (error) {
      if (error && error.code === "ER_DUP_ENTRY") {
        sendJson(response, 409, { message: "Ja existe um usuario com esse email." });
        return;
      }

      throw error;
    }

    return;
  }

  if (request.method === "GET" && pathname === "/api/tasks") {
    const tasks = await getTasks();
    sendJson(response, 200, tasks);
    return;
  }

  if (request.method === "POST" && pathname === "/api/tasks") {
    const payload = await readBody(request);

    if (!payload.title || !payload.description || !payload.priority || !payload.deadline || !payload.responsibleId) {
      sendJson(response, 400, { message: "Preencha todos os campos obrigatorios da tarefa." });
      return;
    }

    const responsibleId = Number(payload.responsibleId);
    const responsible = await findUserById(responsibleId);

    if (!responsible) {
      sendJson(response, 400, { message: "Selecione um responsavel valido." });
      return;
    }

    const task = await createTask({
      title: String(payload.title).trim(),
      description: String(payload.description).trim(),
      priority: String(payload.priority).trim(),
      deadline: String(payload.deadline).trim(),
      responsibleId: responsibleId
    });

    sendJson(response, 201, task);
    return;
  }

  if (request.method === "PATCH" && pathname.match(/^\/api\/tasks\/\d+\/status$/)) {
    const taskId = Number(pathname.split("/")[3]);
    const task = await advanceTaskStatus(taskId);

    if (!task) {
      sendJson(response, 404, { message: "Tarefa nao encontrada." });
      return;
    }

    sendJson(response, 200, task);
    return;
  }

  if (request.method === "DELETE" && pathname.match(/^\/api\/tasks\/\d+$/)) {
    const taskId = Number(pathname.split("/")[3]);
    const deleted = await deleteTask(taskId);

    if (!deleted) {
      sendJson(response, 404, { message: "Tarefa nao encontrada." });
      return;
    }

    sendJson(response, 200, { success: true });
    return;
  }

  sendJson(response, 404, { message: "Rota nao encontrada." });
}

async function handleStatic(response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const fileCandidates = [
    path.normalize(path.join(rootDir, safePath)),
    path.normalize(path.join(rootDir, "public", safePath))
  ];

  for (const filePath of fileCandidates) {
    if (!filePath.startsWith(rootDir)) {
      sendText(response, 403, "Acesso negado.");
      return;
    }

    try {
      const fileContent = await fs.readFile(filePath);
      const extension = path.extname(filePath).toLowerCase();
      response.writeHead(200, {
        "Content-Type": mimeTypes[extension] || "application/octet-stream"
      });
      response.end(fileContent);
      return;
    } catch (error) {
      continue;
    }
  }

  sendText(response, 404, "Arquivo nao encontrado.");
}

async function readBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  response.end(message);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}
