export function FeedbackBanner({ error, notice, t, onDismissError, onDismissNotice }) {
  if (!error && !notice) return null;

  return (
    <div className="feedback-stack" aria-live="polite">
      {error ? (
        <div className="feedback feedback--error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={onDismissError}>
            {t("feedback.dismiss")}
          </button>
        </div>
      ) : null}
      {notice ? (
        <div className="feedback feedback--success">
          <span>{notice}</span>
          <button type="button" onClick={onDismissNotice}>
            {t("feedback.dismiss")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
