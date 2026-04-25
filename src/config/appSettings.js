import { detectLocale } from "../i18n/translations";
import rawSettings from "./appSettings.json";

const clone = (value) => JSON.parse(JSON.stringify(value));

const defaultSettingsRaw = rawSettings.defaults.settings;

export const appSettings = rawSettings;

export const FEATURE_FLAGS = {
  ...rawSettings.featureToggles,
};

export const featureFlags = FEATURE_FLAGS;

export const APP_TIMERS = {
  ...rawSettings.timers,
  noticeAutoDismissMs: {
    ...rawSettings.timers.noticeAutoDismissMs,
  },
};

export const HISTORY_SETTINGS = {
  ...rawSettings.history,
};

export const SETTINGS_LIMITS = {
  goalMaxLength: defaultSettingsRaw.goalMaxLength,
  professionMaxLength: defaultSettingsRaw.professionMaxLength,
};

export const createDefaultSettings = () => ({
  notificationsEnabled: defaultSettingsRaw.notificationsEnabled,
  notificationTone: defaultSettingsRaw.notificationTone,
  hapticsEnabled: defaultSettingsRaw.hapticsEnabled,
  uiDensity: defaultSettingsRaw.uiDensity,
  appearance: defaultSettingsRaw.appearance,
  locale: detectLocale() || defaultSettingsRaw.localeFallback,
  goal: "",
  profession: "",
  suggestionPriority: FEATURE_FLAGS.goalEnabled
    ? [...defaultSettingsRaw.suggestionPriority.goalEnabled]
    : [...defaultSettingsRaw.suggestionPriority.goalDisabled],
  workHours: clone(defaultSettingsRaw.workHours),
});

export const createDefaultAppState = () => ({
  currentState: rawSettings.defaults.currentState,
  history: [],
  transitions: [],
  settings: createDefaultSettings(),
});
