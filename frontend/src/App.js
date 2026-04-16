import { startTransition, useCallback, useEffect, useState } from "react";
import "./App.css";
import AppShell from "./components/AppShell";
import FlashMessage from "./components/FlashMessage";
import LoadingView from "./components/LoadingView";
import useAuth from "./hooks/useAuth";
import useTasks from "./hooks/useTasks";
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

function App() {
  const [route, setRoute] = useState(() => matchRoute(window.location.pathname));
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
    if (!flash) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFlash(null);
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [flash]);

  const navigate = useCallback(
    (nextPath, options = {}) => {
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
    },
    [route.normalizedPath]
  );

  const {
    authState,
    pendingAction: authPendingAction,
    expireSession,
    handleDeleteAccount,
    handleLogin,
    handleLogout,
    handleRegister,
    handleSaveProfile,
  } = useAuth({
    navigate,
    setFlash,
  });

  const {
    pendingAction: tasksPendingAction,
    tasksState,
    handleCreateTask,
    handleDeleteTask,
    handleToggleTask,
    handleUpdateTask,
  } = useTasks({
    authState,
    navigate,
    onSessionExpired: expireSession,
    route,
    setFlash,
  });

  const isBusy = Boolean(authPendingAction || tasksPendingAction);

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
  }, [authState.status, navigate, route.normalizedPath]);

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
            isBusy={authPendingAction === "login"}
            mode="login"
            onLogin={handleLogin}
            onNavigate={navigate}
            onRegister={handleRegister}
          />
        );
      case "register":
        return (
          <AuthPage
            isBusy={authPendingAction === "register"}
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
            isBusy={isBusy}
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
            isBusy={isBusy}
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
      isLoggingOut={authPendingAction === "logout"}
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
