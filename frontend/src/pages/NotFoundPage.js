import AppLink from "../components/AppLink";
import { routePaths } from "../lib/router";

export default function NotFoundPage({ hasSession, onNavigate }) {
  return (
    <section className="surface surface--centered not-found">
      <p className="eyebrow">404</p>
      <h1 className="page-title">Esta pagina nao foi encontrada.</h1>
      <p className="page-copy">
        Volte para um ponto valido do app e continue o trabalho a partir do painel principal.
      </p>

      <AppLink
        className="button"
        onNavigate={onNavigate}
        to={hasSession ? routePaths.tasks : routePaths.home}
      >
        {hasSession ? "Ir para tarefas" : "Ir para inicio"}
      </AppLink>
    </section>
  );
}
