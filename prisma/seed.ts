import {
  LessonType,
  Prisma,
  PrismaClient,
  ProgressStatus,
  QuestionType,
  StudioContentStatus,
  TrackCategory,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

const trackTemplates = [
  {
    slug: "qa-engineer",
    title: "QA Инженер",
    description: "Трек по ручному и автоматизированному тестированию продуктов.",
    icon: "bug",
    color: "#0EA5E9",
    category: TrackCategory.QA,
    moduleTitles: [
      "Основы тестирования",
      "Тест-дизайн",
      "Тестирование API",
      "UI Автоматизация",
      "Процессы обеспечения качества",
    ],
  },
  {
    slug: "business-analyst",
    title: "Бизнес Аналитик",
    description: "Трек по бизнес-анализу: сбор требований, работа со стейкхолдерами, постановка задач и документирование.",
    icon: "briefcase",
    color: "#F97316",
    category: TrackCategory.BA,
    moduleTitles: [
      "Роль BA в продукте",
      "Сбор требований",
      "Моделирование процессов",
      "Документация и спецификации",
      "Взаимодействие с командой и клиентом",
    ],
  },
  {
    slug: "data-analyst",
    title: "Data Аналитик",
    description: "Трек по аналитике данных: SQL, визуализация, продуктовые метрики и работа с BI-инструментами.",
    icon: "bar-chart-3",
    color: "#10B981",
    category: TrackCategory.DA,
    moduleTitles: [
      "Основы аналитики",
      "SQL для аналитиков",
      "Подготовка данных",
      "BI и Визуализация",
      "Продуктовые метрики",
    ],
  },
] as const;

const jobRoleTemplates = [
  {
    slug: "junior-qa-engineer",
    title: "Junior QA Инженер",
    track: TrackCategory.QA,
    level: "Джуниор",
    requiredSkills: ["Ручное тестирование", "Тестирование API", "Баг-трекинг", "Коммуникация"],
    description: "Стартовая позиция тестировщика. Фокус на поиске уязвимостей и понятных баг-репортах.",
  },
  {
    slug: "junior-business-analyst",
    title: "Junior Бизнес Аналитик",
    track: TrackCategory.BA,
    level: "Джуниор",
    requiredSkills: ["Описания (User Stories)", "Критерии приемки", "Коммуникация", "Диаграммы процессов"],
    description: "Начальная аналитическая роль. Фокус на требованиях и коллаборации со стейкхолдерами.",
  },
  {
    slug: "junior-data-analyst",
    title: "Junior Data Аналитик",
    track: TrackCategory.DA,
    level: "Джуниор",
    requiredSkills: ["SQL", "Дашборды", "Аналитика", "Метрики"],
    description: "Базовая роль аналитика данных. Построение отчетов и метрик.",
  },
] as const;

const jobPostingTemplates = [
  {
    roleSlug: "junior-qa-engineer",
    title: "Junior QA Engineer",
    level: "Junior",
    company: "Levio Partners",
    location: "Remote",
    requiredSkills: ["Manual Testing", "API Testing", "Bug Tracking"],
    responsibilities: ["Validate releases", "Document defects", "Support regression cycles"],
  },
  {
    roleSlug: "junior-business-analyst",
    title: "Junior Business Analyst",
    level: "Junior",
    company: "Northwind Product Lab",
    location: "Hybrid",
    requiredSkills: ["User Stories", "Acceptance Criteria", "Communication"],
    responsibilities: ["Capture requirements", "Align stakeholders", "Maintain documentation"],
  },
  {
    roleSlug: "junior-data-analyst",
    title: "Junior Data Analyst",
    level: "Junior",
    company: "DataSpring",
    location: "Remote",
    requiredSkills: ["SQL", "Dashboards", "Analytics"],
    responsibilities: ["Build reports", "Analyze product metrics", "Present findings"],
  },
] as const;

const missionTemplates = [
  {
    slug: "qa-api-regression",
    title: "Миссия: Регрессия API",
    scenario: "Один из эндпоинтов начал выдавать случайные 500-е ошибки после развертывания релиза.",
    roleContext: "QA Инженер",
    objective: "Найдите способ гарантированно воспроизвести ошибку и сделайте краткий отчет.",
    steps: [
      "Воспроизведите баг с как минимум 3-мя разными пейлоадами.",
      "Сохраните доказательства из логов запросов/ответов.",
      "Опишите ожидаемое и фактическое поведение.",
    ],
    expectedResult: "Структурированный баг-репорт с шагами воспроизведения и уровнем критичности.",
    difficulty: "MEDIUM",
    xpReward: 180,
    category: TrackCategory.QA,
  },
  {
    slug: "ba-user-story-refinement",
    title: "Миссия: Проработка User Story",
    scenario: "Требование от клиента написано размыто, отсутствуют критерии приемки.",
    roleContext: "Бизнес-Аналитик",
    objective: "Переформулируйте story, установив четкие границы (scope) и критерии проверки.",
    steps: [
      "Отделите бизнес-предположения от технических деталей.",
      "Опишите измеримые критерии приемки.",
      "Добавьте минимум один 'негативный' сценарий.",
    ],
    expectedResult: "Готовый к взятию в спринт пакет документации.",
    difficulty: "MEDIUM",
    xpReward: 170,
    category: TrackCategory.BA,
  },
  {
    slug: "da-retention-analysis",
    title: "Миссия: Анализ Удержания",
    scenario: "Продуктовая команда просит отчет о retention за неделю по новому онбордингу.",
    roleContext: "Data Аналитик",
    objective: "Напишите SQL-модель и сделайте вывод по отвалу юзеров.",
    steps: [
      "Написать SQL-запрос для когортного retention.",
      "Выявить тренд и аномалии в данных.",
      "Предложить один продуктовый эксперимент на базе цифр.",
    ],
    expectedResult: "Краткий вывод по когортам с приложенным SQL-запросом.",
    difficulty: "MEDIUM",
    xpReward: 190,
    category: TrackCategory.DA,
  },
] as const;

const weeklyQuestTemplates = [
  {
    title: "Пройти 3 урока",
    description: "Завершите как минимум 3 теоретических урока за эту неделю.",
    goal: 3,
    rewardXp: 90,
  },
  {
    title: "Сдать квиз на 80%+",
    description: "Правильно ответить на большинство вопросов в итоговом тесте.",
    goal: 1,
    rewardXp: 120,
  },
  {
    title: "Сдать 1 миссию",
    description: "Успешно решите практическую сценарную миссию с ИИ.",
    goal: 1,
    rewardXp: 150,
  },
  {
    title: "Удержать Огонь 5 дней",
    description: "Сохраните ежедневную серию обучения 5 дней подряд.",
    goal: 5,
    rewardXp: 140,
  },
] as const;

const lessonTypes: LessonType[] = [LessonType.TEXT, LessonType.VIDEO, LessonType.TASK];

type SeededQuestion = {
  id: string;
  text: string;
  type: QuestionType;
  options: Prisma.JsonValue;
  correctAnswer: Prisma.JsonValue;
};

type SeededModule = {
  id: string;
  title: string;
  order: number;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    questions: SeededQuestion[];
  } | null;
};

