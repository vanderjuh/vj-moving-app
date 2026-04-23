import { useState } from "react";
import { Sparkles } from "lucide-react";

const INITIAL_VISIBLE_COUNT = 80;
const PAGE_SIZE = 80;

const formatTime = (value, locale) =>
  new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function HistoryPanel({ history, locale, t, transitions }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleHistory = history.slice(0, visibleCount);

  return (
    <section className="history-panel">
      <div className="screen-heading">
        <h1>{t("history.title")}</h1>
        <p>{t("history.subtitle")}</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon" aria-hidden="true">
            <Sparkles aria-hidden="true" />
          </div>
          <strong>{t("history.emptyTitle")}</strong>
          <span>{t("history.emptyBody")}</span>
        </div>
      ) : (
        <>
          <ol className="history-list">
            {visibleHistory.map((item) => (
              <li key={`${item.actionId}-${item.timestamp}`}>
                <span className={`state-pill state-pill--${item.state.toLowerCase()}`}>
                  {t(`state.${item.state}.label`)}
                </span>
                <div>
                  <strong>{item.label}</strong>
                  <time dateTime={item.timestamp}>{formatTime(item.timestamp, locale)}</time>
                </div>
              </li>
            ))}
          </ol>
          {visibleCount < history.length ? (
            <button
              className="load-more-button"
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              {t("history.showMore", {
                count: Math.min(PAGE_SIZE, history.length - visibleCount),
              })}
            </button>
          ) : null}
        </>
      )}

      <div className="transition-summary">
        <span>{t("history.completedActions", { count: history.length })}</span>
        <span>{t("history.stateTransitions", { count: transitions.length })}</span>
      </div>
    </section>
  );
}
