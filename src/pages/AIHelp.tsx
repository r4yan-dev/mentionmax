export default function AIHelp() {
  return (
    <div className="app-page ai-help-page">
      <header className="page-header">
        <div>
          <span className="section-eyebrow">
            AI Help
          </span>

          <h1 className="page-title">
            Ton assistant de révision.
          </h1>

          <p className="page-lead">
            Questions, notes et explications
            contextualisées. La logique IA viendra se
            brancher ici plus tard.
          </p>
        </div>
      </header>

      <section className="ai-chat-shell">
        <div className="ai-chat-header">
          <div className="ai-chat-avatar">
            ✦
          </div>

          <div>
            <strong>
              MentionMax AI
            </strong>

            <span>
              Assistant pédagogique
            </span>
          </div>
        </div>

        <div className="ai-chat-empty">
          <div className="ai-chat-empty__icon">
            ✦
          </div>

          <h2>
            Que veux-tu comprendre ?
          </h2>

          <p>
            Pose une question, colle un passage de cours
            ou ajoute tes notes.
          </p>

          <div className="ai-suggestions">
            <button className="ai-suggestion">
              Explique cette notion
            </button>

            <button className="ai-suggestion">
              Résume mes notes
            </button>

            <button className="ai-suggestion">
              Donne-moi un exemple
            </button>
          </div>
        </div>

        <div className="ai-input">
          <input
            type="text"
            placeholder="Pose ta question..."
            disabled
          />

          <button
            className="btn btn-primary"
            disabled
          >
            Envoyer
          </button>
        </div>
      </section>

      <section className="ai-notes-card">
        <span className="section-eyebrow">
          Mes notes
        </span>

        <h2>
          Notes enregistrées
        </h2>

        <p>
          Tes notes deviendront accessibles à AI Help pour
          répondre avec le bon contexte.
        </p>

        <button
          type="button"
          className="btn btn-secondary"
        >
          Ajouter des notes
        </button>
      </section>
    </div>
  );
}
