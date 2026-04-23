function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.8 10.2a5.2 5.2 0 0 1 10.4 0v4.1l1.6 2.2H5.2l1.6-2.2v-4.1Z" />
      <path d="M10.2 19a2 2 0 0 0 3.6 0" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4h6v16H9z" />
      <path d="M7 9 5.5 7.5M7 15l-1.5 1.5M17 9l1.5-1.5M17 15l1.5 1.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 14h8l1-14" />
    </svg>
  );
}

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
  return (
    <section className="screen settings-screen">
      <div className="screen-heading">
        <h1>{t("settings.title")}</h1>
        <p>{t("settings.subtitle")}</p>
      </div>

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

      <SettingsGroup title={t("settings.notifications")}>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-icon">
              <BellIcon />
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
              <PhoneIcon />
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
        <TrashIcon />
        {t("settings.reset")}
      </button>

      <p className="app-version">✣ {t("settings.version")}</p>
    </section>
  );
}
