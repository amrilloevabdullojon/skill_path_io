import {
  LessonType,
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
    title: "QA Engineer",
    description: "Track focused on manual and automated testing.",
    icon: "bug",
    color: "#0EA5E9",
    category: TrackCategory.QA,
    moduleTitles: [
      "QA Fundamentals",
      "Test Design",
      "API Testing",
      "UI Automation",
      "Quality Processes",
    ],
  },
  {
    slug: "business-analyst",
    title: "Business Analyst",
    description: "Track for requirements analysis and stakeholder communication.",
    icon: "briefcase",
    color: "#F97316",
    category: TrackCategory.BA,
    moduleTitles: [
      "BA Role in Product",
      "Requirements Elicitation",
      "Process Modeling",
      "Documentation and Specs",
      "Team and Client Collaboration",
    ],
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    description: "Track for data analytics, SQL, and visualization.",
    icon: "bar-chart-3",
    color: "#10B981",
    category: TrackCategory.DA,
    moduleTitles: [
      "Analytics Basics",
      "SQL for Analysts",
      "Data Preparation",
      "BI and Visualization",
      "Product Metrics",
    ],
  },
] as const;

const jobRoleTemplates = [
  {
    slug: "junior-qa-engineer",
    title: "Junior QA Engineer",
    track: TrackCategory.QA,
    level: "Junior",
    requiredSkills: ["Manual Testing", "API Testing", "Bug Tracking", "Communication"],
    description: "Entry-level QA role focused on quality validation and clear issue reporting.",
  },
  {
    slug: "junior-business-analyst",
    title: "Junior Business Analyst",
    track: TrackCategory.BA,
    level: "Junior",
    requiredSkills: ["User Stories", "Acceptance Criteria", "Communication", "Process Mapping"],
    description: "Entry-level BA role focused on requirements and stakeholder collaboration.",
  },
  {
    slug: "junior-data-analyst",
    title: "Junior Data Analyst",
    track: TrackCategory.DA,
    level: "Junior",
    requiredSkills: ["SQL", "Dashboards", "Analytics", "Communication"],
    description: "Entry-level analytics role focused on metrics and reporting.",
  },
] as const;

const jobPostingTemplates = [
  {
    roleSlug: "junior-qa-engineer",
    title: "Junior QA Engineer",
    level: "Junior",
    company: "SkillPath Partners",
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
    title: "API Regression Mission",
    scenario: "An endpoint started returning intermittent 500 errors after deployment.",
    roleContext: "QA Engineer",
    objective: "Identify reproducible cases and build a concise bug report.",
    steps: [
      "Reproduce the failure with at least 3 payload variants.",
      "Capture request/response evidence.",
      "Document expected vs actual behavior.",
    ],
    expectedResult: "Structured bug report with severity and reproducible steps.",
    difficulty: "MEDIUM",
    xpReward: 180,
    category: TrackCategory.QA,
  },
  {
    slug: "ba-user-story-refinement",
    title: "User Story Refinement Mission",
    scenario: "A feature request lacks acceptance criteria and introduces ambiguity.",
    roleContext: "Business Analyst",
    objective: "Rewrite the story with clear scope, constraints, and acceptance criteria.",
    steps: [
      "Split business and technical assumptions.",
      "Define measurable acceptance criteria.",
      "Add at least one negative scenario.",
    ],
    expectedResult: "Production-ready user story package for sprint planning.",
    difficulty: "MEDIUM",
    xpReward: 170,
    category: TrackCategory.BA,
  },
  {
    slug: "da-retention-analysis",
    title: "Retention Insight Mission",
    scenario: "Product team needs weekly retention insights for a new onboarding flow.",
    roleContext: "Data Analyst",
    objective: "Create SQL-driven retention summary and actionable recommendation.",
    steps: [
      "Write the query for cohort retention.",
      "Summarize trend and outliers.",
      "Recommend one experiment based on data.",
    ],
    expectedResult: "Retention analysis summary with SQL evidence.",
    difficulty: "MEDIUM",
    xpReward: 190,
    category: TrackCategory.DA,
  },
] as const;

