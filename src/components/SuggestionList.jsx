import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Clock3, Sparkles, Target } from "lucide-react";
import { getDayPeriod } from "../data/suggestions";

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
  const [keyboardInset, setKeyboardInset] = useState(0);
  const currentPeriod = getDayPeriod(new Date());
  const normalizedQuery = query.trim().toLowerCase();
  const getSuggestionLabel = (suggestion) => suggestion.labels?.[locale] || suggestion.label;
  const getSuggestionIcon = (suggestion) => {
    if (suggestion.source === "goal") return <Target aria-hidden="true" />;
    if (suggestion.source === "work") return <BriefcaseBusiness aria-hidden="true" />;
    if (suggestion.source === "profession") return <BriefcaseBusiness aria-hidden="true" />;
    if (suggestion.periods?.includes(currentPeriod)) return <Clock3 aria-hidden="true" />;
    return <Sparkles aria-hidden="true" />;
  };
  const orderedSuggestions = useMemo(() => suggestions, [suggestions]);

  const visibleSuggestions = useMemo(
    () =>
      orderedSuggestions.filter((suggestion) =>
        getSuggestionLabel(suggestion).toLowerCase().includes(normalizedQuery),
      ),
    [locale, normalizedQuery, orderedSuggestions],
  );
  const canAddCustomAction = normalizedQuery.length > 0 && visibleSuggestions.length === 0;
  const showRecentCooldownState = normalizedQuery.length === 0 && visibleSuggestions.length === 0;

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setKeyboardInset(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !window.visualViewport) {
      return undefined;
    }

    const viewport = window.visualViewport;
    const updateKeyboardInset = () => {
      const nextInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardInset(nextInset);
    };

    updateKeyboardInset();
    viewport.addEventListener("resize", updateKeyboardInset);
    viewport.addEventListener("scroll", updateKeyboardInset);

    return () => {
      viewport.removeEventListener("resize", updateKeyboardInset);
      viewport.removeEventListener("scroll", updateKeyboardInset);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section
        className="suggestions-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggestions-title"
        style={{
          "--keyboard-inset": `${keyboardInset}px`,
          "--sheet-list-padding-bottom":
            keyboardInset > 0 ? "calc(18px + env(safe-area-inset-bottom))" : "calc(104px + env(safe-area-inset-bottom))",
        }}
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
                    <p title={label}>{label}</p>
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
                <p title={query.trim()}>{query.trim()}</p>
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

          {showRecentCooldownState ? (
            <article className="suggestion-empty-state" role="status" aria-live="polite">
              <p>{t("suggestions.cooldownTitle")}</p>
              <span>{t("suggestions.cooldownHint")}</span>
            </article>
          ) : null}
        </div>
      </section>
    </div>
  );
}
