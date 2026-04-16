export default function LoadingView({
  eyebrow = "Carregando",
  title = "Abrindo painel.",
  copy = "Preparando seus dados e restaurando a sessao atual.",
}) {
  return (
    <section className="surface surface--centered loading-view">
      <div className="loader" aria-hidden="true" />
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      <p className="page-copy">{copy}</p>
    </section>
  );
}
