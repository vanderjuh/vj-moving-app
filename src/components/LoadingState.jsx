export function LoadingState({ t }) {
  return (
    <main className="loading-shell">
      <section className="loader-card">
        <div className="loader-mark" />
        <p className="section-kicker">{t("loading.label")}</p>
        <h1>{t("loading.title")}</h1>
      </section>
    </main>
  );
}
