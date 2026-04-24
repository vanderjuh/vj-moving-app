export function FeedbackBanner({
  error,
  notice,
  updateAction,
  updateMessage,
  updateLabel,
  t,
  onDismissError,
  onDismissNotice,
}) {
  if (!error && !notice && !updateAction) return null;

  return (
    <div className="feedback-stack" aria-live="polite">
      {updateAction ? (
        <div className="feedback feedback--update" role="status">
          <span>{updateMessage}</span>
          <button type="button" onClick={() => updateAction()}>
            {updateLabel}
          </button>
        </div>
      ) : null}
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
