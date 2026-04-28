import { TrackCategory } from "@prisma/client";

type LessonLike = {
  id: string;
  title: string;
  body: string;
  order: number;
};

export type LessonBlockType =
  | "heading"
  | "paragraph"
  | "markdown"
  | "list"
  | "table"
  | "callout"
  | "code_block"
  | "image"
  | "video"
  | "quote"
  | "divider"
  | "key_idea"
  | "common_mistakes"
  | "real_world_example"
  | "important_concept"
  | "summary"
  | "quick_check"
  | "mini_challenge"
  | "lesson_panel";

export type LessonQuickCheck = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type LessonBlock = {
  id: string;
  type: LessonBlockType;
  title?: string;
  content?: string;
  items?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  code?: {
    language: string;
    value: string;
  };
  media?: {
    url: string;
    alt?: string;
  };
  lesson?: {
    order: number;
    total: number;
    title: string;
    focus: string;
    mission: string;
    artifact: string;
    checkpoint: string;
  };
  quickCheck?: LessonQuickCheck;
  challengePrompt?: string;
  challengeHint?: string;
};

function makeId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

function trackExample(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return "Как команды Netflix проверяют API-контракты, чтобы избежать регрессий в продакшне.";
  }
  if (category === TrackCategory.BA) {
    return "Как аналитики Amazon используют user stories и критерии приёмки в кросс-командном планировании.";
  }
  return "Как аналитики Spotify используют SQL и дашборды для отслеживания вовлечённости и удержания.";
}

function commonMistakes(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return [
      "Тестировать только happy-path сценарии",
      "Писать баг-репорты без шагов воспроизведения",
      "Пропускать регрессионные проверки перед релизом",
    ];
  }
  if (category === TrackCategory.BA) {
    return [
      "Расплывчатые user stories без критериев приёмки",
      "Отсутствие валидации со стейкхолдерами",
      "Смешение деталей решения с бизнес-требованиями",
    ];
  }
  return [
    "Неправильная гранулярность агрегации",
    "Игнорирование null-значений и выбросов",
    "Презентация метрик без бизнес-контекста",
  ];
}

function missionBrief(category: TrackCategory, moduleTitle: string, locale: "en" | "ru") {
  if (category === TrackCategory.QA) {
    return locale === "ru"
      ? `Вы junior QA на первом спринте. Команда дала вам небольшую фичу по теме "${moduleTitle}". Ваша цель - не выучить все термины сразу, а найти 3 риска, проверить 1 сценарий и понятно записать результат.`
      : `You are a junior QA in your first sprint. The team gives you a small feature related to "${moduleTitle}". Your goal is not to memorize every term. Find 3 risks, test 1 scenario, and write down the result clearly.`;
  }
  if (category === TrackCategory.BA) {
    return locale === "ru"
      ? `Вы junior BA на discovery-встрече. По теме "${moduleTitle}" нужно понять цель пользователя, задать 3 уточняющих вопроса и превратить ответ в проверяемое требование.`
      : `You are a junior BA in a discovery session. For "${moduleTitle}", identify the user goal, ask 3 clarifying questions, and turn the answer into a testable requirement.`;
  }
  return locale === "ru"
    ? `Вы junior data analyst. По теме "${moduleTitle}" нужно понять бизнес-вопрос, выбрать 1 метрику и объяснить вывод так, чтобы его понял неаналитик.`
    : `You are a junior data analyst. For "${moduleTitle}", understand the business question, choose 1 metric, and explain the insight so a non-analyst can understand it.`;
}

function firstWin(category: TrackCategory, locale: "en" | "ru") {
  if (category === TrackCategory.QA) {
    return locale === "ru"
      ? "Первый win: вы можете объяснить, что проверили, какой риск нашли и что команда должна сделать дальше."
      : "First win: you can explain what you checked, what risk you found, and what the team should do next.";
  }
  if (category === TrackCategory.BA) {
    return locale === "ru"
      ? "Первый win: вы превратили расплывчатую фразу стейкхолдера в понятное требование с acceptance criteria."
      : "First win: you turned a vague stakeholder sentence into a clear requirement with acceptance criteria.";
  }
  return locale === "ru"
    ? "Первый win: вы нашли простую закономерность в данных и связали её с бизнес-действием."
    : "First win: you found a simple pattern in the data and connected it to a business action.";
}