function buildQuestion(moduleTitle: string, questionOrder: number) {
  const isMulti = questionOrder % 2 === 0;
  const questionType = isMulti ? QuestionType.MULTI : QuestionType.SINGLE;

  return {
    text: `${moduleTitle}: вопрос ${questionOrder}`,
    type: questionType,
    options: [
      { id: "A", text: "Проверить основной сценарий" },
      { id: "B", text: "Пропустить негативные кейсы" },
      { id: "C", text: "Сверить ожидаемый результат" },
      { id: "D", text: "Закрыть задачу без доказательств" },
    ],
    correctAnswer: isMulti ? ["A", "C"] : ["A"],
  };
}

function selectedAnswersForQuestion(question: SeededQuestion, shouldBeCorrect: boolean) {
  if (shouldBeCorrect) {
    return question.correctAnswer;
  }

  return question.type === QuestionType.MULTI ? ["B", "D"] : ["B"];
}

function toInputJson(value: Prisma.JsonValue): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return value === null ? Prisma.JsonNull : value;
}

async function createSeededQuizAttempt(params: {
  userId: string;
  source: string;
  trackSlug: string;
  trackTitle: string;
  module: SeededModule;
  score: number;
  correctAnswers: number;
  submittedDaysAgo: number;
  durationSeconds: number;
}) {
  if (!params.module.quiz) {
    return;
  }

  const questions = params.module.quiz.questions;
  const correctQuestionIds = new Set(questions.slice(0, params.correctAnswers).map((question) => question.id));
  const submittedAt = new Date(Date.now() - params.submittedDaysAgo * 24 * 60 * 60 * 1000);

  await prisma.quizAttempt.create({
    data: {
      userId: params.userId,
      source: params.source,
      trackSlug: params.trackSlug,
      trackTitle: params.trackTitle,
      moduleId: params.module.id,
      moduleTitle: params.module.title,
      quizId: params.module.quiz.id,
      quizTitle: params.module.quiz.title,
      score: params.score,
      passingScore: params.module.quiz.passingScore,
      passed: params.score >= params.module.quiz.passingScore,
      totalQuestions: questions.length,
      correctAnswers: params.correctAnswers,
      startedAt: new Date(submittedAt.getTime() - params.durationSeconds * 1000),
      submittedAt,
      durationSeconds: params.durationSeconds,
      questionResults: {
        create: questions.map((question) => {
          const isCorrect = correctQuestionIds.has(question.id);

          return {
            questionId: question.id,
            questionText: question.text,
            questionType: question.type,
            options: toInputJson(question.options),
            selectedAnswerIds: toInputJson(selectedAnswersForQuestion(question, isCorrect)),
            correctAnswerIds: toInputJson(question.correctAnswer),
            isCorrect,
            createdAt: submittedAt,
          };
        }),
      },
    },
  });
}

