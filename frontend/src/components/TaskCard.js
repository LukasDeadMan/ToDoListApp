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
      <div className="task-card__header">
        <button
          aria-label={
            task.done ? "Marcar tarefa como aberta" : "Marcar tarefa como concluida"
          }
          className={`status-toggle ${task.done ? "is-complete" : ""}`}
          disabled={isBusy}
          onClick={() => onToggle(task)}
          type="button"
        >
          {task.done ? "Feita" : "Aberta"}
        </button>

        <span className="task-card__timestamp">
          {formatTaskDate(task.created_at)}
        </span>
      </div>

      <div className="task-card__body">
        <h3>{task.title}</h3>
        <p>
          {task.done
            ? "Concluida e pronta para sair da lista."
            : "Ainda em andamento. Ajuste, conclua ou continue depois."}
        </p>
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