function starterSteps(category: TrackCategory, locale: "en" | "ru") {
  if (category === TrackCategory.QA) {
    return locale === "ru"
      ? [
          "1. Прочитайте сценарий как пользователь, не как эксперт.",
          "2. Найдите, где пользователь может ошибиться или застрять.",
          "3. Проверьте один happy path и один плохой сценарий.",
          "4. Запишите результат в формате: шаги -> ожидание -> факт -> риск.",
        ]
      : [
          "1. Read the scenario like a user, not an expert.",
          "2. Find where the user can fail or get stuck.",
          "3. Check one happy path and one bad path.",
          "4. Write the result as: steps -> expected -> actual -> risk.",
        ];
  }
  if (category === TrackCategory.BA) {
    return locale === "ru"
      ? [
          "1. Назовите пользователя и его цель.",
          "2. Найдите непонятные слова в требовании.",
          "3. Задайте 3 вопроса стейкхолдеру.",
          "4. Запишите критерии: когда задача считается готовой.",
        ]
      : [
          "1. Name the user and their goal.",
          "2. Find vague words in the requirement.",
          "3. Ask 3 stakeholder questions.",
          "4. Write the criteria for when the task is done.",
        ];
  }
  return locale === "ru"
    ? [
        "1. Сформулируйте бизнес-вопрос простыми словами.",
        "2. Выберите одну метрику, которая помогает ответить.",
        "3. Проверьте данные на пропуски и странные значения.",
        "4. Напишите вывод в формате: что увидел -> почему важно -> что сделать.",
      ]
    : [
        "1. State the business question in plain language.",
        "2. Pick one metric that helps answer it.",
        "3. Check the data for missing and strange values.",
        "4. Write the insight as: what I saw -> why it matters -> what to do.",
      ];
}

function quickCheck(category: TrackCategory, locale: "en" | "ru"): LessonQuickCheck {
  if (category === TrackCategory.QA) {
    if (locale === "ru") {
      return {
        question: "Что обычно означает HTTP 200 в API-тестировании?",
        options: ["Запрос завершился ошибкой", "Запрос успешно обработан", "Пользователь не авторизован", "Сервер не отвечает"],
        correctIndex: 1,
        explanation: "HTTP 200 обычно означает, что сервер успешно обработал запрос.",
      };
    }
    return {
      question: "What does HTTP 200 usually mean in API testing?",
      options: ["Request failed", "Request succeeded", "User is unauthorized", "Server timeout"],
      correctIndex: 1,
      explanation: "HTTP 200 indicates successful request processing by the server.",
    };
  }
  if (category === TrackCategory.BA) {
    if (locale === "ru") {
      return {
        question: "Что обязательно должно быть в хорошем user story?",
        options: ["Только UI-дизайн", "Роль, цель и ценность", "Схема базы данных", "Скрипт деплоя"],
        correctIndex: 1,
        explanation: "Качественный user story начинается с роли, намерения и бизнес-ценности.",
      };
    }
    return {
      question: "What must a good user story include?",
      options: ["Only UI design", "A role, goal, and value", "Database schema", "Deployment script"],
      correctIndex: 1,
      explanation: "User story quality starts with role + intent + business value.",
    };
  }
  if (locale === "ru") {
    return {
      question: "Для чего в первую очередь нужен SQL JOIN?",
      options: ["Создавать пользователей", "Объединять данные из таблиц", "Деплоить backend", "Форматировать CSS"],
      correctIndex: 1,
      explanation: "JOIN связывает строки из двух и более таблиц по связанным колонкам.",
    };
  }
  return {
    question: "What is the main purpose of SQL JOIN?",
    options: ["Create users", "Combine data from tables", "Deploy backend", "Format CSS"],
    correctIndex: 1,
    explanation: "JOIN links rows from two or more tables using related columns.",
  };
}

