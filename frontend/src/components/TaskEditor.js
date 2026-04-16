import { useEffect, useState } from "react";

export default function TaskEditor({ isBusy, onCancel, onSave, task }) {
  const [draft, setDraft] = useState({
    title: task?.title || "",
    done: Boolean(task?.done),
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft({
      title: task?.title || "",
      done: Boolean(task?.done),
    });
    setError("");
  }, [task]);

  function handleChange(event) {
    const { checked, name, type, value } = event.target;

    setDraft((currentDraft) => ({
      ...currentDraft,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!draft.title.trim()) {
      setError("O titulo da tarefa nao pode ficar vazio.");
      return;
    }

    setError("");

    try {
      await onSave(task.id, {
        title: draft.title.trim(),
        done: draft.done,
      });
    } catch (submissionError) {
      setError(
        submissionError.message || "Nao foi possivel atualizar esta tarefa."
      );
    }
  }

  if (!task) {
    return (
      <section className="surface surface--stack">
        <p className="eyebrow">Detalhes</p>
        <h2 className="section-title">Tarefa nao encontrada.</h2>
        <p className="page-copy">
          O item solicitado nao apareceu na lista carregada. Volte ao painel e
          escolha outra tarefa.
        </p>
        <button
          className="button button--secondary"
          onClick={onCancel}
          type="button"
        >
          Voltar ao painel
        </button>
      </section>
    );
  }

  return (
    <section className="surface surface--stack">
      <p className="eyebrow">Detalhes</p>
      <h2 className="section-title">Atualize titulo e status.</h2>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field" htmlFor="edit-title">
          <span className="field__label">Titulo</span>
          <textarea
            className="field__control field__control--textarea"
            id="edit-title"
            name="title"
            onChange={handleChange}
            rows="4"
            value={draft.title}
          />
        </label>

        <label className="checkbox-field" htmlFor="edit-done">
          <input
            checked={draft.done}
            id="edit-done"
            name="done"
            onChange={handleChange}
            type="checkbox"
          />
          <span>
            {draft.done
              ? "Marcar como concluida"
              : "Manter como tarefa em aberto"}
          </span>
        </label>

        {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

        <div className="action-row">
          <button className="button" disabled={isBusy} type="submit">
            {isBusy ? "Salvando..." : "Salvar ajustes"}
          </button>

          <button
            className="button button--ghost"
            disabled={isBusy}
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
