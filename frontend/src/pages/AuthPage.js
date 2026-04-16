import { useEffect, useState } from "react";
import AppLink from "../components/AppLink";
import { getPasswordChecklist, validatePasswordStrength } from "../lib/auth";
import { routePaths } from "../lib/router";

function getInitialForm(mode) {
  if (mode === "register") {
    return {
      username: "",
      nickname: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
  }

  return {
    identifier: "",
    password: "",
  };
}

export default function AuthPage({ isBusy, mode, onLogin, onNavigate, onRegister }) {
  const [form, setForm] = useState(() => getInitialForm(mode));
  const [error, setError] = useState("");

  const isRegister = mode === "register";
  const passwordChecklist = getPasswordChecklist(form.password);

  useEffect(() => {
    setForm(getInitialForm(mode));
    setError("");
  }, [mode]);

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

    try {
      if (isRegister) {
        if (
          !form.username.trim() ||
          !form.nickname.trim() ||
          !form.email.trim() ||
          !form.password.trim()
        ) {
          setError("Preencha username, nickname, email e senha.");
          return;
        }

        if (form.password !== form.confirmPassword) {
          setError("As senhas precisam ser iguais.");
          return;
        }

        const passwordError = validatePasswordStrength(form.password);
        if (passwordError) {
          setError(passwordError);
          return;
        }

        await onRegister({
          username: form.username.trim(),
          nickname: form.nickname.trim(),
          email: form.email.trim(),
          password: form.password,
        });

        return;
      }

      if (!form.identifier.trim() || !form.password.trim()) {
        setError("Informe email ou nickname, junto da senha.");
        return;
      }

      await onLogin({
        identifier: form.identifier.trim(),
        password: form.password,
      });
    } catch (submissionError) {
      setError(submissionError.message || "Nao foi possivel autenticar agora.");
    }
  }

  return (
    <div className="auth-stage">
      <section className="surface surface--stack auth-panel">
        <div className="auth-panel__copy">
          <p className="eyebrow">{isRegister ? "Criar conta" : "Entrar"}</p>
          <h1 className="section-title">
            {isRegister ? "Abra seu workspace em poucos segundos." : "Acesse seu painel."}
          </h1>
          <p className="page-copy">
            {isRegister
              ? "Configure seus dados basicos para comecar a organizar tarefas, backlog e prioridades."
              : "Entre com email ou nickname para voltar ao fluxo principal."}
          </p>
        </div>

        <form className="stack-form auth-form" onSubmit={handleSubmit}>
          {isRegister ? (
            <>
              <label className="field" htmlFor="register-username">
                <span className="field__label">Nome</span>
                <input
                  className="field__control"
                  id="register-username"
                  name="username"
                  onChange={handleChange}
                  placeholder="Como seu nome deve aparecer"
                  type="text"
                  value={form.username || ""}
                />
              </label>

              <div className="field-grid">
                <label className="field" htmlFor="register-nickname">
                  <span className="field__label">Nickname</span>
                  <input
                    className="field__control"
                    id="register-nickname"
                    name="nickname"
                    onChange={handleChange}
                    placeholder="@apelido"
                    type="text"
                    value={form.nickname || ""}
                  />
                </label>

                <label className="field" htmlFor="register-email">
                  <span className="field__label">Email</span>
                  <input
                    className="field__control"
                    id="register-email"
                    name="email"
                    onChange={handleChange}
                    placeholder="voce@exemplo.com"
                    type="email"
                    value={form.email || ""}
                  />
                </label>
              </div>

              <div className="field-grid">
                <label className="field" htmlFor="register-password">
                  <span className="field__label">Senha</span>
                  <input
                    className="field__control"
                    id="register-password"
                    name="password"
                    onChange={handleChange}
                    placeholder="Crie uma senha forte"
                    type="password"
                    value={form.password || ""}
                  />
                </label>

                <label className="field" htmlFor="register-confirm-password">
                  <span className="field__label">Confirmacao</span>
                  <input
                    className="field__control"
                    id="register-confirm-password"
                    name="confirmPassword"
                    onChange={handleChange}
                    placeholder="Repita a senha"
                    type="password"
                    value={form.confirmPassword || ""}
                  />
                </label>
              </div>

              <div className="password-guidance">
                <p className="field__label">Senha recomendada</p>
                <div className="password-checklist">
                  {passwordChecklist.map((check) => (
                    <div
                      className={`password-check ${check.valid ? "is-valid" : ""}`}
                      key={check.id}
                    >
                      <span className="password-check__dot" />
                      <span>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <label className="field" htmlFor="login-identifier">
                <span className="field__label">Email ou nickname</span>
                <input
                  className="field__control"
                  id="login-identifier"
                  name="identifier"
                  onChange={handleChange}
                  placeholder="voce@exemplo.com ou @apelido"
                  type="text"
                  value={form.identifier || ""}
                />
              </label>

              <label className="field" htmlFor="login-password">
                <span className="field__label">Senha</span>
                <input
                  className="field__control"
                  id="login-password"
                  name="password"
                  onChange={handleChange}
                  placeholder="Sua senha"
                  type="password"
                  value={form.password || ""}
                />
              </label>
            </>
          )}

          {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

          <button className="button button--full" disabled={isBusy} type="submit">
            {isBusy ? "Processando..." : isRegister ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <div className="auth-switch">
          <span>{isRegister ? "Ja tem conta?" : "Ainda nao tem conta?"}</span>
          <AppLink
            className="text-link"
            onNavigate={onNavigate}
            to={isRegister ? routePaths.login : routePaths.register}
          >
            {isRegister ? "Fazer login" : "Criar conta"}
          </AppLink>
        </div>
      </section>
    </div>
  );
}