function lessonFocus(category: TrackCategory, lesson: LessonLike, locale: "en" | "ru") {
  const title = lesson.title.toLowerCase();
  if (category === TrackCategory.QA) {
    if (title.includes("practice") || title.includes("практика")) {
      return locale === "ru" ? "Собрать рабочий QA-артефакт" : "Build a practical QA artifact";
    }
    if (title.includes("api") || title.includes("postman") || title.includes("devtools")) {
      return locale === "ru" ? "Разобрать поведение системы по evidence" : "Investigate system behavior with evidence";
    }
    if (title.includes("bug") || title.includes("release") || title.includes("релиз")) {
      return locale === "ru" ? "Превратить находку в понятное решение для команды" : "Turn a finding into a clear team decision";
    }
    return locale === "ru" ? "Понять роль QA через реальный рабочий сценарий" : "Understand QA through a real workflow";
  }
  if (category === TrackCategory.BA) {
    return locale === "ru" ? "Превратить расплывчатую идею в проверяемое требование" : "Turn a vague idea into a testable requirement";
  }
  return locale === "ru" ? "Связать данные с бизнес-вопросом" : "Connect data to a business question";
}

function lessonMission(category: TrackCategory, lesson: LessonLike, locale: "en" | "ru") {
  if (category === TrackCategory.QA) {
    return locale === "ru"
      ? `Вы на смене junior QA. За 15 минут разберите "${lesson.title}", найдите один риск и оформите результат так, чтобы разработчик или PM мог действовать.`
      : `You are on a junior QA shift. Spend 15 minutes on "${lesson.title}", find one risk, and write the result so a developer or PM can act.`;
  }
  if (category === TrackCategory.BA) {
    return locale === "ru"
      ? `Вы на discovery-сессии. После урока у вас должен быть один уточняющий вопрос и один проверяемый критерий.`
      : `You are in a discovery session. After the lesson, you need one clarifying question and one testable criterion.`;
  }
  return locale === "ru"
    ? `Вы готовите короткий аналитический вывод. После урока назовите метрику, риск в данных и одно действие.`
    : `You are preparing a short analytical insight. After the lesson, name one metric, one data risk, and one action.`;
}

function lessonArtifact(category: TrackCategory, lesson: LessonLike, locale: "en" | "ru") {
  const title = lesson.title.toLowerCase();
  if (category === TrackCategory.QA) {
    if (title.includes("practice") || title.includes("практика")) {
      return locale === "ru" ? "Checklist, test case или короткий QA-report" : "Checklist, test case, or short QA report";
    }
    if (title.includes("devtools") || title.includes("postman") || title.includes("api")) {
      return locale === "ru" ? "Investigation note с request/response evidence" : "Investigation note with request/response evidence";
    }
    if (title.includes("bug") || title.includes("release") || title.includes("релиз")) {
      return locale === "ru" ? "Bug report или release recommendation" : "Bug report or release recommendation";
    }
    return locale === "ru" ? "QA intake note или risk list" : "QA intake note or risk list";
  }
  if (category === TrackCategory.BA) {
    return locale === "ru" ? "User story с acceptance criteria" : "User story with acceptance criteria";
  }
  return locale === "ru" ? "Короткий insight с метрикой и действием" : "Short insight with metric and action";
}

