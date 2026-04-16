import AppLink from "./AppLink";
import { formatTaskDate } from "../lib/formatters";
import { routePaths } from "../lib/router";

export default function TaskCard({
  isBusy,
  isEditing,
  onDelete,
  onNavigate,
  onToggle,
  task,
}) {
  return (
    <article className={`task-card ${task.done ? "is-done" : ""}`}>
      <div className="task-card__main">
        <button
          aria-label={
            task.done ? "Marcar tarefa como aberta" : "Marcar tarefa como concluida"
          }
          className={`status-toggle ${task.done ? "is-complete" : ""}`}
          disabled={isBusy}
          onClick={() => onToggle(task)}
          type="button"
        >
          <span className="status-toggle__dot" />
        </button>

        <div className="task-card__body">
          <h3>{task.title}</h3>
          <span className="task-card__timestamp">
            {task.done ? "Concluida" : "Criada"} em {formatTaskDate(task.created_at)}
          </span>
        </div>
      </div>

      <div className="task-card__footer">
        <AppLink
          className={`text-link ${isEditing ? "is-current" : ""}`}
          onNavigate={onNavigate}
          to={routePaths.editTask(task.id)}
        >
          {isEditing ? "Editando agora" : "Editar"}
        </AppLink>

        <button
          className="text-link text-link--danger"
          disabled={isBusy}
          onClick={() => onDelete(task)}
          type="button"
        >
          Excluir
        </button>
      </div>
    </article>
  );
}
