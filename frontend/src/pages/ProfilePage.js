import { useEffect, useState } from "react";

export default function ProfilePage({
  isBusy,
  onDeleteAccount,
  onSaveProfile,
  tasks,
  user,
}) {
  const [form, setForm] = useState({
    username: user?.username || "",
    nickname: user?.nickname || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      username: user?.username || "",
      nickname: user?.nickname || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
    setError("");
  }, [user]);

  const completedTasks = tasks.filter((task) => task.done).length;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.username.trim() || !form.nickname.trim() || !form.email.trim()) {
      setError("Nome, nickname e email sao obrigatorios.");
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      setError("As senhas precisam ser iguais.");
      return;
    }

    const payload = {};

    if (form.username.trim() !== user.username) {
      payload.username = form.username.trim();
    }

    if (form.nickname.trim() !== user.nickname) {
      payload.nickname = form.nickname.trim();
    }

    if (form.email.trim() !== user.email) {
      payload.email = form.email.trim();
    }

    if (form.password) {
      payload.password = form.password;
    }

    if (Object.keys(payload).length === 0) {
      setError("Nao ha alteracoes para salvar.");
      return;
    }

    try {
      await onSaveProfile(payload);
      setForm((currentForm) => ({
        ...currentForm,
        password: "",
        confirmPassword: "",
      }));
    } catch (submissionError) {
      setError(
        submissionError.message || "Nao foi possivel atualizar o perfil."
      );
    }
  }

  async function handleDelete() {
    const shouldDelete = window.confirm(
      "Excluir a conta e todas as tarefas vinculadas?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      await onDeleteAccount();
    } catch (submissionError) {
      setError(
        submissionError.message || "Nao foi possivel excluir a conta."
      );
    }
  }

  return (
    <div className="profile-layout">
      <section className="workspace-header workspace-header--profile">
        <div className="workspace-header__copy">
          <p className="eyebrow">Perfil</p>
          <h1 className="page-title">Conta e preferencias</h1>
          <p className="page-copy">
            Atualize seus dados e acompanhe um resumo rapido da atividade.
          </p>
        </div>
      </section>

      <section className="summary-strip">
        <div className="summary-grid">
          <article className="summary-chip">
            <span>Nickname</span>
            <strong>@{user.nickname}</strong>
          </article>

          <article className="summary-chip">
            <span>Total de tarefas</span>
            <strong>{tasks.length}</strong>
          </article>

          <article className="summary-chip">
            <span>Concluidas</span>
            <strong>{completedTasks}</strong>
          </article>
        </div>
      </section>

      <div className="content-grid content-grid--profile">
        <section className="surface surface--stack">
          <p className="eyebrow">Dados da conta</p>
          <h2 className="section-title">Atualize nome, identificadores e senha.</h2>

          <form className="stack-form" onSubmit={handleSubmit}>
            <label className="field" htmlFor="profile-username">
              <span className="field__label">Nome</span>
              <input
                className="field__control"
                id="profile-username"
                name="username"
                onChange={handleChange}
                type="text"
                value={form.username}
              />
            </label>

            <div className="field-grid">
              <label className="field" htmlFor="profile-nickname">
                <span className="field__label">Nickname</span>
                <input
                  className="field__control"
                  id="profile-nickname"
                  name="nickname"
                  onChange={handleChange}
                  type="text"
                  value={form.nickname}
                />
              </label>

              <label className="field" htmlFor="profile-email">
                <span className="field__label">Email</span>
                <input
                  className="field__control"
                  id="profile-email"
                  name="email"
                  onChange={handleChange}
                  type="email"
                  value={form.email}
                />
              </label>
            </div>

            <div className="field-grid">
              <label className="field" htmlFor="profile-password">
                <span className="field__label">Nova senha</span>
                <input
                  className="field__control"
                  id="profile-password"
                  name="password"
                  onChange={handleChange}
                  placeholder="Deixe vazio para manter"
                  type="password"
                  value={form.password}
                />
              </label>

              <label className="field" htmlFor="profile-confirm-password">
                <span className="field__label">Confirmacao</span>
                <input
                  className="field__control"
                  id="profile-confirm-password"
                  name="confirmPassword"
                  onChange={handleChange}
                  placeholder="Repita a nova senha"
                  type="password"
                  value={form.confirmPassword}
                />
              </label>
            </div>

            {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

            <button className="button" disabled={isBusy} type="submit">
              {isBusy ? "Salvando..." : "Salvar perfil"}
            </button>
          </form>
        </section>

        <section className="surface surface--stack danger-zone">
          <p className="eyebrow">Zona critica</p>
          <h2 className="section-title">Exclusao permanente da conta.</h2>
          <p className="page-copy">
            Se voce confirmar, a conta e todas as tarefas associadas serao removidas de forma definitiva.
          </p>

          <button
            className="button button--danger"
            disabled={isBusy}
            onClick={handleDelete}
            type="button"
          >
            {isBusy ? "Processando..." : "Excluir conta"}
          </button>
        </section>
      </div>
    </div>
  );
}
