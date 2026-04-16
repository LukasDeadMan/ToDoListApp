# ToDo List App
[Portugues](#portugues) | [English](#english)

<a id="portugues"></a>
## Portugues

## Objetivo

Construir uma aplicacao web full stack com **React no frontend** e **Flask no backend**, com autenticacao de usuarios, CRUD de tarefas e base pronta para evolucao local e futura publicacao.

---

## Stack Tecnologica

- **Frontend:** React (JavaScript) + Fetch API + CSS proprio
- **Backend:** Python (Flask + Flask-Login + Flask-SQLAlchemy + Flask-Migrate + Flask-CORS)
- **Banco de dados:** SQLite
- **Ambiente:** Docker e Docker Compose
- **Autenticacao:** sessao com cookie HTTP-only
- **Testes:** Jest + Testing Library + Playwright no frontend, Pytest no backend

### Observacao sobre a stack

O planejamento inicial mencionava **Axios**, **Bootstrap** e **JWT**, mas a implementacao atual seguiu outro caminho:

- `Axios` foi substituido por `fetch`
- `Bootstrap` foi substituido por CSS proprio
- `JWT` foi substituido por autenticacao baseada em sessao com `Flask-Login`

Essa mudanca deixou o projeto mais simples e mais coerente com o fluxo web atual da aplicacao.

---

## Como rodar localmente com Docker

1. **Pre-requisitos**
   Docker Desktop no Windows/Mac, ou Docker Engine + Docker Compose no Linux

2. **Clone o repositorio**

```bash
git clone https://github.com/LukasDeadMan/ToDoListApp.git
cd ToDoApp
```

3. **Suba os containers**

```bash
docker compose up --build
```

4. **Servicos disponiveis**

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
|   |   |   |-- tasks.py
|   |   |   `-- users.py
|   |   |-- __init__.py
|   |   |-- extensions.py
|   |   |-- models.py
|   |   `-- security.py
|   |-- migrations/
|   |-- tests/
|   |-- Dockerfile
|   |-- pytest.ini
|   |-- requirements.txt
|   `-- run.py
|-- frontend/
|   |-- e2e/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- styles/
|   |   |-- App.js
|   |   `-- index.js
|   |-- .env.example
|   |-- Dockerfile
|   |-- Dockerfile.e2e
|   |-- package.json
|   |-- playwright.config.js
|   `-- README.md
|-- docker-compose.yml
|-- .gitignore
`-- README.md
```

---

## Funcionalidades

- [x] Ambiente dockerizado com frontend e backend
- [x] Cadastro de usuarios
- [x] Login com sessao baseada em cookie
- [x] Logout
- [x] CRUD de tarefas
- [x] Marcar tarefa como concluida
- [x] Tarefas isoladas por usuario
- [x] Pagina inicial publica
- [x] Telas de login e cadastro
- [x] Pagina de perfil
- [x] Mensagens de erro e sucesso no frontend
- [x] Frontend responsivo
- [x] Filtros e busca de tarefas
- [x] Validacao de senha mais forte
- [x] Protecao basica contra brute force no login
- [x] Testes unitarios e smoke no frontend
- [x] Smoke E2E com Playwright

---

## Rotas da API

Base URL:

```text
http://localhost:5000/api/v1
```

### Usuarios

- `POST /users/register`
- `POST /users/login`
- `POST /users/logout`
- `GET /users/me`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

### Tarefas

- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
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

- [x] Estrutura inicial com Flask e Docker
- [x] Banco SQLite
- [x] API com Blueprints
- [x] Models `User` e `Task`
- [x] Autenticacao baseada em sessao
- [x] CORS para o frontend
- [x] Tratamento JSON de erro
- [x] Validacao de senha
- [x] Protecao basica contra brute force

### Frontend

- [x] Estrutura inicial com React e Docker
- [x] Pagina inicial publica
- [x] Login e cadastro
- [x] Lista de tarefas
- [x] Criacao e edicao de tarefa
- [x] Perfil
- [x] Sessao com cookies e `credentials: "include"`
- [x] Integracao com a API
- [x] Mensagens de erro e sucesso
- [x] Testes unitarios e smoke
- [x] Smoke E2E

### Estilizacao e Publicacao

- [x] Estilizacao customizada
- [x] Responsividade
- [ ] Deploy do frontend
- [ ] Deploy do backend
- [ ] Adicionar screenshots no README
- [ ] Adicionar link publico da aplicacao

---

## Testes

### Backend

```bash
docker compose exec backend python -m pytest -q
```

### Frontend unitario e smoke

```bash
docker compose exec frontend npm test -- --watchAll=false
```

### Build do frontend

```bash
docker compose exec frontend npm run build
```

### Smoke E2E

```bash
docker compose run --rm e2e
```

Hoje o projeto cobre:

- testes de backend para autenticacao, usuarios, tarefas e helpers
- testes unitarios de helpers no frontend
- smoke tests de navegacao e fluxos principais no frontend
- smoke E2E real com navegador contra backend e frontend rodando

---

## Extras

- [x] Filtro por tarefas concluidas e em aberto
- [x] Pagina de perfil do usuario
- [x] Testes automatizados no backend
- [x] Testes unitarios no frontend
- [x] Smoke E2E
- [ ] Tema escuro/claro com alternancia
- [ ] Deploy em producao

---

## Referencias

- Flask: <https://flask.palletsprojects.com/en/stable/>
- React: <https://react.dev/>
- Playwright: <https://playwright.dev/>

---

<a id="english"></a>
## English

## Goal

Build a full stack web application with **React on the frontend** and **Flask on the backend**, including user authentication, task CRUD, and a solid local foundation for future deployment.

---

## Tech Stack

- **Frontend:** React (JavaScript) + Fetch API + custom CSS
- **Backend:** Python (Flask + Flask-Login + Flask-SQLAlchemy + Flask-Migrate + Flask-CORS)
- **Database:** SQLite
- **Environment:** Docker and Docker Compose
- **Authentication:** HTTP-only cookie session
- **Tests:** Jest + Testing Library + Playwright on the frontend, Pytest on the backend

### Stack Note

The original plan mentioned **Axios**, **Bootstrap**, and **JWT**, but the current implementation follows a different path:

- `Axios` was replaced with `fetch`
- `Bootstrap` was replaced with custom CSS
- `JWT` was replaced with session-based authentication using `Flask-Login`

This made the project simpler and better aligned with the current web flow of the application.

---

## Run Locally with Docker

1. **Requirements**
   Docker Desktop on Windows/Mac, or Docker Engine + Docker Compose on Linux

2. **Clone the repository**

```bash
git clone https://github.com/LukasDeadMan/ToDoListApp.git
cd ToDoApp
```

3. **Start the containers**

```bash
docker compose up --build
```

4. **Available services**

- Frontend React app: <http://localhost:3000>
- Backend Flask API: <http://localhost:5000>
- Backend health check: <http://localhost:5000/status>

---

## Folder Structure

```text
ToDoApp/
|-- backend/
|   |-- app/
|   |   |-- routes/
|   |   |   |-- tasks.py
|   |   |   `-- users.py
|   |   |-- __init__.py
|   |   |-- extensions.py
|   |   |-- models.py
|   |   `-- security.py
|   |-- migrations/
|   |-- tests/
|   |-- Dockerfile
|   |-- pytest.ini
|   |-- requirements.txt
|   `-- run.py
|-- frontend/
|   |-- e2e/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- styles/
|   |   |-- App.js
|   |   `-- index.js
|   |-- .env.example
|   |-- Dockerfile
|   |-- Dockerfile.e2e
|   |-- package.json
|   |-- playwright.config.js
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
- [x] Task CRUD
- [x] Mark task as completed
- [x] Tasks isolated per user
- [x] Public landing page
- [x] Login and registration pages
- [x] Profile page
- [x] Frontend success and error messages
- [x] Responsive frontend
- [x] Task filters and search
- [x] Stronger password validation
- [x] Basic brute-force protection on login
- [x] Frontend unit and smoke tests
- [x] Playwright E2E smoke test

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
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

### Tasks

- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
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

- [x] Initial Flask and Docker structure
- [x] SQLite database
- [x] Blueprint-based API
- [x] `User` and `Task` models
- [x] Session-based authentication
- [x] Frontend CORS setup
- [x] JSON error handling
- [x] Password validation
- [x] Basic brute-force protection

### Frontend

- [x] Initial React and Docker structure
- [x] Public landing page
- [x] Login and registration
- [x] Task list
- [x] Create and edit task flow
- [x] Profile
- [x] Session cookies with `credentials: "include"`
- [x] API integration
- [x] Success and error messages
- [x] Unit and smoke tests
- [x] E2E smoke test

### Styling and Publishing

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
docker compose exec backend python -m pytest -q
```

### Frontend unit and smoke

```bash
docker compose exec frontend npm test -- --watchAll=false
```

### Frontend build

```bash
docker compose exec frontend npm run build
```

### E2E smoke

```bash
docker compose run --rm e2e
```

Current automated coverage includes:

- backend tests for authentication, users, tasks, and helpers
- frontend helper unit tests
- frontend smoke tests for main navigation and core flows
- real browser E2E smoke against the running backend and frontend

---

## Extras

- [x] Completed/open task filtering
- [x] User profile page
- [x] Automated backend tests
- [x] Frontend unit tests
- [x] E2E smoke test
- [ ] Dark/light theme toggle
- [ ] Production deployment

---

## References

- Flask: <https://flask.palletsprojects.com/en/stable/>
- React: <https://react.dev/>
- Playwright: <https://playwright.dev/>
