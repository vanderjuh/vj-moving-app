import { getProfessionSuggestions } from "./professions";
import { featureFlags } from "../config/featureFlags";

export const STATES = ["STOPPED", "NEUTRAL", "ACTIVE"];
export const SUGGESTION_PRIORITY_TYPES = featureFlags.goalEnabled
  ? ["period", "profession", "goal"]
  : ["period", "profession"];
export const DEFAULT_SUGGESTION_PRIORITY = featureFlags.goalEnabled
  ? ["period", "profession", "goal"]
  : ["period", "profession"];

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

const action = (state, id, en, pt, periods = ["any"], source = "default") => ({
  id,
  state,
  label: en,
  labels: { en, pt },
  periods,
  source,
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

const getPeriodSuggestions = (state, now = new Date()) => {
  const suggestions = SUGGESTIONS_BY_STATE[state] || [];
  const currentPeriod = getDayPeriod(now);
  const byPeriod = suggestions.filter((item) => item.periods?.includes(currentPeriod));
  const anytime = suggestions.filter((item) => item.periods?.includes("any"));

  const seen = new Set();
  return [...byPeriod, ...anytime].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const normalizeSuggestionPriority = (priority) => {
  const raw = Array.isArray(priority) ? priority : [];
  const seen = new Set();
  const valid = raw.filter(
    (item) => SUGGESTION_PRIORITY_TYPES.includes(item) && !seen.has(item) && seen.add(item),
  );

  return [
    ...valid,
    ...DEFAULT_SUGGESTION_PRIORITY.filter((item) => !valid.includes(item)),
  ];
};

const parseTimeToMinutes = (time) => {
  if (typeof time !== "string" || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isWithinWorkHours = (now, workHours) => {
  const startMinutes = parseTimeToMinutes(workHours?.start);
  const endMinutes = parseTimeToMinutes(workHours?.end);

  if (startMinutes === null || endMinutes === null || startMinutes === endMinutes) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
};

const createGoalSuggestion = (state, locale, goal, currentPeriod, idSuffix, enTemplate, ptTemplate) => ({
  id: `${state.toLowerCase()}-goal-${idSuffix}`,
  state,
  label: enTemplate(goal),
  labels: {
    en: enTemplate(goal),
    pt: ptTemplate(goal),
  },
  periods: [currentPeriod, "any"],
  source: "goal",
});

const getGoalSuggestions = (state, goal, locale, currentPeriod) => {
  const safeGoal = typeof goal === "string" ? goal.trim().slice(0, 120) : "";

  if (!safeGoal) {
    return [];
  }

  if (state === "STOPPED") {
    return [
      createGoalSuggestion(
        state,
        locale,
        safeGoal,
        currentPeriod,
        "001",
        (value) => `Open your ${value} task and do only 2 minutes.`,
        (value) => `Abra a tarefa de ${value} e faça apenas 2 minutos.`,
      ),
      createGoalSuggestion(
        state,
        locale,
        safeGoal,
        currentPeriod,
        "002",
        (value) => `Write one tiny next step for: ${value}.`,
        (value) => `Escreva um próximo passo mínimo para: ${value}.`,
      ),
    ];
  }

  if (state === "NEUTRAL") {
    return [
      createGoalSuggestion(
        state,
        locale,
        safeGoal,
        currentPeriod,
        "001",
        (value) => `Break ${value} into 3 actionable steps.`,
        (value) => `Quebre ${value} em 3 passos acionáveis.`,
      ),
      createGoalSuggestion(
        state,
        locale,
        safeGoal,
        currentPeriod,
        "002",
        (value) => `Complete the first step toward ${value}.`,
        (value) => `Conclua o primeiro passo em direção a ${value}.`,
      ),
    ];
  }

  return [
    createGoalSuggestion(
      state,
      locale,
      safeGoal,
      currentPeriod,
      "001",
      (value) => `Finish one concrete deliverable for ${value}.`,
      (value) => `Finalize uma entrega concreta para ${value}.`,
    ),
    createGoalSuggestion(
      state,
      locale,
      safeGoal,
      currentPeriod,
      "002",
      (value) => `Prepare the next checkpoint for ${value}.`,
      (value) => `Prepare o próximo checkpoint para ${value}.`,
    ),
  ];
};

const getWorkHourSuggestions = (state, currentPeriod) => {
  if (state === "STOPPED") {
    return [
      {
        id: "stopped-work-001",
        state,
        label: "Open your top work task and do 2 focused minutes.",
        labels: {
          en: "Open your top work task and do 2 focused minutes.",
          pt: "Abra sua principal tarefa de trabalho e faça 2 minutos de foco.",
        },
        periods: [currentPeriod, "any"],
        source: "work",
      },
      {
        id: "stopped-work-002",
        state,
        label: "List one priority and one next action for this work block.",
        labels: {
          en: "List one priority and one next action for this work block.",
          pt: "Liste uma prioridade e uma próxima ação para este bloco de trabalho.",
        },
        periods: [currentPeriod, "any"],
        source: "work",
      },
    ];
  }

  if (state === "NEUTRAL") {
    return [
      {
        id: "neutral-work-001",
        state,
        label: "Run a 15-minute focused work sprint.",
        labels: {
          en: "Run a 15-minute focused work sprint.",
          pt: "Faça um sprint de trabalho focado de 15 minutos.",
        },
        periods: [currentPeriod, "any"],
        source: "work",
      },
      {
        id: "neutral-work-002",
        state,
        label: "Close one pending work item before switching tasks.",
        labels: {
          en: "Close one pending work item before switching tasks.",
          pt: "Feche uma pendência de trabalho antes de trocar de tarefa.",
        },
        periods: [currentPeriod, "any"],
        source: "work",
      },
    ];
  }

  return [
    {
      id: "active-work-001",
      state,
      label: "Deliver one concrete work output now.",
      labels: {
        en: "Deliver one concrete work output now.",
        pt: "Entregue agora um resultado concreto de trabalho.",
      },
      periods: [currentPeriod, "any"],
      source: "work",
    },
    {
      id: "active-work-002",
      state,
      label: "Record progress and define the next work checkpoint.",
      labels: {
        en: "Record progress and define the next work checkpoint.",
        pt: "Registre o progresso e defina o próximo checkpoint de trabalho.",
      },
      periods: [currentPeriod, "any"],
      source: "work",
    },
  ];
};

export const getSuggestionsForContext = ({
  state,
  goal = "",
  locale = "en",
  profession = "",
  workHours = { start: "09:00", end: "18:00" },
  suggestionPriority = DEFAULT_SUGGESTION_PRIORITY,
  now = new Date(),
}) => {
  const currentPeriod = getDayPeriod(now);
  const safeProfession = typeof profession === "string" ? profession.trim() : "";
  const priorityOrder = normalizeSuggestionPriority(suggestionPriority);
  const isWorkTime = isWithinWorkHours(now, workHours);

  const base = getSuggestionsForState(state, now);
  const periodSuggestions = getPeriodSuggestions(state, now);
  const goalSuggestions = featureFlags.goalEnabled
    ? getGoalSuggestions(state, goal, locale, currentPeriod)
    : [];
  const professionSuggestions = safeProfession && isWorkTime
    ? getProfessionSuggestions({
        state,
        profession: safeProfession,
        currentPeriod,
      })
    : [];
  const workHourSuggestions = safeProfession && isWorkTime
    ? getWorkHourSuggestions(state, currentPeriod)
    : [];

  const suggestionsByType = {
    period: periodSuggestions,
    profession: [...professionSuggestions, ...workHourSuggestions],
    goal: goalSuggestions,
  };

  const orderedGroups = priorityOrder.flatMap((type) => suggestionsByType[type] || []);
  const allSuggestions = [...orderedGroups, ...base];

  const seen = new Set();
  return allSuggestions.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};
