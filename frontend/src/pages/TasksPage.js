import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import AppLink from "../components/AppLink";
import TaskCard from "../components/TaskCard";
import TaskEditor from "../components/TaskEditor";
import { pluralizeTasks } from "../lib/formatters";
import { routePaths } from "../lib/router";

const filters = [
  { value: "all", label: "Todas" },
  { value: "open", label: "Em aberto" },
  { value: "done", label: "Concluidas" },
];

export default function TasksPage({
  isBusy,
  isLoading,
  onCreateTask,
  onDeleteTask,
  onNavigate,
  onToggleTask,
  onUpdateTask,
  route,
  tasks,
  user,
}) {
  const [createTitle, setCreateTitle] = useState("");
  const [createError, setCreateError] = useState("");
  const [listError, setListError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const composerRef = useRef(null);

  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const currentTaskId =
    route.name === "taskEdit" ? Number(route.params.taskId) : null;
  const currentTask =
    route.name === "taskEdit"
      ? tasks.find((task) => task.id === currentTaskId) || null
      : null;
  const isCreateDisabled = isBusy || isLoading;

  useEffect(() => {
    if (route.name !== "taskNew" || !composerRef.current) {
      return;
    }

    composerRef.current.focus();
  }, [route.name]);

  const completedTasks = tasks.filter((task) => task.done).length;
  const openTasks = tasks.length - completedTasks;
  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "open" && !task.done) ||
      (filter === "done" && task.done);

    const matchesSearch =
      !deferredSearch || task.title.toLowerCase().includes(deferredSearch);

    return matchesFilter && matchesSearch;
  });
  const filteredCountLabel = pluralizeTasks(filteredTasks.length);
  const hasActiveFilters = filter !== "all" || Boolean(deferredSearch);
  const openFilteredTasks = filteredTasks.filter((task) => !task.done);
  const doneFilteredTasks = filteredTasks.filter((task) => task.done);
  const taskGroups =
    filter === "all"
      ? [
          {
            id: "open",
            title: "Em aberto",
            description: `${openFilteredTasks.length} item${openFilteredTasks.length === 1 ? "" : "s"}`,
            items: openFilteredTasks,
          },
          {
            id: "done",
            title: "Concluidas",
            description: `${doneFilteredTasks.length} item${doneFilteredTasks.length === 1 ? "" : "s"}`,
            items: doneFilteredTasks,
          },
        ]
      : [
          {
            id: filter,
            title: filter === "done" ? "Concluidas" : "Em aberto",
            description: filteredCountLabel,
            items: filteredTasks,
          },
        ];
  const selectionTitle = currentTask
    ? currentTask.title
    : openTasks === 0
      ? "Tudo em dia por aqui."
      : "Selecione uma tarefa para revisar.";

  async function handleCreateTask(event) {
    event.preventDefault();

    if (!createTitle.trim()) {
      setCreateError("Digite um titulo antes de criar a tarefa.");
      return;
    }

    setCreateError("");
    setListError("");

    try {
      await onCreateTask(createTitle.trim());
      setCreateTitle("");
    } catch (submissionError) {
      setCreateError(
        submissionError.message || "Nao foi possivel criar a tarefa agora."
      );
    }
  }

  async function handleDelete(task) {
    const shouldDelete = window.confirm(
      `Excluir a tarefa "${task.title}"? Esta acao nao pode ser desfeita.`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setListError("");
      await onDeleteTask(task);
    } catch (submissionError) {
      setListError(
        submissionError.message || "Nao foi possivel excluir a tarefa."
      );
    }
  }

  function handleSearchChange(event) {
    const { value } = event.target;

    startTransition(() => {
      setSearch(value);
    });
  }

  return (
    <div className="dashboard dashboard--tasks">
      <section className="workspace-header workspace-header--tasks workspace-header--tasks-compact">
        <div className="workspace-header__copy">
          <p className="eyebrow">Painel</p>
          <h1 className="page-title">
            {user?.username ? `${user.username}, suas tarefas` : "Suas tarefas"}
          </h1>
        </div>

        <div className="workspace-header__actions workspace-header__actions--tasks">
          <AppLink
            className="button button--secondary"
            onNavigate={onNavigate}
            to={routePaths.profile}
          >
            Ver perfil
          </AppLink>
        </div>
      </section>

      <div className="tasks-layout">
        <section className="surface surface--stack tasks-hub">
          <div className="tasks-hub__header">
            <div>
              <p className="eyebrow">Hoje</p>
              <h2 className="section-title">Organize o que precisa acontecer.</h2>
            </div>

            <div className="tasks-hub__stats">
              <div className="tasks-hub__stat">
                <span>Em aberto</span>
                <strong>{openTasks}</strong>
              </div>
              <div className="tasks-hub__stat">
                <span>Concluidas</span>
                <strong>{completedTasks}</strong>
              </div>
              <div className="tasks-hub__stat">
                <span>Progresso</span>
                <strong>{completionRate}%</strong>
              </div>
            </div>
          </div>

          <section className="quick-capture quick-capture--inline">
            <form className="stack-form stack-form--composer" onSubmit={handleCreateTask}>
              <label className="field field--composer" htmlFor="create-task">
                <span className="field__label">Titulo da tarefa</span>
                <textarea
                  className="field__control field__control--textarea field__control--composer"
                  disabled={isCreateDisabled}
                  id="create-task"
                  name="create-task"
                  onChange={(event) => setCreateTitle(event.target.value)}
                  placeholder="Adicione uma tarefa e pressione criar"
                  ref={composerRef}
                  rows="2"
                  value={createTitle}
                />
              </label>

              {createError ? (
                <div className="inline-alert inline-alert--error">{createError}</div>
              ) : null}

              <div className="action-row action-row--composer">
                <button className="button" disabled={isCreateDisabled} type="submit">
                  {isBusy
                    ? "Salvando..."
                    : isLoading
                      ? "Carregando..."
                      : "Criar tarefa"}
                </button>

                <button
                  className="button button--ghost"
                  disabled={isCreateDisabled || !createTitle}
                  onClick={() => {
                    setCreateTitle("");
                    setCreateError("");
                  }}
                  type="button"
                >
                  Limpar
                </button>
                {route.name === "taskNew" ? (
                  <button
                    className="button button--ghost"
                    onClick={() => onNavigate(routePaths.tasks)}
                    type="button"
                  >
                    Fechar criacao
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="task-board task-board--flat">
            <div className="task-board__top task-board__top--aligned">
              <div>
                <p className="eyebrow">Lista principal</p>
                <h2 className="section-title">Tudo que precisa da sua atencao</h2>
              </div>

              <p className="task-board__summary">
                {hasActiveFilters ? `${filteredCountLabel} nesta visao` : `${filteredCountLabel} no painel`}
              </p>
            </div>

            <div className="task-toolbar task-toolbar--tasks">
              <label className="field task-toolbar__search" htmlFor="task-search">
                <span className="field__label">Buscar</span>
                <input
                  className="field__control"
                  id="task-search"
                  onChange={handleSearchChange}
                  placeholder="Procure por um titulo"
                  type="search"
                  value={search}
                />
              </label>

              <div className="filter-group">
                {filters.map((filterOption) => (
                  <button
                    className={`filter-chip ${
                      filter === filterOption.value ? "is-active" : ""
                    }`}
                    key={filterOption.value}
                    onClick={() => setFilter(filterOption.value)}
                    type="button"
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>

            {listError ? (
              <div className="inline-alert inline-alert--error">{listError}</div>
            ) : null}

            {isLoading ? (
              <div className="empty-state">
                <div className="loader" aria-hidden="true" />
                <p>Carregando tarefas...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state__title">Nenhuma tarefa nesta visao.</p>
                <p className="page-copy">
                  Ajuste o filtro, limpe a busca ou crie um novo item para preencher o painel.
                </p>
              </div>
            ) : (
              <div className="task-groups">
                {taskGroups.map((group) => {
                  if (group.items.length === 0) {
                    return null;
                  }

                  return (
                    <section className="task-group" key={group.id}>
                      <header className="task-group__header">
                        <div>
                          <h3 className="task-group__title">{group.title}</h3>
                          <p className="task-group__meta">{group.description}</p>
                        </div>
                      </header>

                      <div className="task-list">
                        {group.items.map((task) => (
                          <TaskCard
                            isBusy={isBusy}
                            isEditing={currentTask?.id === task.id}
                            key={task.id}
                            onDelete={handleDelete}
                            onNavigate={onNavigate}
                            onToggle={onToggleTask}
                            task={task}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </section>

          {route.name === "taskEdit" ? (
            <TaskEditor
              isBusy={isBusy}
              onCancel={() => onNavigate(routePaths.tasks)}
              onSave={onUpdateTask}
              task={currentTask}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}
