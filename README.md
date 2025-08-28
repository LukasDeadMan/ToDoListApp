# 📝 Projeto Fullstack: ToDo List com Login

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
- [ ] Cadastro e login de usuários (autenticação JWT ou sessão)
- [ ] Logout
- [ ] CRUD de tarefas (criar, editar, deletar)
- [ ] Marcar tarefa como concluída
- [ ] Mostrar tarefas por usuário
- [ ] Frontend responsivo com React

---

## 📆 Cronograma de Desenvolvimento (3 semanas)

### Semana 1 – Backend (Flask + Auth)

- [x] Montar estrutura inicial backend com Flask e Docker  
- [x] Configuração e criação do banco de dados (SQLite)  
- [ ] Criar API Flask com Blueprints  
- [ ] Criar modelos: `User`, `Task`  
- [ ] Implementar rotas:  
  - [ ] `POST /register`  
  - [ ] `POST /login`  
  - [ ] `GET /logout`  
- [ ] Retornar tokens JWT (ou usar Flask-Login com sessões)  
- [ ] CORS para permitir requisições do React  

### Semana 2 – Frontend com React

- [x] Montar estrutura inicial frontend com React e Docker
- [ ] Criar telas:
  - Login / Registro
  - Lista de tarefas
  - Criar / Editar tarefa
- [ ] Armazenar token no `localStorage`
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
