# ToDo List App
[Português](#portugues) | [English](#english)

<a id="portugues"></a>
## Português

## Objetivo

Criar uma aplicação web fullstack usando **React no frontend** e **Flask no backend**, com autenticação de usuários, CRUD de tarefas e estrutura pronta para deploy.

---

## Stack Tecnológica

- **Frontend:** React (JavaScript) + Fetch API + CSS customizado
- **Backend:** Python (Flask + Flask-Login + Flask-SQLAlchemy + Flask-Migrate + Flask-CORS)
- **Banco de dados:** SQLite
- **Ambiente:** Docker (container para frontend e backend via Docker Compose)
- **Autenticação:** Sessão com cookie HTTP-only
- **Testes:** Jest + Testing Library no frontend, Pytest no backend

### Observação sobre a stack

O planejamento inicial mencionava **Axios**, **Bootstrap** e **JWT**, mas a implementação atual seguiu outro caminho:

- `Axios` foi substituído por `fetch`
- `Bootstrap` foi substituído por CSS próprio
- `JWT` foi substituído por autenticação baseada em sessão com `Flask-Login`

Essas mudanças foram feitas para simplificar a aplicação e combinar melhor com o fluxo web atual do projeto.

---

## Como rodar localmente com Docker

1. **Pré-requisitos:**  
   Docker Desktop (Windows/Mac) ou Docker Engine + Docker Compose (Linux)

2. **Clone o repositório:**

   ```bash
   git clone https://github.com/LukasDeadMan/ToDoListApp.git
   cd ToDoApp
   ```

3. **Build e execute os containers:**

   ```bash
   docker compose up --build
   ```

4. **Serviços disponíveis:**

   - Frontend React: <http://localhost:3000>
   - Backend Flask: <http://localhost:5000>
   - Healthcheck backend: <http://localhost:5000/status>

---

## Estrutura de Pastas

```text
ToDoApp/
|-- backend/
|   |-- app/
|   |   |-- routes/
|   |   |   |-- users.py
|   |   |   `-- tasks.py
|   |   |-- __init__.py
|   |   |-- extensions.py
|   |   `-- models.py
|   |-- migrations/
|   |-- tests/
|   |-- Dockerfile
|   |-- requirements.txt
|   `-- run.py
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- App.js
|   |   `-- index.js
|   |-- .env.example
|   |-- Dockerfile
|   |-- package.json
|   `-- README.md
|-- docker-compose.yml
|-- .gitignore
`-- README.md
```

---

## Funcionalidades

- [x] Ambiente dockerizado (backend Flask + frontend React)
- [x] Cadastro de usuários
- [x] Login com sessão baseada em cookie
- [x] Logout
- [x] CRUD de tarefas (criar, editar, deletar)
- [x] Marcar tarefa como concluída
- [x] Mostrar tarefas por usuário
- [x] Página inicial pública
- [x] Telas de login e registro
- [x] Página de perfil
- [x] Mensagens de erro e sucesso no frontend
- [x] Frontend responsivo
- [x] Filtros de tarefas
- [x] Busca de tarefas

---

## Rotas da API

Base URL:

```text
http://localhost:5000/api/v1
```

### Usuários

- `POST /users/register`
- `POST /users/login`
- `POST /users/logout`
- `GET /users/me`
- `PUT /users/:id`
- `DELETE /users/:id`

### Tarefas

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

---

## Rotas do Frontend

- `/`
- `/login`
- `/register`
- `/tasks`
- `/tasks/new`
- `/tasks/:taskId/edit`
- `/profile`

---

## Cronograma de Desenvolvimento

### Backend

- [x] Montar estrutura inicial backend com Flask e Docker
- [x] Configuração e criação do banco de dados (SQLite)
- [x] Criar API Flask com Blueprints
- [x] Criar modelos `User` e `Task`
- [x] Implementar autenticação baseada em sessão
- [x] Configurar CORS para o frontend
- [x] Implementar rotas protegidas e tratamento JSON de erro

### Frontend

- [x] Montar estrutura inicial frontend com React e Docker
- [x] Criar telas:
  - [x] Página inicial
  - [x] Login / Registro
  - [x] Lista de tarefas
  - [x] Criar / Editar tarefa
  - [x] Perfil
- [x] Manter sessão do usuário com cookies e `credentials: "include"`
- [x] Consumir API pelo frontend
- [x] Mostrar mensagens de erro/sucesso
- [x] Criar testes unitários e smoke tests

### Estilização e Deploy

- [x] Estilização customizada
- [x] Responsividade
- [ ] Deploy do frontend
- [ ] Deploy do backend
- [ ] Adicionar prints no README
- [ ] Adicionar link público da aplicação

---

## Testes

### Backend

```bash
docker compose exec backend pytest
```

### Frontend

```bash
docker compose exec frontend npm test -- --watchAll=false
```

Atualmente o frontend possui:

- testes unitários de helpers
- testes de fumaça cobrindo home, login, cadastro, proteção de rota, dashboard e logout

---

## Extras

- [x] Filtro por tarefas concluídas/não concluídas
- [x] Página de perfil do usuário
- [x] Testes unitários no frontend
- [ ] Tema escuro/claro com alternância
- [ ] Deploy em produção

---

## Referências

- Documentação Flask: <https://flask.palletsprojects.com/en/stable/>
- React: <https://react.dev/>

---

<a id="english"></a>
## English

## Goal

Build a full-stack web application with **React on the frontend** and **Flask on the backend**, including user authentication, task CRUD operations, and a structure ready for deployment.

---

## Tech Stack

- **Frontend:** React (JavaScript) + Fetch API + custom CSS
- **Backend:** Python (Flask + Flask-Login + Flask-SQLAlchemy + Flask-Migrate + Flask-CORS)
- **Database:** SQLite
- **Environment:** Docker (frontend and backend containers via Docker Compose)
- **Authentication:** HTTP-only cookie session
- **Tests:** Jest + Testing Library on the frontend, Pytest on the backend

### Stack Note

The original plan mentioned **Axios**, **Bootstrap**, and **JWT**, but the current implementation follows a different path:

- `Axios` was replaced with `fetch`
- `Bootstrap` was replaced with custom CSS
- `JWT` was replaced with session-based authentication using `Flask-Login`

These changes were made to keep the app simpler and better aligned with the current web flow of the project.

---

## Run Locally with Docker

1. **Requirements:**  
   Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)

