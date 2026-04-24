import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_SUGGESTION_PRIORITY, getSuggestionsForContext } from "../data/suggestions";
import { notificationService } from "../services/notificationService";
import { behaviorStorage } from "../services/behaviorStorage";

const STATE_REFRESH_MS = 30 * 1000;

export function useBehaviorApp() {
  const [appState, setAppState] = useState({
    currentState: "STOPPED",
    history: [],
    transitions: [],
    settings: {
      notificationsEnabled: false,
      notificationTone: "soft",
      hapticsEnabled: false,
      uiDensity: "compact",
      appearance: "system",
      locale: "en",
      goal: "",
      profession: "",
      suggestionPriority: DEFAULT_SUGGESTION_PRIORITY,
      workHours: {
        start: "09:00",
        end: "18:00",
      },
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [completedActionId, setCompletedActionId] = useState("");
  const isHydrated = useRef(false);

  useEffect(() => {
    try {
      const result = behaviorStorage.getAppState();

      startTransition(() => {
        setAppState(result.data);
        setNotice(result.warning);
        setError("");
        setIsLoading(false);
        isHydrated.current = true;
      });
    } catch (storageError) {
      setError(storageError.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated.current) return undefined;

    const refreshState = () => {
      try {
        setAppState((current) => behaviorStorage.refreshDerivedState(current));
      } catch (storageError) {
        setError(storageError.message);
      }
    };

    const interval = window.setInterval(refreshState, STATE_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  const suggestions = useMemo(
    () =>
      getSuggestionsForContext({
        state: appState.currentState,
        goal: appState.settings.goal,
        locale: appState.settings.locale,
        profession: appState.settings.profession,
        suggestionPriority: appState.settings.suggestionPriority,
        workHours: appState.settings.workHours,
      }),
    [
      appState.currentState,
      appState.history.length,
      appState.settings.goal,
      appState.settings.locale,
      appState.settings.profession,
      appState.settings.suggestionPriority,
      appState.settings.workHours,
    ],
  );

  const completeAction = (actionId, label, successMessage, missingActionMessage) => {
    const suggestion = suggestions.find((item) => item.id === actionId);
    const safeLabel = typeof label === "string" ? label.trim() : "";

    if (!suggestion && !safeLabel) {
      setError(missingActionMessage || "That action no longer exists for the current state.");
      return false;
    }

    setAppState((current) => {
      try {
        const completedLabel = safeLabel || suggestion?.label || "";
        const notificationSettings = {
          enabled: current.settings.notificationsEnabled,
          tone: current.settings.notificationTone,
          locale: current.settings.locale,
        };
        const nextState = behaviorStorage.addAction(
          {
            actionId: suggestion?.id || `custom-${crypto.randomUUID()}`,
            label: completedLabel,
          },
          current,
        );

        setCompletedActionId(suggestion?.id || "");
        window.setTimeout(() => setCompletedActionId(""), 900);
        setNotice(notificationSettings.enabled ? successMessage || "" : "");
        setError("");

        if (notificationSettings.enabled && completedLabel) {
          notificationService.notifyActionCompleted({
            locale: notificationSettings.locale,
            tone: notificationSettings.tone,
            label: completedLabel,
          });
        }

        return nextState;
      } catch (storageError) {
        setError(storageError.message);
        return current;
      }
    });

    return true;
  };

  const updateSettings = (settings) => {
    const isEnablingNotifications =
      settings.notificationsEnabled === true && appState.settings.notificationsEnabled !== true;
    const tone = settings.notificationTone || appState.settings.notificationTone;
    const locale = settings.locale || appState.settings.locale;

    setAppState((current) => {
      try {
        const nextState = behaviorStorage.updateSettings(settings, current);
        setError("");
        return nextState;
      } catch (storageError) {
        setError(storageError.message);
        return current;
      }
    });

    if (isEnablingNotifications) {
      notificationService.requestPermission().then((status) => {
        const message = notificationService.getPermissionFeedbackMessage({ locale, tone, status });
        if (message) {
          setNotice(message);
        }
      });
    }
  };

  const resetAppState = (successMessage) => {
    setAppState((current) => {
      try {
        const notificationSettings = {
          enabled: current.settings.notificationsEnabled,
          tone: current.settings.notificationTone,
          locale: current.settings.locale,
        };
        const nextState = behaviorStorage.resetAppState();
        setCompletedActionId("");
        setNotice(notificationSettings.enabled ? successMessage || "" : "");
        setError("");

        if (notificationSettings.enabled) {
          notificationService.notifyReset({
            locale: notificationSettings.locale,
            tone: notificationSettings.tone,
          });
        }

        return nextState;
      } catch (storageError) {
        setError(storageError.message);
        return current;
      }
    });
  };

  return {
    appState,
    suggestions,
    isLoading,
    error,
    notice,
    completedActionId,
    actions: {
      completeAction,
      updateSettings,
      resetAppState,
      dismissError: () => setError(""),
      dismissNotice: () => setNotice(""),
    },
  };
}
