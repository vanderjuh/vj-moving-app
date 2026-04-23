import { STATES, SUGGESTIONS_BY_STATE } from "../data/suggestions";
import { detectLocale } from "../i18n/translations";

export const STORAGE_KEY = "behavior_app_v1";

const DEFAULT_SETTINGS = {
  notificationsEnabled: false,
  notificationTone: "soft",
  hapticsEnabled: false,
  appearance: "system",
  locale: detectLocale(),
  goal: "",
};

const DEFAULT_STATE = {
  currentState: "STOPPED",
  history: [],
  transitions: [],
  settings: DEFAULT_SETTINGS,
};

const ACTIVE_WINDOW_MS = 15 * 60 * 1000;
const NEUTRAL_WINDOW_MS = 60 * 60 * 1000;

const isBrowserStorageAvailable = () => {
  try {
    const probeKey = "__behavior_storage_probe__";
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const timestamp = () => new Date().toISOString();

const isValidState = (state) => STATES.includes(state);

const getLastReportAt = (history) => {
  const newestItem = history
    .filter((item) => typeof item.timestamp === "string")
    .sort((first, second) => new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime())[0];

  return newestItem?.timestamp || null;
};

const deriveStateFromHistory = (history, now = Date.now()) => {
  const lastReportAt = getLastReportAt(history);

  if (!lastReportAt) {
    return "STOPPED";
  }

  const reportAge = now - new Date(lastReportAt).getTime();

  if (!Number.isFinite(reportAge) || reportAge < 0) {
    return "ACTIVE";
  }

  if (reportAge <= ACTIVE_WINDOW_MS) {
    return "ACTIVE";
  }

  if (reportAge <= NEUTRAL_WINDOW_MS) {
    return "NEUTRAL";
  }

  return "STOPPED";
};

const isHistoryItem = (item) =>
  item &&
  typeof item === "object" &&
  typeof item.actionId === "string" &&
  typeof item.label === "string" &&
  typeof item.timestamp === "string" &&
  isValidState(item.state);

const isTransition = (item) =>
  item &&
  typeof item === "object" &&
  isValidState(item.previousState) &&
  isValidState(item.newState) &&
  typeof item.timestamp === "string";

const normalizeSettings = (settings) => {
  const source = settings && typeof settings === "object" ? settings : {};
  const goal = typeof source.goal === "string" ? source.goal : "";

  return {
    notificationsEnabled:
      typeof source.notificationsEnabled === "boolean"
        ? source.notificationsEnabled
        : DEFAULT_SETTINGS.notificationsEnabled,
    notificationTone: ["soft", "direct"].includes(source.notificationTone)
      ? source.notificationTone
      : DEFAULT_SETTINGS.notificationTone,
    hapticsEnabled:
      typeof source.hapticsEnabled === "boolean"
        ? source.hapticsEnabled
        : DEFAULT_SETTINGS.hapticsEnabled,
    appearance: ["system", "light", "dark"].includes(source.appearance)
      ? source.appearance
      : DEFAULT_SETTINGS.appearance,
    locale: ["pt", "en"].includes(source.locale) ? source.locale : DEFAULT_SETTINGS.locale,
    goal: goal.slice(0, 180),
  };
};

const normalizeAppState = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Stored data is not an object.");
  }

  if (!isValidState(data.currentState)) {
    throw new Error("Stored currentState is invalid.");
  }

  if (!Array.isArray(data.history) || !Array.isArray(data.transitions)) {
    throw new Error("Stored lists are invalid.");
  }

  const history = data.history.filter(isHistoryItem);

  return {
    currentState: isValidState(data.currentState) ? data.currentState : deriveStateFromHistory(history),
    history,
    transitions: data.transitions.filter(isTransition),
    settings: normalizeSettings(data.settings),
  };
};

const withDerivedState = (data) => {
  const normalized = normalizeAppState(data);
  const derivedState = deriveStateFromHistory(normalized.history);

  if (normalized.currentState === derivedState) {
    return normalized;
  }

  return {
    ...normalized,
    currentState: derivedState,
    transitions: [
      {
        previousState: normalized.currentState,
        newState: derivedState,
        timestamp: timestamp(),
      },
      ...normalized.transitions,
    ],
  };
};

const readRawState = () => {
  if (!isBrowserStorageAvailable()) {
    return { data: clone(DEFAULT_STATE), warning: "Local storage is unavailable." };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    return { data: clone(DEFAULT_STATE), warning: "" };
  }

  try {
    const data = withDerivedState(JSON.parse(raw));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { data, warning: "" };
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    return {
      data: clone(DEFAULT_STATE),
      warning: "Saved data was corrupted and has been reset safely.",
    };
  }
};

const writeRawState = (data) => {
  const normalized = withDerivedState(data);

  if (!isBrowserStorageAvailable()) {
    throw new Error("Local storage is unavailable.");
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return clone(normalized);
};

const findSuggestion = (actionId) =>
  Object.values(SUGGESTIONS_BY_STATE)
    .flat()
    .find((suggestion) => suggestion.id === actionId);

export const behaviorStorage = {
  getAppState() {
    const { data, warning } = readRawState();
    return { data: clone(data), warning };
  },

  saveAppState(data) {
    return writeRawState(data);
  },

  addAction(action, baseState) {
    const sourceState = baseState ? withDerivedState(baseState) : readRawState().data;
    const suggestion = findSuggestion(action?.actionId || action?.id);

    if (!suggestion && typeof action?.label !== "string") {
      throw new Error("That action is no longer available.");
    }

    const completedAction = {
      actionId: action.actionId || action.id,
      label: action.label || suggestion?.label,
      timestamp: action.timestamp || timestamp(),
      state: sourceState.currentState,
    };

    const nextState = {
      ...sourceState,
      history: [completedAction, ...sourceState.history],
    };

    return writeRawState(nextState);
  },

  changeState(newState, baseState) {
    if (!isValidState(newState)) {
      throw new Error("Selected state is invalid.");
    }

    const sourceState = baseState ? normalizeAppState(baseState) : readRawState().data;

    if (sourceState.currentState === newState) {
      return writeRawState(sourceState);
    }

    const nextState = {
      ...sourceState,
      currentState: newState,
      transitions: [
        {
          previousState: sourceState.currentState,
          newState,
          timestamp: timestamp(),
        },
        ...sourceState.transitions,
      ],
    };

    return writeRawState(nextState);
  },

  refreshDerivedState(baseState) {
    const sourceState = baseState ? normalizeAppState(baseState) : readRawState().data;
    return writeRawState(sourceState);
  },

  getReportMetrics(baseState) {
    const sourceState = baseState ? normalizeAppState(baseState) : readRawState().data;
    const lastReportAt = getLastReportAt(sourceState.history);

    return {
      lastReportAt,
      activeWindowMinutes: ACTIVE_WINDOW_MS / 60000,
      neutralWindowMinutes: NEUTRAL_WINDOW_MS / 60000,
    };
  },

  updateSettings(settings, baseState) {
    const sourceState = baseState ? normalizeAppState(baseState) : readRawState().data;
    const nextState = {
      ...sourceState,
      settings: normalizeSettings({
        ...sourceState.settings,
        ...settings,
      }),
    };

    return writeRawState(nextState);
  },

  resetAppState() {
    return writeRawState(DEFAULT_STATE);
  },
};
