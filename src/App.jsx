import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { FeedbackBanner } from "./components/FeedbackBanner";
import { HistoryPanel } from "./components/HistoryPanel";
import { LoadingState } from "./components/LoadingState";
import { OnboardingHint } from "./components/OnboardingHint";
import { SettingsScreen } from "./components/SettingsScreen";
import { SuggestionList } from "./components/SuggestionList";
import { STATE_META } from "./data/suggestions";
import { useBehaviorApp } from "./hooks/useBehaviorApp";
import { createTranslator, detectLocale } from "./i18n/translations";

const getResolvedAppearance = (appearance) => {
  if (appearance === "light" || appearance === "dark") {
    return appearance;
  }

  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const countToday = (history) => {
  const today = new Date().toDateString();
  return history.filter((item) => new Date(item.timestamp).toDateString() === today).length;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [systemAppearance, setSystemAppearance] = useState(() => getResolvedAppearance("system"));
  const [applyPwaUpdate, setApplyPwaUpdate] = useState(null);
  const detectedLocale = useMemo(() => detectLocale(), []);
  const {
    appState,
    suggestions,
    isLoading,
    error,
    notice,
    completedActionId,
    actions,
  } = useBehaviorApp();
  const locale = appState.settings.locale || detectedLocale;
  const t = useMemo(() => createTranslator(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
  }, [locale]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const updateAppearance = () => setSystemAppearance(media.matches ? "light" : "dark");

    updateAppearance();
    media.addEventListener("change", updateAppearance);
    return () => media.removeEventListener("change", updateAppearance);
  }, []);

  useEffect(() => {
    const handlePwaUpdateReady = (event) => {
      const nextApplyUpdate = event.detail?.applyUpdate;
      if (typeof nextApplyUpdate !== "function") return;
      setApplyPwaUpdate(() => nextApplyUpdate);
    };

    window.addEventListener("pulse:pwa-update-ready", handlePwaUpdateReady);
    return () => window.removeEventListener("pulse:pwa-update-ready", handlePwaUpdateReady);
  }, []);

  if (isLoading) {
    return <LoadingState t={t} />;
  }

  const stateMeta = {
    ...STATE_META[appState.currentState],
    label: t(`state.${appState.currentState}.label`),
    prompt: t(`state.${appState.currentState}.prompt`),
  };
  const isFirstUse = appState.history.length === 0 && appState.transitions.length === 0;
  const todayCount = countToday(appState.history);
  const resolvedAppearance =
    appState.settings.appearance === "system" ? systemAppearance : appState.settings.appearance;
  const resolvedDensity = appState.settings.uiDensity || "compact";
  const notificationTone = appState.settings.notificationTone || "soft";
  const isDirectTone = notificationTone === "direct";
  const notificationsEnabled = appState.settings.notificationsEnabled === true;

  const handleTabChange = (tab) => {
    setIsActionSheetOpen(false);
    setActiveTab(tab);
  };

  return (
    <main
      className={`phone-shell phone-shell--${appState.currentState.toLowerCase()} theme-${resolvedAppearance} ui-${resolvedDensity}`}
    >
      <FeedbackBanner
        error={error}
        notice={notice}
        updateAction={notificationsEnabled ? applyPwaUpdate : null}
        updateMessage={
          isDirectTone ? t("feedback.updateAvailableDirect") : t("feedback.updateAvailableSoft")
        }
        updateLabel={t("feedback.updateNow")}
        t={t}
        onDismissError={actions.dismissError}
        onDismissNotice={actions.dismissNotice}
      />

      <section className="screen" hidden={activeTab !== "home"}>
        <header className="home-hero">
          <div className="today-pill">
            <strong>{todayCount}</strong>
            <span>{todayCount === 1 ? t("app.actionsTodayOne") : t("app.actionsTodayOther")}</span>
          </div>

          <div className="state-orb" aria-hidden="true">
            <span />
          </div>

          <p className="eyebrow">{t("app.currentState")}</p>
          <h1>{stateMeta.label}</h1>
          <p className="state-copy">{stateMeta.prompt}</p>

          <button className="primary-action-button" type="button" onClick={() => setIsActionSheetOpen(true)}>
            {t("suggestions.cta")}
          </button>

          {isFirstUse ? <OnboardingHint t={t} /> : null}
        </header>

        <SuggestionList
          completedActionId={completedActionId}
          currentState={appState.currentState}
          isOpen={isActionSheetOpen}
          locale={locale}
          suggestions={suggestions}
          t={t}
          onClose={() => setIsActionSheetOpen(false)}
          onComplete={(actionId, label) =>
            actions.completeAction(
              actionId,
              label,
              isDirectTone ? t("feedback.completedDirect") : t("feedback.completedSoft"),
              t("feedback.missingAction"),
            )
          }
        />
      </section>

      <section className="screen history-screen" hidden={activeTab !== "history"}>
        <HistoryPanel history={appState.history} locale={locale} t={t} transitions={appState.transitions} />
      </section>

      <div hidden={activeTab !== "settings"}>
        <SettingsScreen
          settings={appState.settings}
          t={t}
          onReset={() =>
            actions.resetAppState(isDirectTone ? t("feedback.resetDirect") : t("feedback.resetSoft"))
          }
          onUpdateSettings={actions.updateSettings}
        />
      </div>

      <BottomNav activeTab={activeTab} t={t} onTabChange={handleTabChange} />
    </main>
  );
}
