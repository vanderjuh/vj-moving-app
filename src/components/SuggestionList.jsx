import { useEffect, useMemo, useState } from "react";

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
  const normalizedQuery = query.trim().toLowerCase();
  const getSuggestionLabel = (suggestion) => suggestion.labels?.[locale] || suggestion.label;
  const visibleSuggestions = useMemo(
    () =>
      suggestions.filter((suggestion) =>
        getSuggestionLabel(suggestion).toLowerCase().includes(normalizedQuery),
      ),
    [locale, normalizedQuery, suggestions],
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
                  <p>{label}</p>
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
