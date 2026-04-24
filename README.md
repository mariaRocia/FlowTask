# 🚀 FlowTask

O **FlowTask** é uma aplicação web de gestão de tarefas desenvolvida para pequenas equipes que precisam organizar atividades de forma simples e eficiente.

A proposta do sistema é centralizar o controle de tarefas, responsáveis, prazos e status em uma única interface, facilitando o acompanhamento do fluxo de trabalho no dia a dia.

---

## ✨ Principais funcionalidades

- Dashboard com visão geral das tarefas  
- Cadastro e gerenciamento de usuários  
- Criação e edição de tarefas  
- Associação de tarefas a responsáveis  
- Controle de status:
  - A fazer  
  - Em andamento  
  - Concluído  
- Filtros por responsável, prioridade e status  
- Ordenação por prazo e prioridade  
- Feedback visual com notificações (toast)  
- Persistência de dados com MySQL via API local  

---

## 🧱 Tecnologias utilizadas

### Front-end
- HTML5  
- CSS3  
- JavaScript  
- MaterializeCSS  

### Back-end
- Node.js  
- MySQL  

---

## 📁 Estrutura do projeto

```text
FlowTask/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── api.js        # Comunicação com a API
│   ├── app.js        # Lógica principal e renderização
│   ├── users.js      # Gerenciamento de usuários
│   └── tasks.js      # Gerenciamento de tarefas
├── database.js       # Inicialização e operações do banco
├── server.js         # Servidor HTTP e rotas da API
└── package.json
```

---

## ⚙️ Como executar o projeto

### Pré-requisitos

- Node.js instalado  
- NPM instalado  
- MySQL em execução  

---

### 📦 Instalação

Instale as dependências do projeto:

```bash
npm install
```

---

### ⚙️ Configuração

Caso necessário, configure as variáveis de ambiente para conexão com o banco:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=senha
DB_NAME=flowtask
```

---

### ▶️ Execução

Inicie o servidor:

```bash
npm run dev
```

Acesse no navegador:

```
http://localhost:3000
```

---

## 🧪 Como testar

Para validar o funcionamento da aplicação:

1. Cadastre um usuário  
2. Crie uma tarefa  
3. Defina responsável e prioridade  
4. Atualize o status da tarefa  
5. Utilize os filtros disponíveis  
6. Acompanhe a atualização do dashboard  

---

## 🗄️ Banco de dados

- O banco é criado automaticamente, caso não exista  
- As tabelas e dados iniciais são gerados via `database.js`  
- É necessário que o MySQL esteja acessível no ambiente  

---

## 📌 Observações

- O projeto foi estruturado de forma simples, priorizando clareza e fácil manutenção  
- A separação entre front-end e API facilita futuras evoluções  
- Pode ser expandido para incluir:
  - Autenticação  
  - Integração com APIs externas  
  - Persistência em nuvem  