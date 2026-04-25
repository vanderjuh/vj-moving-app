import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { HISTORY_SETTINGS } from "../config/appSettings";

const INITIAL_VISIBLE_COUNT = HISTORY_SETTINGS.initialVisibleCount;
const PAGE_SIZE = HISTORY_SETTINGS.pageSize;

const formatTime = (value, locale) =>
  new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function HistoryPanel({ history, locale, t, transitions, onArchiveItem }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleItems = history.filter((item) => !item.archivedAt);
  const visibleHistory = visibleItems.slice(0, visibleCount);

  return (
    <section className="history-panel">
      <div className="screen-heading">
        <h1>{t("history.title")}</h1>
        <p>{t("history.subtitle")}</p>
      </div>

      {visibleItems.length === 0 ? (
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
                <div className="history-item-main">
                  <span className={`state-pill state-pill--${item.state.toLowerCase()}`}>
                    {t(`state.${item.state}.label`)}
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <time dateTime={item.timestamp}>{formatTime(item.timestamp, locale)}</time>
                  </div>
                </div>

                <button
                  className="history-remove-button"
                  type="button"
                  aria-label={t("history.archiveAction")}
                  onClick={() => onArchiveItem(item)}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
          {visibleCount < visibleItems.length ? (
            <button
              className="load-more-button"
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              {t("history.showMore", {
                count: Math.min(PAGE_SIZE, visibleItems.length - visibleCount),
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
