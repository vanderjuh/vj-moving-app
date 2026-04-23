import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { SUGGESTIONS_BY_STATE } from "../data/suggestions";
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
      appearance: "system",
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
    () => SUGGESTIONS_BY_STATE[appState.currentState] || [],
    [appState.currentState],
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
        const nextState = behaviorStorage.addAction(
          {
            actionId: suggestion?.id || `custom-${crypto.randomUUID()}`,
            label: safeLabel || suggestion.label,
          },
          current,
        );

        setCompletedActionId(suggestion?.id || "");
        window.setTimeout(() => setCompletedActionId(""), 900);
        setNotice(successMessage || "");
        setError("");
        return nextState;
      } catch (storageError) {
        setError(storageError.message);
        return current;
      }
    });

    return true;
  };

  const updateSettings = (settings) => {
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
  };

  const resetAppState = (successMessage) => {
    try {
      const nextState = behaviorStorage.resetAppState();
      setAppState(nextState);
      setCompletedActionId("");
      setNotice(successMessage || "");
      setError("");
    } catch (storageError) {
      setError(storageError.message);
    }
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
