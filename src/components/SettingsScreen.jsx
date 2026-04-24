import { useEffect, useState } from "react";
import { Bell, Smartphone, Trash2 } from "lucide-react";
import { featureFlags } from "../config/featureFlags";
import { getProfessionOptions, resolveProfessionLabels } from "../data/professions";
import { DEFAULT_SUGGESTION_PRIORITY, SUGGESTION_PRIORITY_TYPES } from "../data/suggestions";

function Toggle({ checked, onChange, label }) {
  return (
    <button
      className={`settings-toggle ${checked ? "is-on" : ""}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className={`segmented segmented--${options.length}`}>
      {options.map((option) => (
        <button
          className={value === option.id ? "is-selected" : ""}
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
        >
          {option.icon ? <span aria-hidden="true">{option.icon}</span> : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SettingsGroup({ title, children }) {
  return (
    <section className="settings-group">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function SettingsScreen({ settings, t, onReset, onUpdateSettings }) {
  const hasProfession = Boolean(settings.profession?.trim());
  const [activeTab, setActiveTab] = useState("context");
  const professionOptions = getProfessionOptions(settings.locale);
  const professionLabels = resolveProfessionLabels(settings.profession);
  const localizedProfessionValue =
    settings.locale === "en" ? professionLabels.en || settings.profession || "" : professionLabels.pt || settings.profession || "";
  const rawSuggestionPriority = Array.isArray(settings.suggestionPriority)
    ? settings.suggestionPriority
    : [];
  const seenPriority = new Set();
  const validSuggestionPriority = rawSuggestionPriority.filter(
    (item) =>
      SUGGESTION_PRIORITY_TYPES.includes(item) &&
      !seenPriority.has(item) &&
      seenPriority.add(item),
  );
  const suggestionPriority = [
    ...validSuggestionPriority,
    ...DEFAULT_SUGGESTION_PRIORITY.filter((item) => !validSuggestionPriority.includes(item)),
  ];

  useEffect(() => {
    const currentProfession = settings.profession || "";

    if (!currentProfession.trim()) return;
    if (!professionLabels.id) return;
    if (currentProfession === localizedProfessionValue) return;

    onUpdateSettings({ profession: localizedProfessionValue });
  }, [localizedProfessionValue, onUpdateSettings, professionLabels.id, settings.profession]);

  useEffect(() => {
    const shouldNormalize =
      !Array.isArray(settings.suggestionPriority) ||
      settings.suggestionPriority.length !== suggestionPriority.length ||
      settings.suggestionPriority.some((item, index) => item !== suggestionPriority[index]);

    if (!shouldNormalize) return;
    onUpdateSettings({ suggestionPriority });
  }, [onUpdateSettings, settings.suggestionPriority, suggestionPriority]);

  const handleSuggestionPriorityChange = (position, value) => {
    const current = suggestionPriority.filter((item) => SUGGESTION_PRIORITY_TYPES.includes(item));
    const withoutSelected = current.filter((item) => item !== value);
    withoutSelected.splice(position, 0, value);
    onUpdateSettings({ suggestionPriority: withoutSelected });
  };

  return (
    <section className="screen settings-screen">
      <div className="screen-heading">
        <h1>{t("settings.title")}</h1>
        <p>{t("settings.subtitle")}</p>
      </div>

      <div className="settings-tabs-wrap">
        <SegmentedControl
          options={[
            { id: "context", label: t("settings.tabs.context") },
            { id: "preferences", label: t("settings.tabs.preferences") },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === "context" ? (
        <>
          {featureFlags.goalEnabled ? (
            <SettingsGroup title={t("settings.objective")}>
              <div className="settings-card objective-card">
                <label className="objective-input-wrap">
                  <span className="sr-only">{t("settings.objective")}</span>
                  <textarea
                    className="objective-input"
                    value={settings.goal || ""}
                    placeholder={t("settings.objectivePlaceholder")}
                    maxLength={180}
                    onChange={(event) => onUpdateSettings({ goal: event.target.value })}
                  />
                </label>
                <p>{t("settings.objectiveHint")}</p>
              </div>
            </SettingsGroup>
          ) : null}

          <SettingsGroup title={t("settings.profession")}>
            <div className="settings-card profession-card">
              <label className="profession-field">
                <span>{t("settings.professionLabel")}</span>
                <input
                  className="profession-input"
                  type="text"
                  list={`top-professions-${settings.locale}`}
                  value={localizedProfessionValue}
                  placeholder={t("settings.professionPlaceholder")}
                  maxLength={80}
                  onChange={(event) => onUpdateSettings({ profession: event.target.value })}
                />
                <datalist id={`top-professions-${settings.locale}`}>
                  {professionOptions.map((profession) => (
                    <option key={profession.id} value={profession.value} />
                  ))}
                </datalist>
              </label>
              <p>{t("settings.professionHint")}</p>
            </div>
          </SettingsGroup>

          {hasProfession ? (
            <SettingsGroup title={t("settings.workHours")}> 
              <div className="settings-card work-hours-card">
                <div className="work-hours-grid">
                  <label className="work-time-field">
                    <span>{t("settings.workStart")}</span>
                    <input
                      type="time"
                      value={settings.workHours?.start || "09:00"}
                      onChange={(event) =>
                        onUpdateSettings({
                          workHours: {
                            ...(settings.workHours || {}),
                            start: event.target.value,
                          },
                        })
                      }
                    />
                  </label>

                  <label className="work-time-field">
                    <span>{t("settings.workEnd")}</span>
                    <input
                      type="time"
                      value={settings.workHours?.end || "18:00"}
                      onChange={(event) =>
                        onUpdateSettings({
                          workHours: {
                            ...(settings.workHours || {}),
                            end: event.target.value,
                          },
                        })
                      }
                    />
                  </label>
                </div>
                <p>{t("settings.workHoursHint")}</p>
              </div>
            </SettingsGroup>
          ) : null}

          <SettingsGroup title={t("settings.suggestionOrder")}>
            <div className="settings-card suggestion-order-card">
              <p>{t("settings.suggestionOrderHint")}</p>
              <div className="suggestion-order-list">
                {suggestionPriority.map((priorityType, index) => (
                  <label className="suggestion-order-field" key={`priority-${index}`}>
                    <span>{t("settings.suggestionOrderPosition", { position: index + 1 })}</span>
                    <select
                      value={priorityType}
                      onChange={(event) => handleSuggestionPriorityChange(index, event.target.value)}
                    >
                      {SUGGESTION_PRIORITY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {t(`settings.suggestionType.${type}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          </SettingsGroup>
        </>
      ) : null}

      {activeTab === "preferences" ? (
        <>
          <SettingsGroup title={t("settings.interface")}> 
            <div className="settings-card appearance-card">
              <SegmentedControl
                options={[
                  { id: "compact", label: t("settings.compact") },
                  { id: "comfortable", label: t("settings.comfortable") },
                ]}
                value={settings.uiDensity || "compact"}
                onChange={(uiDensity) => onUpdateSettings({ uiDensity })}
              />
            </div>
          </SettingsGroup>

          <SettingsGroup title={t("settings.notifications")}>
            <div className="settings-card">
              <div className="settings-row">
                <span className="settings-icon">
                  <Bell aria-hidden="true" />
                </span>
                <strong>{t("settings.enableNotifications")}</strong>
                <Toggle
                  checked={settings.notificationsEnabled}
                  label={t("settings.enableNotifications")}
                  onChange={(notificationsEnabled) => onUpdateSettings({ notificationsEnabled })}
                />
              </div>
              <div className="settings-divider" />
              <div className="settings-tone-row">
                <span>{t("settings.tone")}</span>
                <SegmentedControl
                  options={[
                    { id: "soft", label: t("settings.soft") },
                    { id: "direct", label: t("settings.direct") },
                  ]}
                  value={settings.notificationTone}
                  onChange={(notificationTone) => onUpdateSettings({ notificationTone })}
                />
              </div>
            </div>
          </SettingsGroup>

          <SettingsGroup title={t("settings.feedback")}>
            <div className="settings-card single-row-card">
              <div className="settings-row">
                <span className="settings-icon">
                  <Smartphone aria-hidden="true" />
                </span>
                <strong>{t("settings.haptics")}</strong>
                <Toggle
                  checked={settings.hapticsEnabled}
                  label={t("settings.enableHaptics")}
                  onChange={(hapticsEnabled) => onUpdateSettings({ hapticsEnabled })}
                />
              </div>
            </div>
          </SettingsGroup>

          <SettingsGroup title={t("settings.appearance")}>
            <div className="settings-card appearance-card">
              <SegmentedControl
                options={[
                  { id: "system", label: t("settings.system"), icon: "▯" },
                  { id: "light", label: t("settings.light"), icon: "☼" },
                  { id: "dark", label: t("settings.dark"), icon: "☾" },
                ]}
                value={settings.appearance}
                onChange={(appearance) => onUpdateSettings({ appearance })}
              />
            </div>
          </SettingsGroup>

          <SettingsGroup title={t("settings.language")}>
            <div className="settings-card appearance-card">
              <SegmentedControl
                options={[
                  { id: "pt", label: t("settings.portuguese") },
                  { id: "en", label: t("settings.english") },
                ]}
                value={settings.locale}
                onChange={(locale) => onUpdateSettings({ locale })}
              />
            </div>
          </SettingsGroup>

          <button className="reset-button" type="button" onClick={onReset}>
            <Trash2 aria-hidden="true" />
            {t("settings.reset")}
          </button>

          <p className="app-version">✣ {t("settings.version")}</p>
        </>
      ) : null}
    </section>
  );
}