2. **Clone the repository:**

   ```bash
   git clone https://github.com/LukasDeadMan/ToDoListApp.git
   cd ToDoApp
   ```

3. **Build and start the containers:**

   ```bash
   docker compose up --build
   ```

4. **Available services:**

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:5000>
- Backend health check: <http://localhost:5000/status>

---

## Folder Structure

```text
ToDoApp/
|-- backend/
|   |-- app/
|   |   |-- routes/
|   |   |   |-- users.py
|   |   |   `-- tasks.py
|   |   |-- __init__.py
|   |   |-- extensions.py
|   |   `-- models.py
|   |-- migrations/
|   |-- tests/
|   |-- Dockerfile
|   |-- requirements.txt
|   `-- run.py
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- App.js
|   |   `-- index.js
|   |-- .env.example
|   |-- Dockerfile
|   |-- package.json
|   `-- README.md
|-- docker-compose.yml
|-- .gitignore
`-- README.md
```

---

## Features

- [x] Dockerized frontend and backend
- [x] User registration
- [x] Login with cookie-based session
- [x] Logout
- [x] Task CRUD (create, edit, delete)
- [x] Mark task as completed
- [x] Display tasks per user
- [x] Public landing page
- [x] Login and register pages
- [x] Profile page
- [x] Frontend success and error messages
- [x] Frontend responsive layout
- [x] Task filters
- [x] Task search

---

## API Routes

Base URL:

```text
http://localhost:5000/api/v1
```

### Users

- `POST /users/register`
- `POST /users/login`
- `POST /users/logout`
- `GET /users/me`
- `PUT /users/:id`
- `DELETE /users/:id`

### Tasks

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

---

## Frontend Routes

- `/`
- `/login`
- `/register`
- `/tasks`
- `/tasks/new`
- `/tasks/:taskId/edit`
- `/profile`

---

## Development Timeline

### Backend

- [x] Set up initial backend structure with Flask and Docker
- [x] Configure and create the database (SQLite)
- [x] Create the Flask API using Blueprints
- [x] Create `User` and `Task` models
- [x] Implement session-based authentication
- [x] Configure CORS for the frontend
- [x] Implement protected routes and JSON error handling

### Frontend

- [x] Set up initial frontend structure with React and Docker
- [x] Create pages:
  - [x] Landing page
  - [x] Login / Register
  - [x] Task list
  - [x] Create / Edit task
  - [x] Profile
- [x] Keep user session using cookies and `credentials: "include"`
- [x] Consume the API from the frontend
- [x] Show success and error messages
- [x] Add unit tests and smoke tests

### Styling and Deployment

- [x] Custom styling
- [x] Responsiveness
- [ ] Frontend deployment
- [ ] Backend deployment
- [ ] Add screenshots to the README
- [ ] Add a public app link

---

## Tests

### Backend

```bash
docker compose exec backend pytest
```

### Frontend

```bash
docker compose exec frontend npm test -- --watchAll=false
```

The frontend currently includes:

- helper unit tests
- smoke tests covering home, login, registration, route protection, dashboard, and logout

---

## Extras

- [x] Filter completed/incomplete tasks
- [x] User profile page
- [x] Frontend unit tests
- [ ] Dark/light theme toggle
- [ ] Production deployment

---

## References

- Flask documentation: <https://flask.palletsprojects.com/en/stable/>
- React: <https://react.dev/>

---

## Notes

The original plan mentioned **Axios**, **Bootstrap**, and **JWT**, but the current implementation uses:

- `fetch` instead of Axios
- custom CSS instead of Bootstrap
- session cookies with `Flask-Login` instead of JWT

This reflects the actual implementation currently in the repository.
