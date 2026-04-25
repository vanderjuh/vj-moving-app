import { useEffect, useState } from "react";
import { APP_TIMERS } from "../config/appSettings";

export function FeedbackBanner({
  error,
  notice,
  noticeAutoDismissMs = APP_TIMERS.noticeAutoDismissMs.soft,
  updateAction,
  updateMessage,
  updateLabel,
  t,
  onDismissError,
  onDismissNotice,
}) {
  const [isNoticeLeaving, setIsNoticeLeaving] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;
    if (typeof onDismissNotice !== "function") return undefined;

    setIsNoticeLeaving(false);
    const dismissMs = Math.max(APP_TIMERS.noticeMinAutoDismissMs, noticeAutoDismissMs);
    const leaveMs = Math.max(0, dismissMs - APP_TIMERS.noticeFadeOutMs);

    const leaveTimeoutId = window.setTimeout(() => {
      setIsNoticeLeaving(true);
    }, leaveMs);

    const timeoutId = window.setTimeout(() => {
      onDismissNotice();
    }, dismissMs);

    return () => {
      window.clearTimeout(leaveTimeoutId);
      window.clearTimeout(timeoutId);
    };
  }, [notice, noticeAutoDismissMs, onDismissNotice]);

  useEffect(() => {
    if (!notice) {
      setIsNoticeLeaving(false);
    }
  }, [notice]);

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
        <div className={`feedback feedback--success ${isNoticeLeaving ? "is-leaving" : ""}`}>
          <span>{notice}</span>
          <button type="button" onClick={onDismissNotice}>
            {t("feedback.dismiss")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
