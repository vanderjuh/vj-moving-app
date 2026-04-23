import { useEffect, useMemo, useState } from "react";
import { getDayPeriod } from "../data/suggestions";

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
      <rect x="3.5" y="6.5" width="17" height="13" rx="2.5" />
      <path d="M3.5 12h17M10 12.2h4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.5 2" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 4 1.6 3.4L17 9l-3.4 1.6L12 14l-1.6-3.4L7 9l3.4-1.6L12 4Z" />
      <path d="m18.5 13 1 2.1 2.1 1-2.1 1-1 2.1-1-2.1-2.1-1 2.1-1 1-2.1Z" />
      <path d="M6 14.5 6.8 16l1.5.8-1.5.8L6 19l-.8-1.4-1.5-.8 1.5-.8L6 14.5Z" />
    </svg>
  );
}

export function SuggestionList({
  currentState,
  isOpen,
  locale,
  suggestions,
  completedActionId,
  t,
  onClose,
  onComplete,
}) {
  const [query, setQuery] = useState("");
  const currentPeriod = getDayPeriod(new Date());
  const normalizedQuery = query.trim().toLowerCase();
  const getSuggestionLabel = (suggestion) => suggestion.labels?.[locale] || suggestion.label;
  const getSuggestionIcon = (suggestion) => {
    if (suggestion.source === "goal") return <TargetIcon />;
    if (suggestion.source === "work") return <BriefcaseIcon />;
    if (suggestion.periods?.includes(currentPeriod)) return <ClockIcon />;
    return <SparklesIcon />;
  };
  const orderedSuggestions = useMemo(() => {
    const periodSuggestions = suggestions.filter((suggestion) =>
      suggestion.periods?.includes(currentPeriod),
    );
    const anySuggestions = suggestions.filter((suggestion) => suggestion.periods?.includes("any"));

    const seen = new Set();
    return [...periodSuggestions, ...anySuggestions, ...suggestions].filter((suggestion) => {
      if (seen.has(suggestion.id)) return false;
      seen.add(suggestion.id);
      return true;
    });
  }, [currentPeriod, suggestions]);

  const visibleSuggestions = useMemo(
    () =>
      orderedSuggestions.filter((suggestion) =>
        getSuggestionLabel(suggestion).toLowerCase().includes(normalizedQuery),
      ),
    [locale, normalizedQuery, orderedSuggestions],
  );
  const canAddCustomAction = normalizedQuery.length > 0 && visibleSuggestions.length === 0;

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section
        className="suggestions-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggestions-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="action-heading">
          <div>
            <p id="suggestions-title">{t("suggestions.heading")}</p>
            <span>
              {t("suggestions.mode", { state: t(`state.${currentState}.label`).toLowerCase() })}
            </span>
          </div>
          <button className="sheet-close-button" type="button" aria-label={t("suggestions.close")} onClick={onClose}>
            ×
          </button>
        </div>

        <label className="suggestion-search">
          <span className="sr-only">{t("suggestions.searchPlaceholder")}</span>
          <input
            autoFocus
            type="search"
            value={query}
            placeholder={t("suggestions.searchPlaceholder")}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="suggestion-list" tabIndex={0}>
          {visibleSuggestions.map((suggestion, index) => {
            const isComplete = completedActionId === suggestion.id;
            const label = getSuggestionLabel(suggestion);

            return (
              <article
                className={`suggestion-card ${isComplete ? "is-complete" : ""}`}
                key={suggestion.id}
                style={{ "--delay": `${index * 80}ms` }}
              >
                <div>
                  <div className="suggestion-main">
                    <span className="suggestion-prefix-icon">{getSuggestionIcon(suggestion)}</span>
                    <p>{label}</p>
                  </div>
                </div>
                <button
                  className="add-action-button"
                  type="button"
                  aria-label={label}
                  onClick={() => {
                    onComplete(suggestion.id, label);
                    onClose();
                  }}
                >
                  {isComplete ? "✓" : "+"}
                </button>
              </article>
            );
          })}

          {canAddCustomAction ? (
            <article className="suggestion-card custom-action-card">
              <div>
                <p>{query.trim()}</p>
              </div>
              <button
                className="add-action-button"
                type="button"
                aria-label={t("suggestions.addCustom")}
                onClick={() => {
                  onComplete(`custom-${Date.now()}`, query.trim());
                  onClose();
                }}
              >
                +
              </button>
            </article>
          ) : null}
        </div>
      </section>
    </div>
  );
}
