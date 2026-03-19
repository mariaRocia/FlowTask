🚀 FlowTask

O FlowTask é uma aplicação web de gestão de tarefas voltada para pequenas equipes.  
O sistema permite cadastrar usuários, criar tarefas, acompanhar status, definir prioridades e visualizar indicadores em um dashboard simples e intuitivo.


✨ Funcionalidades

- Dashboard com resumo de tarefas
- Cadastro de usuários
- Cadastro de tarefas
- Associação de tarefas a responsáveis
- Controle de status: `A fazer`, `Em andamento`, `Concluído`
- Filtros por prioridade, responsável e status
- Ordenação por prioridade e prazo
- Feedback visual com notificações (`toast`)


🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript
- MaterializeCSS


📁 Estrutura do projeto

```text
FlowTask/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js        # Lógica principal e renderização
│   ├── users.js      # Gerenciamento de usuários
│   └── tasks.js      # Gerenciamento de tarefas
├── components/
└── assets/
```

▶️ Como executar o projeto

📌 Pré-requisitos

- Node.js instalado (versão 14 ou superior)
- NPM (já incluso com o Node)

🔽 Instalação

Clone o repositório:

```bash
git clone https://github.com/mariaRocia/FlowTask.git
cd FlowTask
```

Instale as dependências:

```bash
npm install
```


⚡ Executando o projeto

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Após executar, acesse no navegador:
```text
http://localhost:3000
```
Ou a porta informada no terminal.


🧪 Testando a aplicação

1. Cadastre um usuário
2. Crie uma tarefa
3. Defina responsável e prioridade
4. Altere o status da tarefa
5. Utilize os filtros
6. Observe o dashboard sendo atualizado


⚠️ Observações

- Os dados são simulados em memória (sem backend)
- Ao recarregar a página, os dados são resetados
- Estrutura pronta para integração futura com API
