import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bell, Download, GripVertical, Trash2, Upload } from "lucide-react";
import { SETTINGS_LIMITS } from "../config/appSettings";
import { featureFlags } from "../config/appSettings";
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

function SortablePriorityItem({ itemId, index, t }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemId,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const label = t(`settings.suggestionType.${itemId}`);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`suggestion-order-item ${isDragging ? "is-dragging" : ""}`}
    >
      <div className="suggestion-order-item-copy">
        <span>{t("settings.suggestionOrderPosition", { position: index + 1 })}</span>
        <strong>{label}</strong>
      </div>

      <button
        type="button"
        className="suggestion-order-drag-handle"
        aria-label={t("settings.suggestionOrderDragItem", { item: label })}
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden="true" />
      </button>
    </li>
  );
}

export function SettingsScreen({ settings, t, onReset, onUpdateSettings, onExportData, onImportData }) {
  const hasProfession = Boolean(settings.profession?.trim());
  const [activeTab, setActiveTab] = useState("context");
  const importInputRef = useRef(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleSuggestionPriorityDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = suggestionPriority.indexOf(active.id);
    const newIndex = suggestionPriority.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onUpdateSettings({ suggestionPriority: arrayMove(suggestionPriority, oldIndex, newIndex) });
  };

  const handleExportData = () => {
    if (typeof onExportData === "function") {
      onExportData();
    }
  };

  const handleImportData = async (file) => {
    if (typeof onImportData === "function") {
      await onImportData(file);
    }
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
            ...(featureFlags.dataPortabilityEnabled
              ? [{ id: "data", label: t("settings.tabs.data") }]
              : []),
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
                    maxLength={SETTINGS_LIMITS.goalMaxLength}
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
                  maxLength={SETTINGS_LIMITS.professionMaxLength}
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
              <p className="suggestion-order-drag-hint">{t("settings.suggestionOrderDragHint")}</p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragEnd={handleSuggestionPriorityDragEnd}
              >
                <SortableContext
                  items={suggestionPriority}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="suggestion-order-dnd-list">
                    {suggestionPriority.map((priorityType, index) => (
                      <SortablePriorityItem
                        key={priorityType}
                        itemId={priorityType}
                        index={index}
                        t={t}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
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

      {featureFlags.dataPortabilityEnabled && activeTab === "data" ? (
        <>
          <SettingsGroup title={t("settings.dataPortability")}> 
            <div className="settings-card data-portability-card">
              <p>{t("settings.dataPortabilityHint")}</p>
              <div className="data-actions">
                <button className="data-action-button" type="button" onClick={handleExportData}>
                  <Download aria-hidden="true" />
                  {t("settings.exportData")}
                </button>

                <button
                  className="data-action-button"
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                >
                  <Upload aria-hidden="true" />
                  {t("settings.importData")}
                </button>

                <input
                  ref={importInputRef}
                  className="data-import-input"
                  type="file"
                  accept="application/json,.json"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    await handleImportData(file);
                    event.target.value = "";
                  }}
                />
              </div>
            </div>
          </SettingsGroup>
        </>
      ) : null}
    </section>
  );
}
