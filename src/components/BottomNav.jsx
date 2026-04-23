const tabs = [
  {
    id: "home",
    labelKey: "nav.home",
    icon: (
      <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.6v-6.1H9.6V21H5a1 1 0 0 1-1-1v-8.5Z" />
    ),
  },
  {
    id: "history",
    labelKey: "nav.history",
    icon: (
      <>
        <path d="M12 21a9 9 0 1 0-8.6-11.7" />
        <path d="M3 5v4.3h4.3" />
        <path d="M12 7.8v5l3.4 2" />
      </>
    ),
  },
  {
    id: "settings",
    labelKey: "nav.settings",
    icon: (
      <>
        <path d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z" />
        <path d="m19.4 15.1 1.1 2-2 3.5-2.3-.8a8.1 8.1 0 0 1-2 1.1L13.8 23h-4l-.4-2.1a8.1 8.1 0 0 1-2-1.1l-2.3.8-2-3.5 1.1-2a8.7 8.7 0 0 1 0-2.2l-1.1-2 2-3.5 2.3.8a8.1 8.1 0 0 1 2-1.1L9.8 5h4l.4 2.1a8.1 8.1 0 0 1 2 1.1l2.3-.8 2 3.5-1.1 2a8.7 8.7 0 0 1 0 2.2Z" />
      </>
    ),
  },
];

export function BottomNav({ activeTab, t, onTabChange }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            className={`nav-item ${isActive ? "is-active" : ""}`}
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTabChange(tab.id)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {tab.icon}
            </svg>
            <span>{t(tab.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
