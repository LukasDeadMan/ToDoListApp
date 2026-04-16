import AppLink from "../components/AppLink";
import { routePaths } from "../lib/router";

const reasons = [
  {
    title: "Capture tudo em segundos",
    copy:
      "Anote tarefas assim que elas surgirem e mantenha o fluxo do dia andando sem depender de memoria ou post-its espalhados.",
  },
  {
    title: "Priorize sem complicar",
    copy:
      "Separe o que e urgente, o que pode esperar e o que ja foi concluido em uma interface objetiva e facil de manter.",
  },
  {
    title: "Acompanhe progresso real",
    copy:
      "Veja o que esta aberto, concluido e travado para decidir o proximo passo com mais clareza e menos ruido visual.",
  },
];

const workflowCards = [
  {
    eyebrow: "Entrada rapida",
    title: "Tudo comeca em uma lista simples.",
    copy:
      "Use a lista principal para descarregar demandas, ideias e compromissos. Primeiro capture, depois organize.",
  },
  {
    eyebrow: "Foco diario",
    title: "Trabalhe com o que importa hoje.",
    copy:
      "O painel deixa visivel o que precisa de atencao agora para voce nao desperdicar energia abrindo e fechando contextos.",
  },
  {
    eyebrow: "Manutencao leve",
    title: "Edite o plano conforme o dia muda.",
    copy:
      "Atualize titulos, conclua tarefas ou remova pendencias sem navegar por telas pesadas ou cheias de distracao.",
  },
];

const useCases = [
  "Planejar entregas e pendencias do trabalho",
  "Organizar rotinas pessoais e tarefas recorrentes",
  "Centralizar backlog, prioridades e concluido no mesmo painel",
];

const previewTasks = [
  { title: "Preparar reuniao de alinhamento", state: "today", meta: "Hoje" },
  { title: "Revisar backlog do produto", state: "todo", meta: "Em aberto" },
  { title: "Enviar resumo da sprint", state: "done", meta: "Concluida" },
  { title: "Planejar proximas prioridades", state: "todo", meta: "Em aberto" },
];

export default function HomePage({ onNavigate }) {
  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <p className="eyebrow">Organizacao pessoal e profissional</p>
          <h1 className="page-title">
            Clareza para planejar o dia, foco para terminar o que importa.
          </h1>
          <p className="page-copy landing-hero__lead">
            ToDoApp e um painel de tarefas direto ao ponto para quem quer manter
            prioridades visiveis, reduzir ruido e acompanhar o progresso sem
            transformar a rotina em burocracia.
          </p>

          <div className="landing-hero__actions">
            <AppLink className="button" onNavigate={onNavigate} to={routePaths.register}>
              Comecar gratis
            </AppLink>
            <AppLink
              className="button button--secondary"
              onNavigate={onNavigate}
              to={routePaths.login}
            >
              Fazer login
            </AppLink>
          </div>

          <div className="landing-trust">
            <span>Captura rapida</span>
            <span>Foco diario</span>
            <span>Painel simples</span>
          </div>
        </div>

        <div className="landing-hero__visual">
          <div className="hero-preview">
            <div className="hero-preview__window">
              <div className="hero-preview__sidebar">
                <span className="hero-preview__label">Workspace</span>
                <div className="hero-preview__nav-item is-active">Hoje</div>
                <div className="hero-preview__nav-item">Em aberto</div>
                <div className="hero-preview__nav-item">Concluidas</div>
              </div>

              <div className="hero-preview__content">
                <div className="hero-preview__topline">
                  <div>
                    <span className="hero-preview__label">Hoje</span>
                    <strong>4 tarefas para fechar o dia</strong>
                  </div>
                  <span className="hero-preview__chip">Prioridade</span>
                </div>

                <div className="hero-preview__list">
                  {previewTasks.map((task) => (
                    <article
                      className={`hero-task hero-task--${task.state}`}
                      key={task.title}
                    >
                      <span className="hero-task__bullet" />
                      <div className="hero-task__copy">
                        <strong>{task.title}</strong>
                        <small>{task.meta}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-strip">
        {reasons.map((reason) => (
          <article className="proof-card" key={reason.title}>
            <h2>{reason.title}</h2>
            <p>{reason.copy}</p>
          </article>
        ))}
      </section>

      <section className="story-section">
        <div className="story-section__intro">
          <p className="eyebrow">Por que usar o app</p>
          <h2 className="section-title">
            Um sistema leve para manter demandas sob controle sem virar mais uma
            fonte de distracao.
          </h2>
          <p className="page-copy">
            A estrutura foi pensada para parecer um app de produtividade de fato:
            entrada simples, leitura rapida da lista, edicao direta e uma
            separacao clara entre o que esta aberto e o que ja andou.
          </p>
        </div>

        <div className="story-grid">
          {workflowCards.map((card) => (
            <article className="story-card" key={card.title}>
              <p className="eyebrow">{card.eyebrow}</p>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <div className="showcase-section__copy">
          <p className="eyebrow">Feito para rotina real</p>
          <h2 className="section-title">
            Use o painel para trabalho, vida pessoal ou qualquer fluxo que precise
            de um lugar claro para priorizar.
          </h2>
          <p className="page-copy">
            Em vez de uma homepage vazia ou tecnica demais, a ideia aqui e mostrar
            com clareza o beneficio do produto: menos sobrecarga mental e mais
            visibilidade do que precisa ser feito.
          </p>

          <div className="use-case-list">
            {useCases.map((item) => (
              <div className="use-case-item" key={item}>
                <span className="use-case-item__dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="showcase-panel">
          <div className="showcase-panel__header">
            <div>
              <p className="eyebrow">Visao do dia</p>
              <strong>Lista principal</strong>
            </div>
            <span className="showcase-panel__badge">Sem excesso</span>
          </div>

          <div className="showcase-panel__body">
            <div className="showcase-column">
              <span className="showcase-column__label">Hoje</span>
              <div className="showcase-entry">
                <strong>Apresentacao do cliente</strong>
                <small>09:30</small>
              </div>
              <div className="showcase-entry">
                <strong>Conferir tarefas da equipe</strong>
                <small>11:00</small>
              </div>
            </div>

            <div className="showcase-column">
              <span className="showcase-column__label">Depois</span>
              <div className="showcase-entry showcase-entry--muted">
                <strong>Planejar backlog</strong>
                <small>Sem horario</small>
              </div>
              <div className="showcase-entry showcase-entry--muted">
                <strong>Atualizar prioridades</strong>
                <small>Sem horario</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-panel cta-panel--landing">
        <div>
          <p className="eyebrow">Pronto para comecar</p>
          <h2 className="section-title">
            Crie sua conta e abra um painel mais claro para o seu dia.
          </h2>
        </div>

        <div className="cta-panel__actions">
          <AppLink className="button" onNavigate={onNavigate} to={routePaths.register}>
            Criar conta
          </AppLink>
          <AppLink
            className="button button--ghost"
            onNavigate={onNavigate}
            to={routePaths.login}
          >
            Ja tenho acesso
          </AppLink>
        </div>
      </section>
    </div>
  );
}
