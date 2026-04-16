import { startTransition, useEffect, useState } from "react";
import "./App.css";
import AppShell from "./components/AppShell";
import FlashMessage from "./components/FlashMessage";
import LoadingView from "./components/LoadingView";
import { buildLoginPayload } from "./lib/auth";
import { tasksApi, usersApi } from "./lib/api";
import { matchRoute, normalizePath, routePaths } from "./lib/router";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import TasksPage from "./pages/TasksPage";

const protectedRouteNames = new Set([
  "tasks",
  "taskNew",
  "taskEdit",
  "profile",
]);

function getErrorMessage(error, fallbackMessage) {
  return (
    error?.payload?.error ||
    error?.payload?.message ||
    error?.message ||
    fallbackMessage
  );
}

function createFlash(type, message) {
  return {
    id: Date.now(),
    type,
    message,
  };
}

function App() {
  const [route, setRoute] = useState(() => matchRoute(window.location.pathname));
  const [authState, setAuthState] = useState({
    status: "booting",
    user: null,
  });
  const [tasksState, setTasksState] = useState({
    items: [],
    loading: false,
  });
  const [pendingAction, setPendingAction] = useState("");
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    function handlePopState() {
      startTransition(() => {
        setRoute(matchRoute(window.location.pathname));
      });
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function bootstrapSession() {
      try {
        const user = await usersApi.me();

        if (ignore) {
          return;
        }

        setAuthState({
          status: "authenticated",
          user,
        });
      } catch (error) {
        if (ignore) {
          return;
        }

        if (error.status === 401) {
          setAuthState({
            status: "anonymous",
            user: null,
          });
          return;
        }

        setAuthState({
          status: "anonymous",
          user: null,
        });
        setFlash(
          createFlash("error", "Nao foi possivel restaurar a sessao inicial.")
        );
      }
    }

    bootstrapSession();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!flash) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFlash(null);
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [flash]);

  function navigate(nextPath, options = {}) {
    const normalizedPath = normalizePath(nextPath);

    if (normalizedPath === route.normalizedPath) {
      return;
    }

    if (options.replace) {
      window.history.replaceState({}, "", normalizedPath);
    } else {
      window.history.pushState({}, "", normalizedPath);
    }

    if (typeof window.scrollTo === "function") {
      window.scrollTo(0, 0);
    }

    startTransition(() => {
      setRoute(matchRoute(normalizedPath));
    });
  }

  function expireSession(message) {
    setPendingAction("");
    setAuthState({
      status: "anonymous",
      user: null,
    });
    setTasksState({
      items: [],
      loading: false,
    });
    setFlash(createFlash("info", message));
    navigate(routePaths.login, { replace: true });
  }

  useEffect(() => {
    if (authState.status === "booting") {
      return;
    }

    const currentRoute = matchRoute(window.location.pathname);

    if (
      authState.status === "anonymous" &&
      protectedRouteNames.has(currentRoute.name)
    ) {
      navigate(routePaths.login, { replace: true });
      return;
    }

    if (
      authState.status === "authenticated" &&
      (
        currentRoute.name === "home" ||
        currentRoute.name === "login" ||
        currentRoute.name === "register"
      )
    ) {
      navigate(routePaths.tasks, { replace: true });
    }
  }, [authState.status, route.normalizedPath]);

  useEffect(() => {
    if (authState.status !== "authenticated") {
      setTasksState({
        items: [],
        loading: false,
      });
      return;
    }

    let ignore = false;

    async function loadTasks() {
      setTasksState((currentState) => ({
        ...currentState,
        loading: true,
      }));

      try {
        const items = await tasksApi.list();

        if (ignore) {
          return;
        }

        setTasksState({
          items: Array.isArray(items) ? items : [],
          loading: false,
        });
      } catch (error) {
        if (ignore) {
          return;
        }

        if (error.status === 401) {
          expireSession("Sua sessao expirou. Entre novamente.");
          return;
        }

        setTasksState((currentState) => ({
          ...currentState,
          loading: false,
        }));
        setFlash(
          createFlash(
            "error",
            getErrorMessage(error, "Nao foi possivel carregar as tarefas.")
          )
        );
      }
    }

    loadTasks();

    return () => {
      ignore = true;
    };
  }, [authState.status]);

  async function handleLogin(credentials) {
    setPendingAction("login");

    try {
      const response = await usersApi.login(
        buildLoginPayload(credentials.identifier, credentials.password)
      );

      setAuthState({
        status: "authenticated",
        user: response.user,
      });
      setTasksState({
        items: [],
        loading: false,
      });
      setFlash(createFlash("success", "Sessao iniciada com sucesso."));
      navigate(routePaths.tasks, { replace: true });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Nao foi possivel concluir o login."));
    } finally {
      setPendingAction("");
    }
  }

  async function handleRegister(payload) {
    setPendingAction("register");

    try {
      await usersApi.register(payload);

      const loginResponse = await usersApi.login({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      });

      setAuthState({
        status: "authenticated",
        user: loginResponse.user,
      });
      setTasksState({
        items: [],
        loading: false,
      });
      setFlash(createFlash("success", "Conta criada e sessao iniciada."));
      navigate(routePaths.tasks, { replace: true });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Nao foi possivel criar a conta agora."));
    } finally {
      setPendingAction("");
    }
  }

  async function handleLogout() {
    setPendingAction("logout");

    try {
      await usersApi.logout();
      setFlash(createFlash("info", "Sessao encerrada."));
    } catch (error) {
      if (error.status !== 401) {
        setFlash(
          createFlash(
            "error",
            "A sessao local foi encerrada, mas o backend nao confirmou o logout."
          )
        );
      }
    } finally {
      setPendingAction("");
      navigate(routePaths.home, { replace: true });
      setAuthState({
        status: "anonymous",
        user: null,
      });
      setTasksState({
        items: [],
        loading: false,
      });
    }
  }

  async function handleCreateTask(title) {
    setPendingAction("create-task");

    try {
      const createdTask = await tasksApi.create({ title });

      setTasksState((currentState) => ({
        ...currentState,
        items: [createdTask, ...currentState.items],
      }));
      setFlash(createFlash("success", "Tarefa criada."));

      if (route.name === "taskNew") {
        navigate(routePaths.tasks, { replace: true });
      }
    } catch (error) {
      if (error.status === 401) {
        expireSession("Sua sessao expirou. Entre novamente.");
        throw new Error("Sessao expirada.");
      }

      throw new Error(getErrorMessage(error, "Nao foi possivel criar a tarefa."));
    } finally {
      setPendingAction("");
    }
  }

  async function handleUpdateTask(taskId, payload) {
    setPendingAction(`update-task-${taskId}`);

    try {
      const response = await tasksApi.update(taskId, payload);

      setTasksState((currentState) => ({
        ...currentState,
        items: currentState.items.map((task) =>
          task.id === taskId ? response.task : task
        ),
      }));
      setFlash(createFlash("success", "Tarefa atualizada."));
      navigate(routePaths.tasks, { replace: true });
    } catch (error) {
      if (error.status === 401) {
        expireSession("Sua sessao expirou. Entre novamente.");
        throw new Error("Sessao expirada.");
      }

      throw new Error(
        getErrorMessage(error, "Nao foi possivel atualizar a tarefa.")
      );
    } finally {
      setPendingAction("");
    }
  }

  async function handleToggleTask(task) {
    setPendingAction(`toggle-task-${task.id}`);

    try {
      const response = await tasksApi.update(task.id, {
        done: !task.done,
      });

      setTasksState((currentState) => ({
        ...currentState,
        items: currentState.items.map((currentTask) =>
          currentTask.id === task.id ? response.task : currentTask
        ),
      }));
    } catch (error) {
      if (error.status === 401) {
        expireSession("Sua sessao expirou. Entre novamente.");
        return;
      }

      setFlash(
        createFlash(
          "error",
          getErrorMessage(error, "Nao foi possivel alterar o estado da tarefa.")
        )
      );
    } finally {
      setPendingAction("");
    }
  }

  async function handleDeleteTask(task) {
    setPendingAction(`delete-task-${task.id}`);

    try {
      await tasksApi.delete(task.id);

      setTasksState((currentState) => ({
        ...currentState,
        items: currentState.items.filter(
          (currentTask) => currentTask.id !== task.id
        ),
      }));
      setFlash(createFlash("info", "Tarefa removida."));

      if (route.name === "taskEdit" && Number(route.params.taskId) === task.id) {
        navigate(routePaths.tasks, { replace: true });
      }
    } catch (error) {
      if (error.status === 401) {
        expireSession("Sua sessao expirou. Entre novamente.");
        return;
      }

      throw new Error(getErrorMessage(error, "Nao foi possivel excluir a tarefa."));
    } finally {
      setPendingAction("");
    }
  }

  async function handleSaveProfile(payload) {
    setPendingAction("profile");

    try {
      const response = await usersApi.update(authState.user.id, payload);

      setAuthState({
        status: "authenticated",
        user: response.user,
      });
      setFlash(createFlash("success", "Perfil atualizado."));
    } catch (error) {
      if (error.status === 401) {
        expireSession("Sua sessao expirou. Entre novamente.");
        throw new Error("Sessao expirada.");
      }

      throw new Error(getErrorMessage(error, "Nao foi possivel atualizar o perfil."));
    } finally {
      setPendingAction("");
    }
  }

  async function handleDeleteAccount() {
    setPendingAction("delete-account");

    try {
      await usersApi.delete(authState.user.id);

      navigate(routePaths.home, { replace: true });
      setAuthState({
        status: "anonymous",
        user: null,
      });
      setTasksState({
        items: [],
        loading: false,
      });
      setFlash(createFlash("info", "Conta removida com sucesso."));
    } catch (error) {
      if (error.status === 401) {
        expireSession("Sua sessao expirou. Entre novamente.");
        return;
      }

      throw new Error(getErrorMessage(error, "Nao foi possivel excluir a conta."));
    } finally {
      setPendingAction("");
    }
  }

  function renderPage() {
    if (authState.status === "booting") {
      return <LoadingView />;
    }

    if (
      authState.status !== "authenticated" &&
      protectedRouteNames.has(route.name)
    ) {
      return (
        <LoadingView
          eyebrow="Redirecionando"
          title="Voce precisa entrar antes de acessar esta rota."
          copy="A aplicacao esta voltando para a pagina de autenticacao."
        />
      );
    }

    if (
      authState.status === "authenticated" &&
      (route.name === "login" || route.name === "register" || route.name === "home")
    ) {
      return (
        <LoadingView
          eyebrow="Abrindo painel"
          title="Sua sessao ja esta ativa."
          copy="Redirecionando para a rota principal das tarefas."
        />
      );
    }

    switch (route.name) {
      case "home":
        return <HomePage onNavigate={navigate} />;
      case "login":
        return (
          <AuthPage
            isBusy={pendingAction === "login"}
            mode="login"
            onLogin={handleLogin}
            onNavigate={navigate}
            onRegister={handleRegister}
          />
        );
      case "register":
        return (
          <AuthPage
            isBusy={pendingAction === "register"}
            mode="register"
            onLogin={handleLogin}
            onNavigate={navigate}
            onRegister={handleRegister}
          />
        );
      case "tasks":
      case "taskNew":
      case "taskEdit":
        return (
          <TasksPage
            isBusy={Boolean(pendingAction)}
            isLoading={tasksState.loading}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
            onNavigate={navigate}
            onToggleTask={handleToggleTask}
            onUpdateTask={handleUpdateTask}
            route={route}
            tasks={tasksState.items}
            user={authState.user}
          />
        );
      case "profile":
        return (
          <ProfilePage
            isBusy={Boolean(pendingAction)}
            onDeleteAccount={handleDeleteAccount}
            onSaveProfile={handleSaveProfile}
            tasks={tasksState.items}
            user={authState.user}
          />
        );
      default:
        return (
          <NotFoundPage
            hasSession={authState.status === "authenticated"}
            onNavigate={navigate}
          />
        );
    }
  }

  return (
    <AppShell
      isLoggingOut={pendingAction === "logout"}
      onLogout={handleLogout}
      onNavigate={navigate}
      route={route}
      user={authState.user}
    >
      <FlashMessage flash={flash} onDismiss={() => setFlash(null)} />
      {renderPage()}
    </AppShell>
  );
}

export default App;
