export const STATES = ["STOPPED", "NEUTRAL", "ACTIVE"];

export const STATE_META = {
  STOPPED: {
    label: "Stopped",
    tone: "blocked, low energy",
    prompt: "Start with the smallest possible movement.",
  },
  NEUTRAL: {
    label: "Neutral",
    tone: "available, not yet engaged",
    prompt: "Choose one light action to create traction.",
  },
  ACTIVE: {
    label: "Active",
    tone: "engaged, ready to act",
    prompt: "Protect the momentum with a focused next step.",
  },
};

const action = (state, id, en, pt, periods = ["any"]) => ({
  id,
  state,
  label: en,
  labels: { en, pt },
  periods,
});

export const DEFAULT_ACTIONS = [
  action("STOPPED", "stopped-001", "Drink a glass of water.", "Beba um copo de água.", ["morning", "afternoon", "evening"]),
  action("STOPPED", "stopped-002", "Stand up and stretch for 30 seconds.", "Levante e alongue por 30 segundos.", ["any"]),
  action("STOPPED", "stopped-003", "Open the task you are avoiding.", "Abra a tarefa que você está evitando.", ["afternoon", "evening"]),
  action("STOPPED", "stopped-004", "Write only the first sentence.", "Escreva apenas a primeira frase.", ["morning", "afternoon"]),
  action("STOPPED", "stopped-005", "Set a 2-minute timer and begin.", "Defina um timer de 2 minutos e comece.", ["any"]),
  action("STOPPED", "stopped-006", "Clear one small area of your desk.", "Organize uma pequena área da mesa.", ["morning", "afternoon"]),
  action("STOPPED", "stopped-007", "Close one distracting app.", "Feche um app que está te distraindo.", ["any"]),
  action("STOPPED", "stopped-008", "Put your phone out of reach.", "Deixe o celular fora do alcance.", ["any"]),
  action("STOPPED", "stopped-009", "Open your notes and write one bullet.", "Abra suas notas e escreva um tópico.", ["morning", "afternoon", "evening"]),
  action("STOPPED", "stopped-010", "Take 5 slow breaths.", "Faça 5 respirações lentas.", ["any"]),
  action("STOPPED", "stopped-011", "Open the exact file needed for the next step.", "Abra o arquivo exato do próximo passo.", ["morning", "afternoon"]),
  action("STOPPED", "stopped-012", "Do a task that takes less than 1 minute.", "Faça uma tarefa que leve menos de 1 minuto.", ["evening", "night"]),

  action("NEUTRAL", "neutral-001", "List the next 3 concrete steps.", "Liste os próximos 3 passos concretos.", ["morning", "afternoon"]),
  action("NEUTRAL", "neutral-002", "Complete only step 1.", "Conclua apenas o passo 1.", ["any"]),
  action("NEUTRAL", "neutral-003", "Answer one pending message.", "Responda uma mensagem pendente.", ["morning", "afternoon", "evening"]),
  action("NEUTRAL", "neutral-004", "Draft and send a quick status update.", "Escreva e envie uma atualização rápida.", ["afternoon", "evening"]),
  action("NEUTRAL", "neutral-005", "Rename and organize one important file.", "Renomeie e organize um arquivo importante.", ["morning", "afternoon"]),
  action("NEUTRAL", "neutral-006", "Schedule a 15-minute focus block.", "Agende um bloco de foco de 15 minutos.", ["morning"]),
  action("NEUTRAL", "neutral-007", "Break one task into subtasks.", "Quebre uma tarefa em subtarefas.", ["any"]),
  action("NEUTRAL", "neutral-008", "Choose your top priority for today.", "Escolha sua prioridade número 1 de hoje.", ["morning"]),
  action("NEUTRAL", "neutral-009", "Finish one easy pending task.", "Finalize uma pendência fácil.", ["afternoon", "evening"]),
  action("NEUTRAL", "neutral-010", "Prepare all materials for the next task.", "Separe todo o material da próxima tarefa.", ["morning", "afternoon"]),
  action("NEUTRAL", "neutral-011", "Review your calendar for the next 2 hours.", "Revise seu calendário para as próximas 2 horas.", ["morning", "afternoon"]),
  action("NEUTRAL", "neutral-012", "Define what “done” means for this task.", "Defina o que significa “concluído” para esta tarefa.", ["any"]),

  action("ACTIVE", "active-001", "Work in focus for 15 minutes.", "Trabalhe com foco por 15 minutos.", ["morning", "afternoon"]),
  action("ACTIVE", "active-002", "Finish one deliverable and mark it done.", "Conclua uma entrega e marque como feita.", ["afternoon", "evening"]),
  action("ACTIVE", "active-003", "Send the version you already have.", "Envie a versão que você já tem.", ["afternoon", "evening"]),
  action("ACTIVE", "active-004", "Run a quick quality check before closing.", "Faça uma checagem rápida antes de fechar.", ["afternoon", "evening"]),
  action("ACTIVE", "active-005", "Update task status in your tracker.", "Atualize o status no seu gerenciador.", ["any"]),
  action("ACTIVE", "active-006", "Close all tabs unrelated to this task.", "Feche abas não relacionadas a esta tarefa.", ["any"]),
  action("ACTIVE", "active-007", "Resolve one blocker now.", "Resolva um bloqueio agora.", ["morning", "afternoon"]),
  action("ACTIVE", "active-008", "Send a follow-up to unblock someone.", "Envie um follow-up para destravar alguém.", ["afternoon", "evening"]),
  action("ACTIVE", "active-009", "Write a short summary of what was done.", "Escreva um resumo curto do que foi feito.", ["evening", "night"]),
  action("ACTIVE", "active-010", "Prepare the very next step before stopping.", "Prepare o próximo passo antes de parar.", ["evening", "night"]),
  action("ACTIVE", "active-011", "Review one section and improve clarity.", "Revise uma seção e melhore a clareza.", ["morning", "afternoon"]),
  action("ACTIVE", "active-012", "Finish and send one pending reply.", "Finalize e envie uma resposta pendente.", ["afternoon", "evening"]),
];

export const SUGGESTIONS_BY_STATE = DEFAULT_ACTIONS.reduce(
  (groups, item) => ({
    ...groups,
    [item.state]: [...groups[item.state], item],
  }),
  { STOPPED: [], NEUTRAL: [], ACTIVE: [] },
);

export const getDayPeriod = (now = new Date()) => {
  const hour = now.getHours();

  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

export const getSuggestionsForState = (state, now = new Date()) => {
  const suggestions = SUGGESTIONS_BY_STATE[state] || [];
  const currentPeriod = getDayPeriod(now);
  const byPeriod = suggestions.filter((item) => item.periods?.includes(currentPeriod));
  const anytime = suggestions.filter((item) => item.periods?.includes("any"));

  const seen = new Set();
  return [...byPeriod, ...anytime, ...suggestions].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};