async function main() {
  const allowDestructiveSeed = process.env.SEED_ALLOW_DESTRUCTIVE === "true";
  if (process.env.NODE_ENV === "production" && !allowDestructiveSeed) {
    throw new Error(
      "Refusing to run destructive seed in production. Set SEED_ALLOW_DESTRUCTIVE=true only for an intentional reset.",
    );
  }

  await prisma.discussionComment.deleteMany();
  await prisma.discussionThread.deleteMany();
  await prisma.userBookmark.deleteMany();
  await prisma.userNote.deleteMany();
  await prisma.quizQuestionResult.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.missionSubmission.deleteMany();
  await prisma.learningMission.deleteMany();
  await prisma.weeklyQuest.deleteMany();
  await prisma.learningPlan.deleteMany();
  await prisma.knowledgeNode.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.jobRole.deleteMany();
  await prisma.lessonBlock.deleteMany();
  await prisma.courseQuestion.deleteMany();
  await prisma.courseQuiz.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.caseStudy.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.courseModuleProgress.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.courseCertificate.deleteMany();
  await prisma.certificateConfig.deleteMany();
  await prisma.courseAnalyticsSnapshot.deleteMany();
  await prisma.courseTemplate.deleteMany();
  await prisma.courseVersion.deleteMany();
  await prisma.courseLesson.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.track.deleteMany();
  await prisma.onboardingProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.careerGoal.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Levio Admin",
      email: "admin@levio.local",
      role: UserRole.ADMIN,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Demo Student",
      email: "student@levio.local",
      role: UserRole.STUDENT,
    },
  });
  const supportStudents = await prisma.user.createManyAndReturn({
    data: [
      {
        name: "Nodira QA",
        email: "nodira.qa@levio.local",
        role: UserRole.STUDENT,
      },
      {
        name: "Aziz Analyst",
        email: "aziz.analyst@levio.local",
        role: UserRole.STUDENT,
      },
      {
        name: "Madina Data",
        email: "madina.data@levio.local",
        role: UserRole.STUDENT,
      },
    ],
    select: {
      id: true,
      name: true,
    },
  });

  const createdTracks: Array<{
    id: string;
    slug: string;
    title: string;
    category: TrackCategory;
    modules: SeededModule[];
  }> = [];

  for (const track of trackTemplates) {
    const createdTrack = await prisma.track.create({
      data: {
        slug: track.slug,
        title: track.title,
        description: track.description,
        icon: track.icon,
        color: track.color,
        category: track.category,
        modules: {
          create: track.moduleTitles.map((moduleTitle, moduleIndex) => {
            const moduleOrder = moduleIndex + 1;

            return {
              order: moduleOrder,
              title: moduleTitle,
              description: `${moduleTitle}: практический модуль ${moduleOrder}`,
              duration: 60 + moduleOrder * 15,
              content: {
                overview: `Короткий практический обзор модуля "${moduleTitle}".`,
                outcomes: [
                  "Понять ключевые принципы темы",
                  "Применить навык на практическом кейсе",
                  "Подготовиться к следующему модулю",
                ],
                resources: ["Конспект", "Чеклист", "Практическое задание"],
              },
              lessons: {
                create: Array.from({ length: 3 }, (_, lessonIndex) => {
                  const lessonOrder = lessonIndex + 1;
                  return {
                    order: lessonOrder,
                    title: `${moduleTitle}: урок ${lessonOrder}`,
                    body: `Урок ${lessonOrder} помогает закрепить тему "${moduleTitle}" через понятные шаги, примеры и мини-практику.`,
                    type: lessonTypes[lessonIndex],
                  };
                }),
              },
              quiz: {
                create: {
                  title: `Итоговый тест: ${moduleTitle}`,
                  passingScore: 70,
                  questions: {
                    create: Array.from({ length: 5 }, (_, questionIndex) =>
                      buildQuestion(moduleTitle, questionIndex + 1),
                    ),
                  },
                },
              },
            };
          }),
        },
      },
      include: {
        modules: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            quiz: {
              select: {
                id: true,
                title: true,
                passingScore: true,
                questions: {
                  select: {
                    id: true,
                    text: true,
                    type: true,
                    options: true,
                    correctAnswer: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    createdTracks.push({
      id: createdTrack.id,
      slug: createdTrack.slug,
      title: createdTrack.title,
      category: createdTrack.category,
      modules: createdTrack.modules,
    });
  }

  const qaTrack = createdTracks.find((track) => track.slug === "qa-engineer");
  const baTrack = createdTracks.find((track) => track.slug === "business-analyst");
  const daTrack = createdTracks.find((track) => track.slug === "data-analyst");

  if (qaTrack && baTrack && daTrack) {
    const demoAttempts = [
      {
        userId: student.id,
        track: qaTrack,
        module: qaTrack.modules[0],
        score: 86,
        correctAnswers: 4,
        submittedDaysAgo: 6,
        durationSeconds: 620,
      },
      {
        userId: student.id,
        track: qaTrack,
        module: qaTrack.modules[1],
        score: 62,
        correctAnswers: 3,
        submittedDaysAgo: 2,
        durationSeconds: 740,
      },
      {
        userId: supportStudents[0]?.id,
        track: qaTrack,
        module: qaTrack.modules[1],
        score: 48,
        correctAnswers: 2,
        submittedDaysAgo: 1,
        durationSeconds: 810,
      },
      {
        userId: supportStudents[1]?.id,
        track: baTrack,
        module: baTrack.modules[1],
        score: 56,
        correctAnswers: 3,
        submittedDaysAgo: 3,
        durationSeconds: 690,
      },
      {
        userId: supportStudents[2]?.id,
        track: daTrack,
        module: daTrack.modules[1],
        score: 44,
        correctAnswers: 2,
        submittedDaysAgo: 4,
        durationSeconds: 880,
      },
      {
        userId: supportStudents[2]?.id,
        track: daTrack,
        module: daTrack.modules[0],
        score: 78,
        correctAnswers: 4,
        submittedDaysAgo: 7,
        durationSeconds: 560,
      },
    ];

    for (const attempt of demoAttempts) {
      if (!attempt.userId || !attempt.module) {
        continue;
      }

      await createSeededQuizAttempt({
        userId: attempt.userId,
        source: "seed-demo",
        trackSlug: attempt.track.slug,
        trackTitle: attempt.track.title,
        module: attempt.module,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        submittedDaysAgo: attempt.submittedDaysAgo,
        durationSeconds: attempt.durationSeconds,
      });
    }
  }

  await prisma.userProgress.createMany({
    data: createdTracks.flatMap((track) =>
      track.modules.map((module, moduleIndex) => ({
        userId: student.id,
        moduleId: module.id,
        status:
          moduleIndex === 0
            ? ProgressStatus.COMPLETED
            : moduleIndex === 1
              ? ProgressStatus.IN_PROGRESS
              : ProgressStatus.NOT_STARTED,
        score: moduleIndex <= 1 ? 75 + moduleIndex * 10 : null,
        completedAt: moduleIndex === 0 ? new Date() : null,
      })),
    ),
  });

  const seededCertificate = await prisma.certificate.create({
    data: {
      userId: student.id,
      trackId: createdTracks[0].id,
      certificateUrl: "pending",
    },
    select: {
      id: true,
    },
  });

  await prisma.certificate.update({
    where: { id: seededCertificate.id },
    data: {
      certificateUrl: `/api/certificates/${seededCertificate.id}/pdf`,
    },
  });

  await prisma.onboardingProfile.create({
    data: {
      userId: student.id,
      selectedProfession: TrackCategory.QA,
      currentLevel: "FOUNDATION",
      goal: "Junior QA",
      hoursPerWeek: 6,
      targetMonths: 4,
      interestedSkills: ["API Testing", "Bug Reporting", "Regression"],
      roadmap: ["qa-engineer"],
    },
  });

  await prisma.learningPlan.create({
    data: {
      userId: student.id,
      goal: "Junior QA",
      weeklyHours: 6,
      workload: "BALANCED",
      forecastDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 70),
      tasks: [
        { id: "task-lesson", title: "Complete one lesson", type: "lesson", day: "Monday" },
        { id: "task-quiz", title: "Take one quiz", type: "quiz", day: "Wednesday" },
        { id: "task-mission", title: "Submit one mission", type: "mission", day: "Friday" },
      ],
      status: "ACTIVE",
    },
  });

  await prisma.userNote.createMany({
    data: [
      {
        userId: student.id,
        title: "API response validation",
        content: "Check status code, schema, and error payload on negative cases.",
        moduleRef: "qa-engineer",
        lessonRef: "API Testing",
        tags: ["api", "qa"],
      },
      {
        userId: student.id,
        title: "Regression checklist",
        content: "Prioritize login, payment, and reporting flows before release signoff.",
        moduleRef: "qa-engineer",
        lessonRef: "Quality Processes",
        tags: ["regression", "release"],
      },
    ],
  });

  await prisma.userBookmark.createMany({
    data: [
      {
        userId: student.id,
        title: "QA Fundamentals module",
        href: "/tracks/qa-engineer/modules",
        type: "module",
        tag: "QA",
      },
      {
        userId: student.id,
        title: "Missions board",
        href: "/missions",
        type: "mission",
        tag: "Practice",
      },
    ],
  });

  const roleBySlug = new Map<string, { id: string; track: TrackCategory | null }>();
  for (const role of jobRoleTemplates) {
    const createdRole = await prisma.jobRole.upsert({
      where: {
        slug: role.slug,
      },
      create: {
        slug: role.slug,
        title: role.title,
        track: role.track,
        level: role.level,
        requiredSkills: [...role.requiredSkills],
        description: role.description,
      },
      update: {
        title: role.title,
        track: role.track,
        level: role.level,
        requiredSkills: [...role.requiredSkills],
        description: role.description,
      },
      select: {
        id: true,
        track: true,
      },
    });
    roleBySlug.set(role.slug, createdRole);
  }

  await prisma.jobPosting.createMany({
    data: jobPostingTemplates.map((posting) => ({
      roleId: roleBySlug.get(posting.roleSlug)?.id ?? null,
      title: posting.title,
      level: posting.level,
      company: posting.company,
      location: posting.location,
      requiredSkills: [...posting.requiredSkills],
      responsibilities: [...posting.responsibilities],
      status: StudioContentStatus.PUBLISHED,
      source: "seed",
    })),
  });

  const createdMissions: Array<{ id: string }> = [];
  for (const mission of missionTemplates) {
    const createdMission = await prisma.learningMission.upsert({
      where: { slug: mission.slug },
      create: {
        slug: mission.slug,
        title: mission.title,
        scenario: mission.scenario,
        roleContext: mission.roleContext,
        objective: mission.objective,
        steps: mission.steps,
        expectedResult: mission.expectedResult,
        difficulty: mission.difficulty,
        xpReward: mission.xpReward,
        aiEvaluationEnabled: true,
        category: mission.category,
        status: StudioContentStatus.PUBLISHED,
      },
      update: {
        title: mission.title,
        scenario: mission.scenario,
        roleContext: mission.roleContext,
        objective: mission.objective,
        steps: mission.steps,
        expectedResult: mission.expectedResult,
        difficulty: mission.difficulty,
        xpReward: mission.xpReward,
        aiEvaluationEnabled: true,
        category: mission.category,
        status: StudioContentStatus.PUBLISHED,
      },
      select: {
        id: true,
      },
    });

    createdMissions.push(createdMission);
  }

  if (createdMissions[0]) {
    await prisma.missionSubmission.create({
      data: {
        missionId: createdMissions[0].id,
        userId: student.id,
        answer: "Reproduced in staging, identified payload mismatch on edge case.",
        score: 82,
        feedback: ["Clear evidence attached", "Include severity and impact section"],
        status: "REVIEWED",
        reviewedAt: new Date(),
      },
    });
  }

  await prisma.weeklyQuest.createMany({
    data: weeklyQuestTemplates.map((quest) => ({
      title: quest.title,
      description: quest.description,
      goal: quest.goal,
      rewardXp: quest.rewardXp,
      isActive: true,
      cadence: "WEEKLY",
      conditions: [],
    })),
  });

  const knowledgeNodes = createdTracks.flatMap((track) =>
    track.modules.map((module, index) => ({
      slug: `${track.slug}-node-${index + 1}`,
      title: module.title,
      category: track.title,
      dependencies: index > 0 ? [`${track.slug}-node-${index}`] : [],
      difficulty: index === 0 ? "FOUNDATION" : index < 3 ? "INTERMEDIATE" : "ADVANCED",
      track: track.category,
    })),
  );

  await prisma.knowledgeNode.createMany({
    data: knowledgeNodes,
  });

  const threadOne = await prisma.discussionThread.create({
    data: {
      userId: student.id,
      title: "Best approach for API regression checks?",
      moduleRef: "API Testing",
      track: TrackCategory.QA,
      body: "How do you prioritize endpoint coverage when time is limited?",
      tags: ["api", "regression", "qa"],
    },
  });

  const threadTwo = await prisma.discussionThread.create({
    data: {
      userId: admin.id,
      title: "How to improve acceptance criteria quality",
      moduleRef: "Requirements Elicitation",
      track: TrackCategory.BA,
      body: "Share examples of measurable acceptance criteria patterns.",
      tags: ["ba", "acceptance-criteria"],
    },
  });

  await prisma.discussionComment.createMany({
    data: [
      {
        threadId: threadOne.id,
        userId: admin.id,
        content: "Start from critical user paths and add one failure scenario per endpoint.",
      },
      {
        threadId: threadTwo.id,
        userId: student.id,
        content: "We use Given/When/Then with explicit expected system responses.",
      },
    ],
  });

  const [
    trackCount,
    moduleCount,
    lessonCount,
    quizCount,
    questionCount,
    userCount,
    quizAttemptCount,
    quizQuestionResultCount,
    missionCount,
    jobPostingCount,
    weeklyQuestCount,
    knowledgeNodeCount,
    threadCount,
  ] = await prisma.$transaction([
    prisma.track.count(),
    prisma.module.count(),
    prisma.lesson.count(),
    prisma.quiz.count(),
    prisma.question.count(),
    prisma.user.count(),
    prisma.quizAttempt.count(),
    prisma.quizQuestionResult.count(),
    prisma.learningMission.count(),
    prisma.jobPosting.count(),
    prisma.weeklyQuest.count(),
    prisma.knowledgeNode.count(),
    prisma.discussionThread.count(),
  ]);

  console.log("Seed completed");
  console.log(`Users: ${userCount} (admin: ${admin.email}, student: ${student.email})`);
  console.log(`Tracks: ${trackCount}`);
  console.log(`Modules: ${moduleCount}`);
  console.log(`Lessons: ${lessonCount}`);
  console.log(`Quizzes: ${quizCount}`);
  console.log(`Questions: ${questionCount}`);
  console.log(`Quiz attempts: ${quizAttemptCount}`);
  console.log(`Question results: ${quizQuestionResultCount}`);
  console.log(`Missions: ${missionCount}`);
  console.log(`Job postings: ${jobPostingCount}`);
  console.log(`Weekly quests: ${weeklyQuestCount}`);
  console.log(`Knowledge nodes: ${knowledgeNodeCount}`);
  console.log(`Discussion threads: ${threadCount}`);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
