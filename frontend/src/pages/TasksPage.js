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
    <div className="dashboard">
      <section className="workspace-header">
        <div className="workspace-header__copy">
          <p className="eyebrow">Painel</p>
          <h1 className="page-title">
            {user?.username ? `${user.username}, suas tarefas` : "Suas tarefas"}
          </h1>
          <p className="page-copy">
            {openTasks} em aberto, {completedTasks} concluidas.
          </p>
        </div>

        <div className="workspace-header__actions">
          <AppLink className="button" onNavigate={onNavigate} to={routePaths.newTask}>
            Nova tarefa
          </AppLink>

          <AppLink
            className="button button--secondary"
            onNavigate={onNavigate}
            to={routePaths.profile}
          >
            Ver perfil
          </AppLink>
        </div>
      </section>

      <section className="summary-strip">
        <article className="stat-card">
          <span className="stat-card__label">Total</span>
          <strong>{pluralizeTasks(tasks.length)}</strong>
        </article>

        <article className="stat-card">
          <span className="stat-card__label">Em aberto</span>
          <strong>{openTasks}</strong>
        </article>

        <article className="stat-card">
          <span className="stat-card__label">Concluidas</span>
          <strong>{completedTasks}</strong>
        </article>

        <article className="stat-card">
          <span className="stat-card__label">Progresso</span>
          <strong>{completionRate}%</strong>
        </article>
      </section>

      <div className="content-grid">
        <section className="surface surface--stack">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Nova tarefa</p>
              <h2 className="section-title">
                {route.name === "taskNew"
                  ? "Criacao em foco"
                  : "Adicione um item sem sair da lista"}
              </h2>
            </div>

            {route.name === "taskNew" ? (
              <button
                className="button button--ghost"
                onClick={() => onNavigate(routePaths.tasks)}
                type="button"
              >
                Fechar modo criacao
              </button>
            ) : null}
          </div>

          <form className="stack-form" onSubmit={handleCreateTask}>
            <label className="field" htmlFor="create-task">
              <span className="field__label">Titulo da tarefa</span>
              <textarea
                className="field__control field__control--textarea"
                id="create-task"
                name="create-task"
                onChange={(event) => setCreateTitle(event.target.value)}
                placeholder="Ex.: revisar pendencias da semana"
                ref={composerRef}
                rows="3"
                value={createTitle}
              />
            </label>

            {createError ? (
              <div className="inline-alert inline-alert--error">{createError}</div>
            ) : null}

            <div className="action-row">
              <button className="button" disabled={isBusy} type="submit">
                {isBusy ? "Salvando..." : "Criar tarefa"}
              </button>

              <button
                className="button button--ghost"
                disabled={isBusy || !createTitle}
                onClick={() => {
                  setCreateTitle("");
                  setCreateError("");
                }}
                type="button"
              >
                Limpar
              </button>
            </div>
          </form>
        </section>

        <section className="surface surface--stack">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Lista</p>
              <h2 className="section-title">Seus itens</h2>
            </div>

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

          <label className="field" htmlFor="task-search">
            <span className="field__label">Buscar tarefa</span>
            <input
              className="field__control"
              id="task-search"
              onChange={handleSearchChange}
              placeholder="Procure por um titulo"
              type="search"
              value={search}
            />
          </label>

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
            <div className="task-list">
              {filteredTasks.map((task) => (
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
          )}
        </section>

        {route.name === "taskEdit" ? (
          <TaskEditor
            isBusy={isBusy}
            onCancel={() => onNavigate(routePaths.tasks)}
            onSave={onUpdateTask}
            task={currentTask}
          />
        ) : (
          <section className="surface surface--stack">
            <p className="eyebrow">Detalhes</p>
            <h2 className="section-title">Selecione uma tarefa para editar.</h2>
            <p className="page-copy">
              Abra um item da lista para revisar titulo e status sem perder o contexto do painel.
            </p>
            <AppLink
              className="button button--secondary"
              onNavigate={onNavigate}
              to={routePaths.newTask}
            >
              Nova tarefa
            </AppLink>
          </section>
        )}
      </div>
    </div>
  );
}
