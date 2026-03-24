# 📝 ToDo List App
[🇧🇷 Português](#portugues) | [🇺🇸 English](#english)

<a id="portugues"></a>
## 🇧🇷 Português

## 🎯 Objetivo

Criar uma aplicação web fullstack usando **React no frontend** e **Flask no backend**, com autenticação de usuários, CRUD de tarefas e deploy gratuito.

---

## 🧱 Stack Tecnológica

- **Frontend:** React (JavaScript) + Axios + CSS/Bootstrap  
- **Backend:** Python (Flask + Flask-Login + Flask-CORS)  
- **Banco de dados:** SQLite  
- **Ambiente:** Docker (container para frontend e backend, via docker-compose)
- **Extras:** JWT (ou sessões), deploy no Render/Railway/Vercel  

---

## 🐳 Como rodar localmente com Docker

1. **Pré-requisitos:**  
   Docker Desktop (Windows/Mac) ou Docker + Docker Compose (Linux)

2. **Clone o repositório:**

   ```bash
   git clone https://github.com/LukasDeadMan/ToDoListApp.git
   cd ToDoApp

3. **Build e execute os containers:**

    ```bash
    docker-compose up --build  
    ```

    Isso irá subir:

    - Backend Flask: <http://localhost:5000>

    - Frontend React: <http://localhost:3000>

4. **Pronto!**  
    Agora é só começar a desenvolver nos diretórios frontend e backend. As alterações refletem automaticamente dentro dos containers.  
  
---

## 🗂️ Estrutura de Pastas

```
ToDoApp/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── extensions.py
│   │   └──routes/
│   │      ├── users.py
│   │      ├── tasks.py
│   ├── run.py
│   ├── requirements.txt
│   ├── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ✅ Funcionalidades (roadmap)

- [x] Ambiente dockerizado (backend Flask, frontend React)
- [x] Cadastro e login de usuários (autenticação JWT ou sessão)
- [x] Logout
- [x] CRUD de tarefas (criar, editar, deletar)
- [x] Marcar tarefa como concluída
- [x] Mostrar tarefas por usuário
- [ ] Frontend responsivo com React

---

## 📆 Cronograma de Desenvolvimento (3 semanas)

### Semana 1 – Backend (Flask + Auth)

- [x] Montar estrutura inicial backend com Flask e Docker  
- [x] Configuração e criação do banco de dados (SQLite)  
- [x] Criar API Flask com Blueprints  
- [x] Criar modelos: `User`, `Task`  
- [x] Implementar rotas:  
  - [x] `POST /register`  
  - [x] `POST /login`  
  - [x] `GET /logout`  
- [x] Retornar tokens JWT (ou usar Flask-Login com sessões)  
- [x] CORS para permitir requisições do React  

### Semana 2 – Frontend com React

- [x] Montar estrutura inicial frontend com React e Docker
- [ ] Criar telas:
  - Login / Registro
  - Lista de tarefas
  - Criar / Editar tarefa
- [ ] Manter sessão do usuário no frontend com cookies/credentials
- [ ] Consumir API usando Axios
- [ ] Mostrar mensagens de erro/sucesso

### Semana 3 – Estilização e Deploy

- [ ] Estilizar com Bootstrap ou styled-components
- [ ] Responsividade
- [ ] Deploy:
  - Frontend no Vercel ou Netlify
  - Backend no Render ou Railway
- [ ] Criar README com:
  - Prints
  - Link da aplicação
  - Instruções para rodar localmente
  - Tecnologias usadas

---

## 📚 Referências

- Documentação Flask: <https://flask.palletsprojects.com/en/stable/>

---

## 🚀 Extras (opcional)

- [ ] Filtro por tarefas concluídas/não concluídas
- [ ] Tema escuro/claro
- [ ] Página de perfil do usuário
- [ ] Testes unitários (Jest ou Pytest)

<a id="english"></a>
## 🇺🇸 English

## 🎯 Goal

Build a full-stack web application using **React on the frontend** and **Flask on the backend**, with user authentication, task CRUD operations, and free deployment.

---

## 🧱 Tech Stack

- **Frontend:** React (JavaScript) + Axios + CSS/Bootstrap
- **Backend:** Python (Flask + Flask-Login + Flask-CORS)
- **Database:** SQLite
- **Environment:** Docker (frontend and backend containers via docker-compose)
- **Extras:** JWT (or sessions), deployment on Render/Railway/Vercel

---

## 🐳 Running Locally with Docker
1. **Requirements:**  
   Docker Desktop (Windows/Mac) or Docker + Docker Compose (Linux)

2. **Clone the repository:**

   ```bash
   git clone https://github.com/LukasDeadMan/ToDoListApp.git
   cd ToDoApp

3. **Build and run the containers:**

    ```bash
    docker-compose up --build  
    ```

   This will start:

    - Backend Flask: <http://localhost:5000>

    - Frontend React: <http://localhost:3000>

4. **Done!**  
    Now you can start developing inside the frontend and backend directories. Changes are automatically reflected inside the containers.

---

## Folder Structure

```
ToDoApp/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── extensions.py
│   │   └──routes/
│   │      ├── users.py
│   │      ├── tasks.py
│   ├── run.py
│   ├── requirements.txt
│   ├── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ✅ Features (roadmap)

- [x] Dockerized environment (Flask backend, React frontend)
- [x] User registration and login (JWT or session-based authentication)
- [x] Logout
- [x] Task CRUD (create, edit, delete)
- [x] Mark tasks as completed
- [x] Display tasks per user
- [ ] Responsive frontend with React

---

## 📆 Development Timeline (3 weeks)

### Week 1 – Backend (Flask + Auth)

- [x] Set up initial backend structure with Flask and Docker
- [x] Configure and create the database (SQLite)
- [x] Create Flask API using Blueprints
- [x] Create models: User, Task
- [x] Implement routes: 
  - [x] `POST /register`  
  - [x] `POST /login`  
  - [x] `GET /logout`  
- [x] Return JWT tokens (or use Flask-Login with sessions)
- [x] Configure CORS to allow React requests

### Week 2 – Frontend with React

- [x] Set up initial frontend structure with React and Docker
- [ ] Create pages:
  - Login / Register
  - Task list
  - Create / Edit task
- [ ] Maintain the user session on the frontend using cookies and credentials.
- [ ] Consume the API using Axios
- [ ] Display success/error messages

### Week 3 – Styling and Deployment

- [ ] Style with Bootstrap or styled-components
- [ ] Responsiveness
- [ ] Deployment:
  - Frontend on Vercel or Netlify
  - Backend on Render or Railway
- [ ] Improve README with:
  - Screenshots
  - App link
  - Local setup instructions
  - Technologies used

---

## 📚 References

- Flask documentation: <https://flask.palletsprojects.com/en/stable/>

---

## 🚀 Extras (optional)

- [ ] Filter completed/incomplete tasks
- [ ] Dark/light theme
- [ ] User profile page
- [ ] Unit tests (Jest or Pytest)