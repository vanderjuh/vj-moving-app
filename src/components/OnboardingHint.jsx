export function OnboardingHint({ t }) {
  return (
    <aside className="onboarding-hint">
      <strong>{t("onboarding.title")}</strong>
      <p>{t("onboarding.body")}</p>
    </aside>
  );
}