const weeklyQuestTemplates = [
  {
    title: "Complete 3 lessons",
    description: "Finish at least 3 lesson units this week.",
    goal: 3,
    rewardXp: 90,
  },
  {
    title: "Pass 1 quiz 80%+",
    description: "Achieve 80% or higher on one module quiz.",
    goal: 1,
    rewardXp: 120,
  },
  {
    title: "Submit 1 mission",
    description: "Complete one practical mission this week.",
    goal: 1,
    rewardXp: 150,
  },
  {
    title: "Maintain 5-day streak",
    description: "Keep daily learning activity for five days.",
    goal: 5,
    rewardXp: 140,
  },
] as const;

const lessonTypes: LessonType[] = [LessonType.TEXT, LessonType.VIDEO, LessonType.TASK];

function buildQuestion(moduleTitle: string, questionOrder: number) {
  const isMulti = questionOrder % 2 === 0;
  const questionType = isMulti ? QuestionType.MULTI : QuestionType.SINGLE;

  return {
    text: `${moduleTitle}: question ${questionOrder}`,
    type: questionType,
    options: [
      { id: "A", text: "Option A" },
      { id: "B", text: "Option B" },
      { id: "C", text: "Option C" },
      { id: "D", text: "Option D" },
    ],
    correctAnswer: isMulti ? ["A", "C"] : ["A"],
  };
}

async function main() {
  await prisma.discussionComment.deleteMany();
  await prisma.discussionThread.deleteMany();
  await prisma.userBookmark.deleteMany();
  await prisma.userNote.deleteMany();
  await prisma.missionSubmission.deleteMany();
  await prisma.learningMission.deleteMany();
  await prisma.weeklyQuest.deleteMany();
  await prisma.learningPlan.deleteMany();
  await prisma.knowledgeNode.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.jobRole.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.certificate.deleteMany();
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
      name: "SkillPath Admin",
      email: "admin@skillpath.local",
      role: UserRole.ADMIN,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Demo Student",
      email: "student@skillpath.local",
      role: UserRole.STUDENT,
    },
  });

  const createdTracks: Array<{
    id: string;
    slug: string;
    title: string;
    category: TrackCategory;
    modules: Array<{ id: string; title: string; order: number }>;
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
              description: `${moduleTitle}: practical module ${moduleOrder}`,
              duration: 60 + moduleOrder * 15,
              content: {
                overview: `Module content for "${moduleTitle}"`,
                outcomes: [
                  "Understand key concepts",
                  "Apply knowledge on a practical case",
                  "Prepare for the next module",
                ],
                resources: ["Notes", "Checklist", "Practice task"],
              },
              lessons: {
                create: Array.from({ length: 3 }, (_, lessonIndex) => {
                  const lessonOrder = lessonIndex + 1;
                  return {
                    order: lessonOrder,
                    title: `${moduleTitle}: lesson ${lessonOrder}`,
                    body: `Lesson ${lessonOrder} content for "${moduleTitle}".`,
                    type: lessonTypes[lessonIndex],
                  };
                }),
              },
              quiz: {
                create: {
                  title: `${moduleTitle}: final quiz`,
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
          select: { id: true, title: true, order: true },
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
        requiredSkills: role.requiredSkills,
        description: role.description,
      },
      update: {
        title: role.title,
        track: role.track,
        level: role.level,
        requiredSkills: role.requiredSkills,
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
      requiredSkills: posting.requiredSkills,
      responsibilities: posting.responsibilities,
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
    prisma.learningMission.count(),
    prisma.jobPosting.count(),
    prisma.weeklyQuest.count(),
    prisma.knowledgeNode.count(),
    prisma.discussionThread.count(),
  ]);

  console.log("Seed completed");
  console.log(`Users: 2 (admin: ${admin.email}, student: ${student.email})`);
  console.log(`Tracks: ${trackCount}`);
  console.log(`Modules: ${moduleCount}`);
  console.log(`Lessons: ${lessonCount}`);
  console.log(`Quizzes: ${quizCount}`);
  console.log(`Questions: ${questionCount}`);
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
