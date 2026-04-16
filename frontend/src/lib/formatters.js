const taskDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatTaskDate(value) {
  if (!value) {
    return "data indisponivel";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "data indisponivel";
  }

  return taskDateFormatter.format(date);
}

export function pluralizeTasks(total) {
  return total === 1 ? "1 tarefa" : `${total} tarefas`;
}
