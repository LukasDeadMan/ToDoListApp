import AppLink from "./AppLink";
import { routePaths } from "../lib/router";

const authenticatedLinks = [
  { to: routePaths.tasks, label: "Painel" },
  { to: routePaths.newTask, label: "Nova tarefa" },
  { to: routePaths.profile, label: "Perfil" },
];

function isLinkActive(route, targetPath) {
  if (targetPath === routePaths.tasks || targetPath === routePaths.newTask) {
    return (
      route.name === "tasks" ||
      route.name === "taskNew" ||
      route.name === "taskEdit"
    );
  }

  return route.normalizedPath === targetPath;
}

export default function AppShell({
  children,
  route,
  user,
  onNavigate,
  onLogout,
  isLoggingOut,
}) {
  if (!user) {
    return (
      <div className="app-shell app-shell--public">
        <div className="ambient ambient--one" />
        <div className="ambient ambient--two" />

        <div className="site-shell">
          <header className="site-header">
            <AppLink className="brand" onNavigate={onNavigate} to={routePaths.home}>
              <span className="brand__mark">TD</span>
              <span className="brand__copy">
                <strong>ToDoApp</strong>
                <small>organizacao com foco</small>
              </span>
            </AppLink>

            <div className="site-header__actions">
              <AppLink
                className={`text-link ${
                  route.normalizedPath === routePaths.login ? "is-current" : ""
                }`}
                onNavigate={onNavigate}
                to={routePaths.login}
              >
                Entrar
              </AppLink>
              <AppLink
                className="button button--small"
                onNavigate={onNavigate}
                to={routePaths.register}
              >
                Criar conta
              </AppLink>
            </div>
          </header>

          <main className="page-frame page-frame--public">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <div className="workspace-shell">
        <aside className="sidebar">
          <AppLink className="brand" onNavigate={onNavigate} to={routePaths.tasks}>
            <span className="brand__mark">TD</span>
            <span className="brand__copy">
              <strong>ToDoApp</strong>
              <small>painel pessoal</small>
            </span>
          </AppLink>

          <div className="sidebar__section">
            <span className="sidebar__label">
              Navegacao
            </span>

            <nav className="sidebar__nav" aria-label="Principal">
              {authenticatedLinks.map((link) => (
                <AppLink
                  key={link.to}
                  className={`sidebar__link ${
                    isLinkActive(route, link.to) ? "is-active" : ""
                  }`}
                  onNavigate={onNavigate}
                  to={link.to}
                >
                  {link.label}
                </AppLink>
              ))}
            </nav>
          </div>

          <div className="sidebar__footer">
            <div className="identity-card">
              <span className="identity-card__label">Conta ativa</span>
              <strong>{user.username || user.nickname}</strong>
              <small>@{user.nickname}</small>
            </div>

            <button
              className="button button--ghost button--full"
              disabled={isLoggingOut}
              onClick={onLogout}
              type="button"
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </aside>

        <main className="page-frame">{children}</main>
      </div>
    </div>
  );
}
