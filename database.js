import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "flowtask"
};

const initialUsers = [
  { name: "Ana Souza", email: "ana@flowtask.com", role: "Product Owner" },
  { name: "Carlos Lima", email: "carlos@flowtask.com", role: "Designer UI" },
  { name: "Marina Costa", email: "marina@flowtask.com", role: "Desenvolvedora Front-end" }
];

const initialTasks = [
  {
    title: "Estruturar homepage comercial",
    description: "Criar a primeira versao da vitrine institucional da plataforma.",
    priority: "Alta",
    deadline: "2026-03-24",
    responsibleEmail: "carlos@flowtask.com",
    status: "Em andamento"
  },
  {
    title: "Definir componentes do dashboard",
    description: "Mapear blocos visuais e indicadores principais para a tela inicial.",
    priority: "Media",
    deadline: "2026-03-28",
    responsibleEmail: "marina@flowtask.com",
    status: "A fazer"
  },
  {
    title: "Revisar backlog semanal",
    description: "Organizar prioridades do sprint com base no feedback da equipe.",
    priority: "Baixa",
    deadline: "2026-03-21",
    responsibleEmail: "ana@flowtask.com",
    status: "Concluido"
  }
];

let pool;

export async function initializeDatabase() {
  await ensureDatabase();

  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(80) NOT NULL UNIQUE,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(80) NOT NULL,
      description VARCHAR(240) NOT NULL,
      priority ENUM('Alta', 'Media', 'Baixa') NOT NULL,
      deadline DATE NOT NULL,
      responsible_id INT NOT NULL,
      status ENUM('A fazer', 'Em andamento', 'Concluido') NOT NULL DEFAULT 'A fazer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_tasks_user FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE RESTRICT
    )
  `);

  await seedDatabase();
}

async function ensureDatabase() {
  const bootstrap = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  });

  try {
    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await bootstrap.end();
  }
}

async function seedDatabase() {
  const [userCountRows] = await pool.query("SELECT COUNT(*) AS total FROM users");
  const [taskCountRows] = await pool.query("SELECT COUNT(*) AS total FROM tasks");

  if (userCountRows[0].total === 0) {
    for (const user of initialUsers) {
      await pool.query(
        "INSERT INTO users (name, email, role) VALUES (?, ?, ?)",
        [user.name, user.email, user.role]
      );
    }
  }

  if (taskCountRows[0].total === 0) {
    for (const task of initialTasks) {
      const responsible = await findUserByEmail(task.responsibleEmail);

      if (responsible) {
        await pool.query(
          "INSERT INTO tasks (title, description, priority, deadline, responsible_id, status) VALUES (?, ?, ?, ?, ?, ?)",
          [task.title, task.description, task.priority, task.deadline, responsible.id, task.status]
        );
      }
    }
  }
}

function requirePool() {
  if (!pool) {
    throw new Error("Database pool not initialized.");
  }

  return pool;
}

export async function getUsers() {
  const activePool = requirePool();
  const [rows] = await activePool.query(`
    SELECT id, name, email, role
    FROM users
    ORDER BY id DESC
  `);

  return rows;
}

export async function createUser(payload) {
  const activePool = requirePool();
  const [result] = await activePool.query(
    "INSERT INTO users (name, email, role) VALUES (?, ?, ?)",
    [payload.name, payload.email, payload.role]
  );

  return findUserById(result.insertId);
}

export async function findUserById(id) {
  const activePool = requirePool();
  const [rows] = await activePool.query(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [id]
  );

  return rows[0] || null;
}

async function findUserByEmail(email) {
  const activePool = requirePool();
  const [rows] = await activePool.query(
    "SELECT id, name, email, role FROM users WHERE email = ?",
    [email]
  );

  return rows[0] || null;
}

export async function getTasks() {
  const activePool = requirePool();
  const [rows] = await activePool.query(`
    SELECT
      id,
      title,
      description,
      priority,
      DATE_FORMAT(deadline, '%Y-%m-%d') AS deadline,
      responsible_id AS responsibleId,
      status
    FROM tasks
    ORDER BY
      CASE priority
        WHEN 'Alta' THEN 0
        WHEN 'Media' THEN 1
        ELSE 2
      END,
      deadline ASC,
      id DESC
  `);

  return rows;
}

export async function createTask(payload) {
  const activePool = requirePool();
  const [result] = await activePool.query(
    "INSERT INTO tasks (title, description, priority, deadline, responsible_id, status) VALUES (?, ?, ?, ?, ?, 'A fazer')",
    [payload.title, payload.description, payload.priority, payload.deadline, payload.responsibleId]
  );

  return findTaskById(result.insertId);
}

export async function deleteTask(taskId) {
  const activePool = requirePool();
  const [result] = await activePool.query("DELETE FROM tasks WHERE id = ?", [taskId]);
  return result.affectedRows > 0;
}

export async function advanceTaskStatus(taskId) {
  const activePool = requirePool();
  const currentTask = await findTaskById(taskId);

  if (!currentTask) {
    return null;
  }

  let nextStatus = "A fazer";

  if (currentTask.status === "A fazer") {
    nextStatus = "Em andamento";
  } else if (currentTask.status === "Em andamento") {
    nextStatus = "Concluido";
  }

  await activePool.query("UPDATE tasks SET status = ? WHERE id = ?", [nextStatus, taskId]);

  return findTaskById(taskId);
}

async function findTaskById(id) {
  const activePool = requirePool();
  const [rows] = await activePool.query(`
    SELECT
      id,
      title,
      description,
      priority,
      DATE_FORMAT(deadline, '%Y-%m-%d') AS deadline,
      responsible_id AS responsibleId,
      status
    FROM tasks
    WHERE id = ?
  `, [id]);

  return rows[0] || null;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
