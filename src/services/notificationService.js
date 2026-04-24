const MESSAGES = {
  en: {
    soft: {
      permissionGranted: "Notifications enabled. Gentle reminders are ready.",
      permissionDenied: "Notifications are blocked in your browser settings.",
      unsupported: "This browser does not support notifications.",
      actionTitle: "Nice progress",
      actionBody: (label) => `You completed: ${label}`,
      resetTitle: "Fresh start",
      resetBody: "All local data has been reset.",
    },
    direct: {
      permissionGranted: "Notifications enabled.",
      permissionDenied: "Notifications blocked. Enable browser permission.",
      unsupported: "Notifications unsupported in this browser.",
      actionTitle: "Action logged",
      actionBody: (label) => label,
      resetTitle: "Data reset",
      resetBody: "Local data reset completed.",
    },
  },
  pt: {
    soft: {
      permissionGranted: "Notificações ativadas. Lembretes suaves prontos.",
      permissionDenied: "Notificações bloqueadas nas configurações do navegador.",
      unsupported: "Este navegador não oferece suporte a notificações.",
      actionTitle: "Bom progresso",
      actionBody: (label) => `Você concluiu: ${label}`,
      resetTitle: "Recomeço",
      resetBody: "Todos os dados locais foram redefinidos.",
    },
    direct: {
      permissionGranted: "Notificações ativadas.",
      permissionDenied: "Notificações bloqueadas. Libere a permissão no navegador.",
      unsupported: "Notificações não suportadas neste navegador.",
      actionTitle: "Ação registrada",
      actionBody: (label) => label,
      resetTitle: "Dados redefinidos",
      resetBody: "Redefinição local concluída.",
    },
  },
};

const resolveLocale = (locale) => (locale === "pt" ? "pt" : "en");
const resolveTone = (tone) => (tone === "direct" ? "direct" : "soft");

const getPack = (locale, tone) => {
  const safeLocale = resolveLocale(locale);
  const safeTone = resolveTone(tone);
  return MESSAGES[safeLocale][safeTone];
};

const isSupported = () => typeof window !== "undefined" && "Notification" in window;

const requestPermission = async () => {
  if (!isSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
};

const showNotification = async (title, body) => {
  if (!isSupported()) return false;

  const permission = await requestPermission();
  if (permission !== "granted") return false;

  try {
    new Notification(title, { body, silent: true });
    return true;
  } catch {
    return false;
  }
};

const notifyActionCompleted = async ({ locale, tone, label }) => {
  const text = getPack(locale, tone);
  return showNotification(text.actionTitle, text.actionBody(label));
};

const notifyReset = async ({ locale, tone }) => {
  const text = getPack(locale, tone);
  return showNotification(text.resetTitle, text.resetBody);
};

const getPermissionFeedbackMessage = ({ locale, tone, status }) => {
  const text = getPack(locale, tone);

  if (status === "granted") return text.permissionGranted;
  if (status === "denied") return text.permissionDenied;
  if (status === "unsupported") return text.unsupported;
  return "";
};

export const notificationService = {
  isSupported,
  requestPermission,
  notifyActionCompleted,
  notifyReset,
  getPermissionFeedbackMessage,
};
