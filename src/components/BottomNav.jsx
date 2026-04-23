import { History, Home, Settings } from "lucide-react";

const tabs = [
  {
    id: "home",
    labelKey: "nav.home",
    icon: Home,
  },
  {
    id: "history",
    labelKey: "nav.history",
    icon: History,
  },
  {
    id: "settings",
    labelKey: "nav.settings",
    icon: Settings,
  },
];

export function BottomNav({ activeTab, t, onTabChange }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            className={`nav-item ${isActive ? "is-active" : ""}`}
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon aria-hidden="true" />
            <span>{t(tab.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
