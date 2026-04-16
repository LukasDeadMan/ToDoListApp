import { useEffect, useRef, useState } from "react";
import { createFlash, getErrorMessage } from "../lib/feedback";
import { routePaths } from "../lib/router";
import { tasksApi } from "../services/tasks";

const initialTasksState = {
  items: [],
  loading: false,
};

export default function useTasks({
  authState,
  navigate,
  onSessionExpired,
  route,
  setFlash,
}) {
  const [tasksState, setTasksState] = useState(initialTasksState);
  const [pendingAction, setPendingAction] = useState("");

  const navigateRef = useRef(navigate);
  const onSessionExpiredRef = useRef(onSessionExpired);
  const setFlashRef = useRef(setFlash);

  useEffect(() => {
    navigateRef.current = navigate;
    onSessionExpiredRef.current = onSessionExpired;
    setFlashRef.current = setFlash;
  }, [navigate, onSessionExpired, setFlash]);

  function pushFlash(type, message) {
    setFlashRef.current(createFlash(type, message));
  }

  function redirect(path, options = {}) {
    navigateRef.current(path, options);
  }

  function expireSession(message) {
    setTasksState(initialTasksState);
    onSessionExpiredRef.current(message);
  }

  useEffect(() => {
    if (authState.status !== "authenticated") {
      setTasksState(initialTasksState);
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
        pushFlash(
          "error",
          getErrorMessage(error, "Nao foi possivel carregar as tarefas.")
        );
      }
    }

    loadTasks();

    return () => {
      ignore = true;
    };
  }, [authState.status]);

  async function handleCreateTask(title) {
    setPendingAction("create-task");

    try {
      const createdTask = await tasksApi.create({ title });

      setTasksState((currentState) => ({
        ...currentState,
        items: [createdTask, ...currentState.items],
      }));
      pushFlash("success", "Tarefa criada.");

      if (route.name === "taskNew") {
        redirect(routePaths.tasks, { replace: true });
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
      pushFlash("success", "Tarefa atualizada.");
      redirect(routePaths.tasks, { replace: true });
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

      pushFlash(
        "error",
        getErrorMessage(error, "Nao foi possivel alterar o estado da tarefa.")
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
      pushFlash("info", "Tarefa removida.");

      if (route.name === "taskEdit" && Number(route.params.taskId) === task.id) {
        redirect(routePaths.tasks, { replace: true });
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

  return {
    pendingAction,
    tasksState,
    handleCreateTask,
    handleDeleteTask,
    handleToggleTask,
    handleUpdateTask,
  };
}