export function buildLessonBlocks(params: {
  category: TrackCategory;
  locale?: "en" | "ru";
  moduleTitle: string;
  moduleDescription: string;
  moduleOverview: string;
  outcomes: string[];
  resources: string[];
  realWorldExample?: string;
  quickChecks?: string[];
  lessons: LessonLike[];
}): LessonBlock[] {
  const {
    category,
    locale = "en",
    moduleTitle,
    moduleDescription,
    moduleOverview,
    outcomes,
    resources,
    realWorldExample,
    quickChecks,
    lessons,
  } = params;
  const listItems = outcomes.length > 0 ? outcomes : ["Understand core ideas", "Apply in practice", "Prepare for quiz"];
  const resourceItems = resources.length > 0 ? resources : ["Read notes", "Try mini challenge", "Review quiz mistakes"];
  const qc = quickCheck(category, locale);
  const localized = {
    learningFocus: locale === "ru" ? "Фокус обучения" : "Learning focus",
    whatYouWillLearn: locale === "ru" ? "Что вы изучите" : "What you will learn",
    conceptMap: locale === "ru" ? "Карта понятий" : "Concept map",
    importantConcept: locale === "ru" ? "Важная идея" : "Important concept",
    lessonSummary: locale === "ru" ? "Итог урока" : "Lesson summary",
    selfCheck: locale === "ru" ? "Вопросы для самопроверки" : "Self-check questions",
    realWorldExample: locale === "ru" ? "Пример из практики" : "Real world example",
    commonMistakes: locale === "ru" ? "Типичные ошибки" : "Common Mistakes",
    quickCheck: locale === "ru" ? "Быстрая проверка" : "Quick Check",
    miniChallenge: locale === "ru" ? "Мини-практика" : "Mini Challenge",
    summary: locale === "ru" ? "Итоги модуля" : "Module summary",
    missionBrief: locale === "ru" ? "Миссия на 10 минут" : "10-minute mission",
    firstWin: locale === "ru" ? "Первый быстрый результат" : "First quick win",
    starterSteps: locale === "ru" ? "Пошаговый план для новичка" : "Beginner step-by-step plan",
    notNeededYet: locale === "ru" ? "Что пока не нужно знать" : "What you do not need yet",
  };
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const lessonBlocks = sortedLessons
    .sort((a, b) => a.order - b.order)
    .flatMap((lesson, index): LessonBlock[] => ([
      // Visual separator between lessons (not before the first one)
      ...(index > 0 ? [{
        id: makeId("lesson-divider", index + 10),
        type: "divider" as const,
      }] : []),
      {
        id: `lesson-panel-${lesson.id}`,
        type: "lesson_panel",
        title: `${lesson.order}. ${lesson.title}`,
        content: lesson.body,
        lesson: {
          order: lesson.order,
          total: sortedLessons.length,
          title: lesson.title,
          focus: lessonFocus(category, lesson, locale),
          mission: lessonMission(category, lesson, locale),
          artifact: lessonArtifact(category, lesson, locale),
          checkpoint: locale === "ru"
            ? "После чтения запишите 3 строки: что проверю, какой риск ищу, какой evidence приложу."
            : "After reading, write 3 lines: what I check, what risk I look for, what evidence I attach.",
        },
      },
    ]));

  const blocks: LessonBlock[] = [
    {
      id: makeId("heading", 0),
      type: "heading",
      title: moduleTitle,
      content: moduleDescription,
    },
    {
      id: makeId("key-idea", 1),
      type: "key_idea",
      title: localized.importantConcept,
      content: moduleOverview || moduleDescription,
    },
    {
      id: makeId("mission-brief", 2),
      type: "callout",
      title: localized.missionBrief,
      content: missionBrief(category, moduleTitle, locale),
    },
    {
      id: makeId("first-win", 3),
      type: "real_world_example",
      title: localized.firstWin,
      content: firstWin(category, locale),
    },
    {
      id: makeId("starter-steps", 4),
      type: "list",
      title: localized.starterSteps,
      items: starterSteps(category, locale),
    },
    {
      id: makeId("markdown", 5),
      type: "markdown",
      title: localized.learningFocus,
      content: locale === "ru"
        ? "### Как проходить модуль\n- Не пытайтесь запомнить всё сразу\n- Делайте маленький артефакт после каждого урока\n- Если застряли, нажмите AI hint и попросите пример проще\n- В конце сравните свой ответ с квизом"
        : "### How to move through this module\n- Do not try to memorize everything at once\n- Create one small artifact after each lesson\n- If you get stuck, use AI hint and ask for a simpler example\n- At the end, compare your answer with the quiz",
    },
    {
      id: makeId("list", 6),
      type: "list",
      title: localized.whatYouWillLearn,
      items: listItems,
    },
    {
      id: makeId("table", 7),
      type: "table",
      title: localized.conceptMap,
      table: {
        headers: locale === "ru"
          ? ["Концепт", "Зачем это нужно", "Как практиковать"]
          : ["Concept", "Why it matters", "How to practice"],
        rows: [
          locale === "ru"
            ? ["Теория", "Создает фундамент", "Разберите ключевые уроки"]
            : ["Theory", "Builds the foundation", "Review the key lessons"],
          locale === "ru"
            ? ["Практика", "Превращает знание в навык", "Выполните задания и проверки"]
            : ["Practice", "Turns knowledge into skill", "Complete tasks and checkpoints"],
          locale === "ru"
            ? ["Рефлексия", "Не дает повторять ошибки", "Сверьте выводы и квиз"]
            : ["Reflection", "Prevents repeated mistakes", "Compare findings with quiz feedback"],
        ],
      },
    },
    {
      id: makeId("callout", 8),
      type: "callout",
      title: localized.notNeededYet,
      content: locale === "ru"
        ? "На этом этапе не нужно знать все инструменты, стандарты и исключения. Достаточно научиться видеть риск, задавать хороший вопрос и фиксировать результат понятно."
        : "At this stage you do not need every tool, standard, and exception. It is enough to spot a risk, ask a good question, and document the result clearly.",
    },
    ...lessonBlocks,
    {
      id: makeId("real-world", 80),
      type: "real_world_example",
      title: localized.realWorldExample,
      content: realWorldExample || trackExample(category),
    },
    {
      id: makeId("mistakes", 81),
      type: "common_mistakes",
      title: localized.commonMistakes,
      items: commonMistakes(category),
    },
    {
      id: makeId("self-check", 82),
      type: "list",
      title: localized.selfCheck,
      items: quickChecks && quickChecks.length > 0
        ? quickChecks
        : locale === "ru"
          ? ["Сформулируйте 2 ключевых вывода после модуля", "Назовите 1 риск, который вы проверите первым", "Опишите, что еще требует уточнения"]
          : ["Write 2 key takeaways from the module", "Name 1 risk you would test first", "Describe what still needs clarification"],
    },
    {
      id: makeId("divider", 83),
      type: "divider",
    },
    {
      id: makeId("quick-check", 84),
      type: "quick_check",
      title: localized.quickCheck,
      quickCheck: qc,
    },
    {
      id: makeId("mini-challenge", 85),
      type: "mini_challenge",
      title: localized.miniChallenge,
      challengePrompt: locale === "ru"
        ? `Представьте, что вам дали маленькую задачу по теме "${moduleTitle}". Напишите 3 пункта: что проверите первым, какой риск ищете, как поймёте, что всё работает.`
        : `Imagine you got a small task about "${moduleTitle}". Write 3 bullets: what you check first, what risk you look for, and how you know it works.`,
      challengeHint: locale === "ru"
        ? "Держите ответ коротким. Формат: проверка -> риск -> ожидаемый результат."
        : "Keep it short. Format: check -> risk -> expected result.",
    },
    {
      id: makeId("summary", 86),
      type: "summary",
      title: localized.summary,
      items: resourceItems,
      content: locale === "ru"
        ? "Главная цель модуля - не закрыть длинный текст, а сделать маленький рабочий артефакт: вопрос, проверку, баг-репорт, требование или вывод."
        : "The main goal is not to finish a long text. It is to create one small work artifact: a question, check, bug report, requirement, or insight.",
    },
  ];

  return blocks;
}

export function buildLessonRecommendations(params: {
  hasNextLesson: boolean;
  nextLessonTitle: string | null;
  nextModuleTitle: string | null;
}) {
  return [
    {
      id: "next-lesson",
      title: params.hasNextLesson ? `Следующий урок: ${params.nextLessonTitle}` : "Повторить текущий урок",
      description: params.hasNextLesson
        ? "Продолжайте обучение — следующий шаг пути уже доступен."
        : "Закрепите ключевые концепции перед переходом дальше.",
    },
    {
      id: "recommended-module",
      title: params.nextModuleTitle ? `Рекомендованный модуль: ${params.nextModuleTitle}` : "Завершить текущий трек",
      description: "Сохраняйте темп и открывайте новые навыки.",
    },
    {
      id: "suggested-practice",
      title: "Практика",
      description: "Пройдите быструю проверку, сдайте тест и запустите симуляцию для максимума XP.",
    },
  ];
}
