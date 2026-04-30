type AuthPromptPanelProps = {
  title: string;
  summary: string;
  actionLabel: string;
  onAction: () => void;
};

export function AuthPromptPanel({
  title,
  summary,
  actionLabel,
  onAction
}: AuthPromptPanelProps) {
  return (
    <section className="stats-panel auth-prompt-panel" aria-label={title}>
      <div className="auth-prompt-copy">
        <p className="status-label">{actionLabel}</p>
        <h3 className="section-title auth-prompt-title">{title}</h3>
        <p className="section-copy">{summary}</p>
      </div>
      <div className="auth-prompt-actions">
        <button className="primary-button auth-prompt-button" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </section>
  );
}
