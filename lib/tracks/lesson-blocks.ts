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
  | "mini_challenge";

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
    codePattern: locale === "ru" ? "Пример структуры" : "Structure example",
  };
  const lessonBlocks = [...lessons]
    .sort((a, b) => a.order - b.order)
    .flatMap((lesson, index): LessonBlock[] => ([
      // Visual separator between lessons (not before the first one)
      ...(index > 0 ? [{
        id: makeId("lesson-divider", index + 10),
        type: "divider" as const,
      }] : []),
      {
        id: makeId("lesson-heading", index + 20),
        type: "heading",
        title: `${lesson.order}. ${lesson.title}`,
        content: moduleDescription,
      },
      {
        id: makeId("lesson-markdown", index + 40),
        type: "markdown",
        title: locale === "ru" ? "Содержание урока" : "Lesson content",
        content: lesson.body,
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
      id: makeId("markdown", 2),
      type: "markdown",
      title: localized.learningFocus,
      content: locale === "ru"
        ? "### Подход\n- Понять идею\n- Разобрать сценарии\n- Подтвердить результат практикой"
        : "### Approach\n- Understand the concept\n- Break down the scenarios\n- Confirm the result through practice",
    },
    {
      id: makeId("list", 3),
      type: "list",
      title: localized.whatYouWillLearn,
      items: listItems,
    },
    {
      id: makeId("table", 4),
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
      id: makeId("callout", 5),
      type: "callout",
      title: localized.importantConcept,
      content: locale === "ru"
        ? "Стройте воспроизводимый workflow: гипотеза -> действие -> проверка результата."
        : "Build a reproducible workflow: hypothesis -> action -> validation.",
    },
    {
      id: makeId("code", 6),
      type: "code_block",
      title: localized.codePattern,
      code: {
        language: "ts",
        value: "const progress = completed / total;\nif (progress >= 1) unlockNextModule();",
      },
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
        ? `Примените идею из модуля "${moduleTitle}" к реальной задаче и опишите короткий план действий.`
        : `Apply the idea from "${moduleTitle}" to a realistic task and write a short action plan.`,
      challengeHint: locale === "ru"
        ? "Используйте 3-5 пунктов: контекст, действие, ожидаемый результат."
        : "Use 3-5 bullet points: context, action, expected result.",
    },
    {
      id: makeId("summary", 86),
      type: "summary",
      title: localized.summary,
      items: resourceItems,
      content: locale === "ru"
        ? "У вас есть структурированный путь: понять концепт, пройти уроки, выполнить практику и закрепить материал проверкой."
        : "You now have a structured path: understand the concept, work through the lessons, practice, and validate the result.",
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
