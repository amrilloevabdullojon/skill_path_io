import { RuntimeCourse, RuntimeModule, RuntimeQuestion } from "@/lib/learning/content-types";

export type LearningLocale = "en" | "ru";

type Localized<T> = {
  en: T;
  ru: T;
};

type OverrideLesson = {
  title: Localized<string>;
  body: Localized<string>;
};

type OverrideQuestion = {
  text: Localized<string>;
  type: "SINGLE" | "MULTI";
  options: Array<Localized<string>>;
  correctAnswerIndexes: number[];
};

type OverrideModule = {
  title: Localized<string>;
  description: Localized<string>;
  content: {
    overview: Localized<string>;
    outcomes: Localized<string[]>;
    resources: Localized<string[]>;
    objectives: Localized<string[]>;
    skills: Localized<string[]>;
    whatYouWillLearn: Localized<string[]>;
    finalChallenge: Localized<string>;
    realWorldExample: Localized<string>;
    quickChecks: Localized<string[]>;
  };
  lessons: OverrideLesson[];
  quizTitle: Localized<string>;
  questions: OverrideQuestion[];
};

const QA_TRACK_DESCRIPTION: Localized<string> = {
  en: "Beginner-friendly manual QA path with real testing workflow, browser checks, API validation, bug reporting, and release readiness.",
  ru: "Понятный трек по ручному тестированию для новичков: процесс QA, браузерные проверки, API, баг-репорты и подготовка к релизу.",
};

const QA_MANUAL_MODULES: OverrideModule[] = [
  {
    title: {
      en: "QA Fundamentals",
      ru: "Основы ручного тестирования",
    },
    description: {
      en: "Learn what a manual QA engineer does, how quality fits into delivery, and how defects move through a team workflow.",
      ru: "Разберитесь, чем занимается manual QA, как качество встроено в процесс разработки и как дефекты проходят через командный workflow.",
    },
    content: {
      overview: {
        en: "This module builds the foundation: what QA is responsible for, how software moves from idea to release, and why testers reduce business risk instead of simply hunting bugs.",
        ru: "Этот модуль дает базу: за что отвечает QA, как продукт проходит путь от идеи до релиза и почему тестировщик снижает риски бизнеса, а не просто ищет баги.",
      },
      outcomes: {
        en: [
          "Explain the role of a manual QA engineer in plain language",
          "Describe SDLC, STLC, Agile rituals, and where testing starts",
          "Understand defect lifecycle, severity, and priority",
        ],
        ru: [
          "Объяснять роль manual QA простыми словами",
          "Описывать SDLC, STLC, Agile-процесс и момент старта тестирования",
          "Понимать жизненный цикл дефекта, severity и priority",
        ],
      },
      resources: {
        en: [
          "Map product risks for a simple registration flow",
          "Write a short definition for quality, bug, defect, and failure",
          "Observe how one feature travels from backlog to release",
        ],
        ru: [
          "Составьте карту рисков для простого сценария регистрации",
          "Кратко определите quality, bug, defect и failure",
          "Проследите путь одной фичи от backlog до релиза",
        ],
      },
      objectives: {
        en: [
          "See testing as risk management, not button clicking",
          "Understand where QA collaborates with analysts, developers, and product managers",
          "Build the language needed for the rest of the course",
        ],
        ru: [
          "Увидеть тестирование как управление рисками, а не простое нажатие кнопок",
          "Понять, где QA взаимодействует с аналитиками, разработчиками и product manager",
          "Построить словарь понятий для следующих модулей курса",
        ],
      },
      skills: {
        en: ["Quality mindset", "Process awareness", "Defect lifecycle", "Team communication"],
        ru: ["Мышление QA", "Понимание процесса", "Жизненный цикл дефекта", "Командная коммуникация"],
      },
      whatYouWillLearn: {
        en: [
          "What QA does and does not own",
          "How Agile and release cycles affect testing",
          "Why severity and priority are different",
        ],
        ru: [
          "Что входит и не входит в зону ответственности QA",
          "Как Agile и релизный цикл влияют на тестирование",
          "Почему severity и priority отличаются",
        ],
      },
      finalChallenge: {
        en: "Review a simple sign-up feature and list 10 meaningful product, UI, and process risks before development starts.",
        ru: "Проанализируйте простую фичу регистрации и перечислите 10 значимых продуктовых, UI- и процессных рисков до начала разработки.",
      },
      realWorldExample: {
        en: "A strong QA engineer can prevent rework by spotting unclear requirements before developers write code.",
        ru: "Сильный QA может предотвратить лишнюю переработку, если заметит неясные требования до того, как разработчики начнут писать код.",
      },
      quickChecks: {
        en: [
          "Why is QA responsible for risk visibility, not for proving the product is bug-free?",
          "At what stage is testing cheapest: before coding, during coding, or after release?",
          "What is the difference between severity and priority?",
        ],
        ru: [
          "Почему QA отвечает за видимость рисков, а не за доказательство отсутствия багов?",
          "На каком этапе тестирование обходится дешевле: до кода, во время кода или после релиза?",
          "В чем разница между severity и priority?",
        ],
      },
    },
    lessons: [
      {
        title: {
          en: "What Manual QA Does",
          ru: "Чем занимается Manual QA",
        },
        body: {
          en: `## Scene: first day on the product team

You join a sprint planning call. The product manager says: "Registration is almost ready. We just need QA to check it quickly." The task sounds small, but nobody has written what "works" means.

Your job is not to click every button. Your job is to make risk visible before the team ships.

## What you inspect first

| Signal | What you ask | Why it matters |
| --- | --- | --- |
| User goal | Can a new user create an account without help? | This protects the main product path. |
| Acceptance criteria | What result counts as success? | Without this, testing becomes opinion. |
| Failure points | Where can the user get stuck or lose data? | These are release risks. |
| Evidence | What proof will convince the team? | Evidence turns a feeling into a decision. |

## Mini action

Write three lines before you test:

1. **Observation:** The user tries to create an account with email and password.
2. **Risk:** unclear validation can block signup or create duplicate accounts.
3. **Check:** valid signup, invalid email, duplicate email, weak password.

## Artifact seed

Use this lesson to fill the **Observation** and **Risk** branches of the artifact. A good QA note starts with a fact, then explains why the fact matters.`,
          ru: `## Сцена: первый день в продуктовой команде

Вы подключаетесь к sprint planning. Product manager говорит: "Регистрация почти готова. Нужно, чтобы QA быстро проверил". Задача звучит маленькой, но никто не написал, что именно считается "работает".

Ваша работа - не нажать все кнопки подряд. Ваша работа - сделать риск видимым до релиза.

## Что смотреть первым

| Сигнал | Что спросить | Зачем это важно |
| --- | --- | --- |
| Цель пользователя | Может ли новый пользователь создать аккаунт без помощи? | Это защищает главный продуктовый путь. |
| Acceptance criteria | Какой результат считается успехом? | Без этого тестирование превращается во мнение. |
| Точки отказа | Где пользователь может застрять или потерять данные? | Это релизные риски. |
| Evidence | Какое доказательство убедит команду? | Evidence превращает ощущение в решение. |

## Мини-действие

Перед тестированием запишите три строки:

1. **Наблюдение:** пользователь пытается создать аккаунт через email и password.
2. **Риск:** неясная валидация может заблокировать регистрацию или создать дубли.
3. **Проверка:** валидная регистрация, неверный email, повторный email, слабый пароль.

## Зерно артефакта

Используйте этот урок, чтобы заполнить ветки **Наблюдение** и **Риск**. Хорошая QA-заметка начинается с факта, а потом объясняет, почему факт важен.`,
        },
      },
      {
        title: {
          en: "How Software Delivery Works",
          ru: "Как устроен процесс разработки",
        },
        body: {
          en: `## Scene: the feature moves through the sprint

The signup task starts as a short product idea. Then design adds fields, development builds validation, and QA receives a staging link. If QA only appears at the end, every unclear decision becomes expensive.

Think of delivery as a chain:

| Stage | QA move | Output |
| --- | --- | --- |
| Idea | Ask what user problem is solved | product risk list |
| Requirements | Find vague words and missing rules | open questions |
| Development | Prepare checks before build is done | checklist or test cases |
| Testing | Compare expected and actual behavior | evidence |
| Release | Say what is safe, risky, or blocked | release recommendation |

## Micro scenario

The developer says: "Registration is done on staging." Do not answer "ok, I will test everything." Ask for the minimum inputs:

- staging URL and test account rules
- acceptance criteria
- known limitations
- browser/device priority
- rollback or hotfix contact if signup breaks

## Mini action

Turn the process into a test idea:

**Check:** create account with valid email and password.
**Expected:** account is created once, user sees confirmation, duplicate email is blocked.
**Evidence:** browser, test data, actual message, screenshot if behavior is wrong.`,
          ru: `## Сцена: фича проходит через спринт

Задача регистрации начинается как короткая продуктовая идея. Потом дизайн добавляет поля, разработчик делает валидацию, а QA получает staging-ссылку. Если QA появляется только в конце, каждое неясное решение становится дорогим.

Думайте о delivery как о цепочке:

| Этап | Ход QA | Выход |
| --- | --- | --- |
| Идея | Спросить, какую проблему пользователя решаем | список продуктовых рисков |
| Требования | Найти расплывчатые слова и пропущенные правила | открытые вопросы |
| Разработка | Подготовить проверки до завершения билда | checklist или test cases |
| Тестирование | Сравнить expected и actual behavior | evidence |
| Релиз | Сказать, что безопасно, рискованно или заблокировано | release recommendation |

## Микро-сценарий

Разработчик говорит: "Регистрация готова на staging". Не отвечайте "ок, всё протестирую". Сначала запросите минимальные входные данные:

- staging URL и правила тестовых аккаунтов
- acceptance criteria
- известные ограничения
- приоритетные browser/device
- контакт для rollback или hotfix, если signup сломается

## Мини-действие

Превратите процесс в test idea:

**Проверка:** создать аккаунт с валидным email и password.
**Expected:** аккаунт создаётся один раз, пользователь видит подтверждение, повторный email блокируется.
**Evidence:** browser, test data, actual message, screenshot при неверном поведении.`,
        },
      },
      {
        title: {
          en: "Practice: Risk Map for a Sign-up Flow",
          ru: "Практика: карта рисков для регистрации",
        },
        body: {
          en: `## Scene: you own the first QA artifact

The team wants to release signup tomorrow. You have 20 minutes to produce something useful. The goal is not a long document. The goal is a risk map that helps the team decide what to fix or clarify.

## Your working brief

Feature: user signs up with email and password.
Platforms: desktop Chrome and mobile Safari.
Known rule: password must be at least 8 characters.
Unknowns: duplicate email behavior, error text, confirmation screen.

## Build the risk map

| Risk | Impact | First check | Evidence |
| --- | --- | --- | --- |
| Weak password accepted | high | try 7 characters | expected/actual message |
| Duplicate email creates second account | high | register same email twice | account state and response |
| Error message is unclear | medium | enter invalid email | screenshot and text |
| Button stays active during submit | medium | double click Sign up | duplicate request or UI lock |
| Mobile layout hides helper text | medium | open on mobile width | screenshot |

## Final move

Choose three risks that must be discussed before release. For each one, write:

1. what you observed
2. why it matters
3. which check proves it
4. what the team should do next

This is your first portfolio-grade artifact: a small risk map with evidence and a clear decision.`,
          ru: `## Сцена: вы отвечаете за первый QA-артефакт

Команда хочет выпустить регистрацию завтра. У вас есть 20 минут, чтобы сделать что-то полезное. Цель - не длинный документ. Цель - risk map, который помогает команде решить, что исправить или уточнить.

## Рабочий бриф

Фича: пользователь регистрируется через email и password.
Платформы: desktop Chrome и mobile Safari.
Известное правило: password минимум 8 символов.
Неизвестно: поведение при повторном email, текст ошибки, экран подтверждения.

## Соберите risk map

| Риск | Impact | Первая проверка | Evidence |
| --- | --- | --- | --- |
| Слабый password принимается | high | ввести 7 символов | expected/actual message |
| Повторный email создаёт второй аккаунт | high | зарегистрировать один email дважды | состояние аккаунта и response |
| Ошибка непонятна пользователю | medium | ввести неверный email | screenshot и текст |
| Кнопка активна во время submit | medium | дважды нажать Sign up | duplicate request или UI lock |
| На mobile скрыт helper text | medium | открыть mobile width | screenshot |

## Финальный ход

Выберите три риска, которые нужно обсудить до релиза. Для каждого напишите:

1. что вы наблюдали
2. почему это важно
3. какая проверка это доказывает
4. что команда должна сделать дальше

Это первый артефакт портфолио: маленькая risk map с evidence и понятным решением.`,
        },
      },
    ],
    quizTitle: {
      en: "QA Fundamentals Quiz",
      ru: "Квиз: основы ручного тестирования",
    },
    questions: [
      {
        text: {
          en: "What is the main goal of a manual QA engineer?",
          ru: "Какова основная цель manual QA engineer?",
        },
        type: "SINGLE",
        options: [
          { en: "Guarantee there will be no bugs", ru: "Гарантировать полное отсутствие багов" },
          { en: "Reduce risk and make product quality visible", ru: "Снижать риски и делать качество продукта прозрачным" },
          { en: "Write backend services", ru: "Писать backend-сервисы" },
          { en: "Approve every design decision", ru: "Утверждать каждое дизайн-решение" },
        ],
        correctAnswerIndexes: [1],
      },
      {
        text: {
          en: "When should QA start working with a feature?",
          ru: "Когда QA должен начинать работать с фичей?",
        },
        type: "SINGLE",
        options: [
          { en: "Only after release", ru: "Только после релиза" },
          { en: "Only after coding is fully finished", ru: "Только после полного завершения разработки" },
          { en: "As early as requirements and design", ru: "Как можно раньше, начиная с требований и дизайна" },
          { en: "Only during final regression", ru: "Только на финальном regression" },
        ],
        correctAnswerIndexes: [2],
      },
      {
        text: {
          en: "Which statement about quality is correct?",
          ru: "Какое утверждение о качестве верно?",
        },
        type: "SINGLE",
        options: [
          { en: "Quality belongs only to QA", ru: "За качество отвечает только QA" },
          { en: "Quality is shared across the whole team", ru: "Качество - общая ответственность всей команды" },
          { en: "Quality matters only before release", ru: "Качество важно только перед релизом" },
          { en: "Quality is measured only by the number of tests", ru: "Качество измеряется только числом тестов" },
        ],
        correctAnswerIndexes: [1],
      },
      {
        text: {
          en: "What does severity describe?",
          ru: "Что описывает severity?",
        },
        type: "SINGLE",
        options: [
          { en: "How badly the problem affects the system", ru: "Насколько сильно проблема влияет на систему" },
          { en: "How loud the customer complains", ru: "Насколько громко жалуется клиент" },
          { en: "How expensive the sprint is", ru: "Насколько дорогой спринт" },
          { en: "How fast the tester wrote the report", ru: "Насколько быстро тестировщик написал баг-репорт" },
        ],
        correctAnswerIndexes: [0],
      },
      {
        text: {
          en: "Which activity best shows proactive QA work?",
          ru: "Какое действие лучше всего показывает проактивную работу QA?",
        },
        type: "SINGLE",
        options: [
          { en: "Waiting for the final build to appear", ru: "Ждать финальную сборку" },
          { en: "Reading requirements early and asking clarifying questions", ru: "Рано читать требования и задавать уточняющие вопросы" },
          { en: "Reporting only visual issues", ru: "Репортить только визуальные дефекты" },
          { en: "Skipping retesting after fixes", ru: "Пропускать повторную проверку после фиксов" },
        ],
        correctAnswerIndexes: [1],
      },
    ],
  },
  {
    title: {
      en: "Requirements and Test Design",
      ru: "Требования и тест-дизайн",
    },
    description: {
      en: "Turn vague product language into concrete checks using test design techniques, checklists, and test cases.",
      ru: "Научитесь превращать расплывчатые требования в конкретные проверки с помощью техник тест-дизайна, checklist и test case.",
    },
    content: {
      overview: {
        en: "A beginner tester grows fast when they stop testing randomly. This module teaches how to read requirements critically and design coverage that is practical, traceable, and easy to explain.",
        ru: "Начинающий тестировщик быстро растет, когда перестает тестировать хаотично. Этот модуль учит критически читать требования и строить покрытие, которое практично, прозрачно и легко объяснимо.",
      },
      outcomes: {
        en: [
          "Ask better questions when requirements are incomplete",
          "Use positive, negative, boundary, and equivalence-based checks",
          "Write basic checklists and reproducible test cases",
        ],
        ru: [
          "Задавать правильные вопросы, когда требования неполные",
          "Использовать positive, negative, boundary и equivalence-based проверки",
          "Писать базовые checklist и воспроизводимые test case",
        ],
      },
      resources: {
        en: [
          "Prepare checks for a login and password reset flow",
          "Split valid and invalid input classes for one form field",
          "Rewrite a vague requirement into testable language",
        ],
        ru: [
          "Подготовьте проверки для login и password reset flow",
          "Разделите корректные и некорректные классы данных для одного поля формы",
          "Перепишите расплывчатое требование в тестируемый вид",
        ],
      },
      objectives: {
        en: [
          "Learn to think in scenarios instead of isolated clicks",
          "Understand why boundaries and invalid states matter",
          "Create lightweight but structured QA documentation",
        ],
        ru: [
          "Научиться мыслить сценариями, а не отдельными кликами",
          "Понять, почему границы и невалидные состояния особенно важны",
          "Создавать легкую, но структурированную QA-документацию",
        ],
      },
      skills: {
        en: ["Requirement analysis", "Test design", "Checklist writing", "Test case writing"],
        ru: ["Анализ требований", "Тест-дизайн", "Составление checklist", "Написание test case"],
      },
      whatYouWillLearn: {
        en: [
          "How to validate a requirement before execution",
          "Why negative testing often reveals real risk",
          "When to use a checklist and when to write a full test case",
        ],
        ru: [
          "Как валидировать требование до начала проверок",
          "Почему negative testing часто выявляет реальные риски",
          "Когда достаточно checklist, а когда нужен полноценный test case",
        ],
      },
      finalChallenge: {
        en: "Create a focused checklist and 5 detailed test cases for a login form with email, password, remember me, and forgot password.",
        ru: "Составьте лаконичный checklist и 5 подробных test case для формы логина с email, паролем, remember me и forgot password.",
      },
      realWorldExample: {
        en: "A weak requirement can create more bugs than weak code because the team may build the wrong behavior correctly.",
        ru: "Слабое требование иногда создает больше проблем, чем слабый код, потому что команда может правильно реализовать неправильное поведение.",
      },
      quickChecks: {
        en: [
          "Which values should you test first when a field allows 18 to 60?",
          "Why is a negative scenario not optional?",
          "What makes a test case reproducible?",
        ],
        ru: [
          "Какие значения вы проверите первыми, если поле принимает возраст от 18 до 60?",
          "Почему негативный сценарий нельзя считать необязательным?",
          "Что делает test case воспроизводимым?",
        ],
      },
    },
    lessons: [
      {
        title: {
          en: "Read Requirements Like a Tester",
          ru: "Читайте требования как тестировщик",
        },
        body: {
          en: `## Start from ambiguity

Requirements often sound complete until you try to test them. Words like "fast", "convenient", "correct", or "secure" are weak unless the team defines what they mean.

## Questions that improve quality

Ask about allowed and forbidden values, user roles, empty and error states, scope by browser and device, and side effects such as analytics or notifications.

## Testable language

A requirement becomes stronger when the expected result is observable. "The user should log in quickly" is vague. "The user should reach the dashboard after entering valid credentials" is testable.`,
          ru: `## Начинайте с неоднозначности

Требования часто кажутся полными, пока вы не попробуете их протестировать. Формулировки вроде "быстро", "удобно", "корректно" или "безопасно" слабы, если команда не определила, что именно они означают.

## Вопросы, которые повышают качество

Спрашивайте про допустимые и запрещенные значения, роли пользователя, empty и error states, scope по браузерам и устройствам, а также побочные эффекты вроде аналитики или уведомлений.

## Тестируемый язык

Требование становится сильнее, когда ожидаемый результат наблюдаем. "Пользователь должен быстро войти" - расплывчато. "Пользователь должен попасть на dashboard после ввода валидных credentials" - уже тестируемо.`,
        },
      },
      {
        title: {
          en: "Core Test Design Techniques",
          ru: "Базовые техники тест-дизайна",
        },
        body: {
          en: `## Positive and negative checks

Positive testing confirms that the expected path works. Negative testing confirms that invalid input, missing data, and wrong states are handled safely.

## Equivalence and boundaries

If many inputs behave the same way, group them into classes. Then test one representative from each class. Add special attention to edges: for a range 18 to 60, check 17, 18, 60, and 61.

## Think in combinations

When several conditions affect one result, verify combinations. Each condition may work alone while the combined path fails.`,
          ru: `## Positive и negative checks

Positive testing подтверждает, что ожидаемый сценарий работает. Negative testing проверяет, что невалидные данные, пропущенные значения и неправильные состояния обрабатываются безопасно.

## Equivalence и boundaries

Если много входных данных ведут себя одинаково, объедините их в классы. Затем протестируйте по одному представителю из каждого класса. Особое внимание уделяйте границам: для диапазона 18-60 проверьте 17, 18, 60 и 61.

## Думайте комбинациями

Когда на один результат влияют несколько условий, проверяйте их сочетания. Каждое условие может работать отдельно, а вместе сценарий сломается.`,
        },
      },
      {
        title: {
          en: "Practice: Login Checklist and Test Cases",
          ru: "Практика: checklist и test case для логина",
        },
        body: {
          en: `Deliver two artifacts for a login page.

Checklist:
- page loads and controls are visible
- submit button state is correct
- valid login redirects to the expected page
- invalid password shows the correct error
- empty fields are validated
- remember me affects the next session

Detailed test cases:
1. successful login
2. wrong password
3. empty email
4. invalid email format
5. password reset link availability`,
          ru: `Подготовьте два артефакта для страницы логина.

Checklist:
- страница загружается и контролы видны
- состояние submit button корректно
- успешный логин ведет на ожидаемую страницу
- неверный пароль показывает правильную ошибку
- пустые поля валидируются
- remember me влияет на следующую сессию

Подробные test case:
1. успешный вход
2. неверный пароль
3. пустой email
4. невалидный формат email
5. доступность password reset link`,
        },
      },
    ],
    quizTitle: {
      en: "Requirements and Test Design Quiz",
      ru: "Квиз: требования и тест-дизайн",
    },
    questions: [
      {
        text: {
          en: "Why is the phrase 'the page should be user-friendly' weak as a requirement?",
          ru: "Почему фраза 'страница должна быть user-friendly' является слабым требованием?",
        },
        type: "SINGLE",
        options: [
          { en: "It is too short", ru: "Она слишком короткая" },
          { en: "It is not observable or measurable", ru: "Она не наблюдаема и не измерима" },
          { en: "It mentions the page", ru: "В ней упоминается страница" },
          { en: "It is impossible to test any UI", ru: "Любой UI невозможно протестировать" },
        ],
        correctAnswerIndexes: [1],
      },
      {
        text: {
          en: "Which values are best boundary checks for an 18 to 60 range?",
          ru: "Какие значения лучше всего подходят для boundary-check диапазона 18-60?",
        },
        type: "MULTI",
        options: [
          { en: "17", ru: "17" },
          { en: "18", ru: "18" },
          { en: "60", ru: "60" },
          { en: "61", ru: "61" },
        ],
        correctAnswerIndexes: [0, 1, 2, 3],
      },
      {
        text: {
          en: "When is a checklist usually enough?",
          ru: "Когда checklist обычно бывает достаточно?",
        },
        type: "SINGLE",
        options: [
          { en: "For quick regression and routine checks", ru: "Для быстрой regression и рутинных проверок" },
          { en: "For legal contracts", ru: "Для юридических договоров" },
          { en: "When no one needs coverage", ru: "Когда никому не нужно покрытие" },
          { en: "Only for backend services", ru: "Только для backend-сервисов" },
        ],
        correctAnswerIndexes: [0],
      },
      {
        text: {
          en: "Why is negative testing important?",
          ru: "Почему negative testing важно?",
        },
        type: "SINGLE",
        options: [
          { en: "It wastes time but looks impressive", ru: "Оно тратит время, но выглядит убедительно" },
          { en: "It checks how the system handles invalid states and input", ru: "Оно проверяет, как система обрабатывает невалидные состояния и ввод" },
          { en: "It replaces positive testing completely", ru: "Оно полностью заменяет positive testing" },
          { en: "It is only for automation", ru: "Оно нужно только для automation" },
        ],
        correctAnswerIndexes: [1],
      },
      {
        text: {
          en: "What makes a test case reproducible?",
          ru: "Что делает test case воспроизводимым?",
        },
        type: "SINGLE",
        options: [
          { en: "Personal opinion about the UI", ru: "Личное мнение о UI" },
          { en: "Clear preconditions, steps, and expected result", ru: "Четкие preconditions, steps и expected result" },
          { en: "A long title only", ru: "Только длинный заголовок" },
          { en: "A screenshot without text", ru: "Скриншот без текста" },
        ],
        correctAnswerIndexes: [1],
      },
    ],
  },
  {
    title: {
      en: "Web Application Testing",
      ru: "Тестирование веб-приложений",
    },
    description: {
      en: "Test UI behavior, validation, layout, responsiveness, and browser-side signals using practical web checks.",
      ru: "Проверяйте поведение UI, валидацию, верстку, адаптивность и браузерные сигналы через практические web-проверки.",
    },
    content: {
      overview: {
        en: "Manual QA often starts in the browser. This module teaches how to test pages, forms, and states in a structured way and how to use DevTools to investigate what the UI is hiding.",
        ru: "Manual QA очень часто начинает работу в браузере. Этот модуль показывает, как структурно тестировать страницы, формы и состояния, а также как использовать DevTools для расследования скрытых проблем UI.",
      },
      outcomes: {
        en: [
          "Check forms, validation, error handling, and navigation",
          "Review layout, responsiveness, and cross-browser behavior",
          "Use DevTools to inspect network, console, and client storage",
        ],
        ru: [
          "Проверять формы, валидацию, обработку ошибок и навигацию",
          "Оценивать верстку, адаптивность и кроссбраузерное поведение",
          "Использовать DevTools для network, console и client storage",
        ],
      },
      resources: {
        en: [
          "Run a browser checklist for profile settings",
          "Inspect one failed request in DevTools",
          "Compare desktop and mobile layout for the same page",
        ],
        ru: [
          "Пройдите browser-checklist для страницы profile settings",
          "Исследуйте один неуспешный запрос в DevTools",
          "Сравните desktop и mobile layout одной и той же страницы",
        ],
      },
      objectives: {
        en: [
          "Understand what users see and what the browser knows behind the UI",
          "Make browser checks more systematic than random clicking",
          "Build confidence around common web quality risks",
        ],
        ru: [
          "Понять, что видит пользователь и что браузер знает за пределами UI",
          "Сделать browser-проверки системнее, чем хаотичные клики",
          "Уверенно работать с типовыми web-рисками качества",
        ],
      },
      skills: {
        en: ["UI validation", "Responsive checks", "Browser testing", "DevTools basics"],
        ru: ["Проверка UI", "Адаптивные проверки", "Browser testing", "База DevTools"],
      },
      whatYouWillLearn: {
        en: [
          "How to test forms and state transitions",
          "What to inspect in console, network, cookies, and local storage",
          "Why responsive and compatibility checks matter",
        ],
        ru: [
          "Как тестировать формы и переходы между состояниями",
          "Что смотреть в console, network, cookies и local storage",
          "Почему важны адаптивность и compatibility-проверки",
        ],
      },
      finalChallenge: {
        en: "Test a profile settings page on desktop and mobile, capture at least 8 findings, and separate UI issues from network or data issues.",
        ru: "Протестируйте страницу profile settings на desktop и mobile, зафиксируйте минимум 8 находок и отделите UI-проблемы от network- или data-проблем.",
      },
      realWorldExample: {
        en: "A button can look broken for a user while the real cause sits in a failed API call or a JavaScript error in the browser console.",
        ru: "Кнопка может казаться сломанной для пользователя, тогда как реальная причина находится в неуспешном API-запросе или JavaScript-ошибке в browser console.",
      },
      quickChecks: {
        en: [
          "Where would you look first if a button does nothing: UI, console, or network?",
          "What is the difference between a layout bug and a validation bug?",
          "Why should the same page be checked on mobile?",
        ],
        ru: [
          "Куда вы посмотрите первым, если кнопка ничего не делает: UI, console или network?",
          "Чем layout bug отличается от validation bug?",
          "Почему одну и ту же страницу нужно проверять на mobile?",
        ],
      },
    },
    lessons: [
      {
        title: {
          en: "Forms, States, and User Flows",
          ru: "Формы, состояния и пользовательские сценарии",
        },
        body: {
          en: `## Start from the user goal

A good browser test follows user intent. For a profile page, the goal might be to update personal data, upload an avatar, or change password. Each goal creates a small flow with its own success, error, loading, and empty states.

## Common web checks

- field validation and inline errors
- disabled and enabled button states
- redirects and navigation after submit
- session behavior after refresh
- messages after success and failure

## Look beyond the happy path

Try invalid input, long text, special symbols, empty fields, expired sessions, and double clicks. Many real bugs appear when the user behaves imperfectly, not ideally.`,
          ru: `## Начинайте с цели пользователя

Хорошая browser-проверка опирается на намерение пользователя. Для profile page целью может быть обновление данных, загрузка avatar или смена пароля. Каждая цель создает отдельный flow со своими success, error, loading и empty states.

## Частые web-проверки

- валидация полей и inline-ошибки
- disabled и enabled состояния кнопок
- редиректы и навигация после submit
- поведение сессии после refresh
- сообщения об успехе и ошибке

## Смотрите дальше happy path

Пробуйте невалидные данные, длинный текст, специальные символы, пустые поля, истекшие сессии и двойные клики. Многие реальные баги проявляются тогда, когда пользователь ведет себя не идеально, а как в жизни.`,
        },
      },
      {
        title: {
          en: "DevTools for Manual QA",
          ru: "DevTools для Manual QA",
        },
        body: {
          en: `## Console

Console is useful when the UI looks wrong but you need technical clues. JavaScript errors, failed scripts, and warnings often explain why the page stopped responding.

## Network

Network tab shows requests, response codes, payloads, timing, and failed resources. If login fails, the problem might be a 401 response, invalid request body, or timeout.

## Storage and cookies

Cookies, local storage, and session storage help explain why a user stays logged in, loses settings, or sees stale data.`,
          ru: `## Console

Console полезна, когда UI выглядит неправильно, а вам нужны технические подсказки. JavaScript-errors, failed scripts и warnings часто объясняют, почему страница перестала отвечать.

## Network

Во вкладке Network видны запросы, response codes, payload, время и неуспешные ресурсы. Если логин не работает, проблема может быть в 401-ответе, некорректном request body или timeout.

## Storage и cookies

Cookies, local storage и session storage помогают понять, почему пользователь остается залогинен, теряет настройки или видит устаревшие данные.`,
        },
      },
      {
        title: {
          en: "Practice: Browser Test Run",
          ru: "Практика: browser test run",
        },
        body: {
          en: `Open one settings or profile page and perform a structured check.

1. Validate all visible controls and labels.
2. Try valid and invalid changes.
3. Refresh the page and confirm saved state.
4. Open DevTools and inspect one request.
5. Resize to mobile width and capture layout findings.

Expected output: short report with at least 8 findings grouped into UI, validation, and technical observations.`,
          ru: `Откройте одну страницу settings или profile и выполните структурированную проверку.

1. Проверьте все видимые контролы и подписи.
2. Попробуйте валидные и невалидные изменения.
3. Обновите страницу и подтвердите сохраненное состояние.
4. Откройте DevTools и исследуйте один запрос.
5. Уменьшите ширину до mobile и зафиксируйте layout findings.

Ожидаемый результат: короткий отчет минимум с 8 находками, сгруппированными по UI, validation и technical observations.`,
        },
      },
    ],
    quizTitle: {
      en: "Web Application Testing Quiz",
      ru: "Квиз: тестирование веб-приложений",
    },
    questions: [
      {
        text: {
          en: "Which browser tab helps you inspect failed HTTP requests?",
          ru: "Какая вкладка браузера помогает исследовать неуспешные HTTP-запросы?",
        },
        type: "SINGLE",
        options: [
          { en: "Styles", ru: "Styles" },
          { en: "Network", ru: "Network" },
          { en: "Elements only", ru: "Только Elements" },
          { en: "Sources only", ru: "Только Sources" },
        ],
        correctAnswerIndexes: [1],
      },
      {
        text: {
          en: "What should you verify after a successful form submission?",
          ru: "Что нужно проверить после успешной отправки формы?",
        },
        type: "MULTI",
        options: [
          { en: "Success feedback is shown", ru: "Показана обратная связь об успехе" },
          { en: "The state is persisted correctly", ru: "Состояние сохраняется корректно" },
          { en: "Navigation or redirect is correct", ru: "Навигация или redirect корректны" },
          { en: "The page color changed randomly", ru: "Цвет страницы случайно изменился" },
        ],
        correctAnswerIndexes: [0, 1, 2],
      },
      {
        text: {
          en: "Where can JavaScript runtime errors often be found?",
          ru: "Где часто можно увидеть JavaScript runtime errors?",
        },
        type: "SINGLE",
        options: [
          { en: "Console", ru: "Console" },
          { en: "Password manager", ru: "Password manager" },
          { en: "Only the address bar", ru: "Только адресная строка" },
          { en: "Browser bookmarks", ru: "Browser bookmarks" },
        ],
        correctAnswerIndexes: [0],
      },
      {
        text: {
          en: "Why should responsive testing be included?",
          ru: "Почему в тестирование нужно включать адаптивные проверки?",
        },
        type: "SINGLE",
        options: [
          { en: "Because users open the same feature on different screen sizes", ru: "Потому что пользователи открывают одну и ту же фичу на разных экранах" },
          { en: "Because it replaces functional testing", ru: "Потому что это заменяет functional testing" },
          { en: "Because desktop does not matter", ru: "Потому что desktop больше не важен" },
          { en: "Because CSS never breaks", ru: "Потому что CSS никогда не ломается" },
        ],
        correctAnswerIndexes: [0],
      },
      {
        text: {
          en: "A button looks clickable but does nothing. What is the best first step?",
          ru: "Кнопка выглядит активной, но ничего не делает. Какой первый шаг лучше всего?",
        },
        type: "SINGLE",
        options: [
          { en: "Assume the backend is broken without checking", ru: "Сразу решить, что сломан backend, ничего не проверяя" },
          { en: "Check console and network to gather evidence", ru: "Проверить console и network, чтобы собрать evidence" },
          { en: "Delete cookies for every test", ru: "Удалять cookies перед каждым тестом" },
          { en: "Skip the case as flaky", ru: "Пропустить кейс как flaky" },
        ],
        correctAnswerIndexes: [1],
      },
    ],
  },
  {
    title: {
      en: "API Testing for Manual QA",
      ru: "API-тестирование для Manual QA",
    },
    description: {
      en: "Understand HTTP basics, read JSON, work with Postman, and validate API behavior even when the UI is incomplete.",
      ru: "Освойте основы HTTP, чтение JSON, работу с Postman и проверку API-поведения даже тогда, когда UI еще не готов.",
    },
    content: {
      overview: {
        en: "Manual testers become much more effective when they can validate backend behavior directly. API checks help isolate defects faster and confirm whether the problem lives in the UI, the server, or the contract between them.",
        ru: "Manual-тестировщик становится заметно сильнее, когда умеет напрямую валидировать backend-поведение. API-проверки помогают быстрее изолировать дефекты и понять, проблема в UI, на сервере или в контракте между ними.",
      },
      outcomes: {
        en: [
          "Understand request, response, headers, and JSON payloads",
          "Recognize core HTTP status codes and authorization failures",
          "Use Postman to test happy path and negative API cases",
        ],
        ru: [
          "Понимать request, response, headers и JSON-payload",
          "Распознавать базовые HTTP status codes и authorization failures",
          "Использовать Postman для happy path и negative API-cases",
        ],
      },
      resources: {
        en: [
          "Create a GET request and verify response structure",
          "Create a POST request with invalid data",
          "Compare API result with what the UI displays",
        ],
        ru: [
          "Создайте GET-request и проверьте структуру ответа",
          "Создайте POST-request с невалидными данными",
          "Сравните результат API с тем, что показывает UI",
        ],
      },
      objectives: {
        en: [
          "Read API behavior without relying only on the interface",
          "Separate backend issues from frontend issues faster",
          "Build confidence with status codes, tokens, and payload checks",
        ],
        ru: [
          "Читать поведение API без опоры только на интерфейс",
          "Быстрее отделять backend-проблемы от frontend-проблем",
          "Уверенно работать со status codes, tokens и проверкой payload",
        ],
      },
      skills: {
        en: ["HTTP basics", "Postman", "JSON validation", "API troubleshooting"],
        ru: ["Основы HTTP", "Postman", "Проверка JSON", "API-troubleshooting"],
      },
      whatYouWillLearn: {
        en: [
          "What GET, POST, PUT, and DELETE are used for",
          "How to validate response status, body, and required fields",
          "Why API and UI should be tested separately",
        ],
        ru: [
          "Для чего используются GET, POST, PUT и DELETE",
          "Как проверять response status, body и обязательные поля",
          "Почему API и UI нужно тестировать отдельно",
        ],
      },
      finalChallenge: {
        en: "Use Postman to test login and user profile endpoints, then write a short conclusion about valid, invalid, and unauthorized cases.",
        ru: "Используйте Postman для тестирования login и user profile endpoints, а затем напишите короткое заключение по valid, invalid и unauthorized-case сценариям.",
      },
      realWorldExample: {
        en: "UI can show a generic error while the API clearly returns 401, 403, 422, or 500. API checks make the real failure mode visible.",
        ru: "UI может показывать общую ошибку, в то время как API явно возвращает 401, 403, 422 или 500. API-проверки делают реальный тип сбоя видимым.",
      },
      quickChecks: {
        en: [
          "What does HTTP 401 usually mean?",
          "What part of the response tells you whether required fields are missing?",
          "Why is API testing useful even before the UI is finished?",
        ],
        ru: [
          "Что обычно означает HTTP 401?",
          "Какая часть ответа помогает понять, что обязательные поля отсутствуют?",
          "Почему API-тестирование полезно даже до готовности UI?",
        ],
      },
    },
    lessons: [
      {
        title: {
          en: "HTTP and JSON Basics",
          ru: "Основы HTTP и JSON",
        },
        body: {
          en: `## Think in requests and responses

The client sends a request. The server returns a response. Your task is to understand whether the response matches the contract and the business expectation.

## Common methods

- GET to read data
- POST to create
- PUT or PATCH to update
- DELETE to remove

## Status codes you will see often

- 200, 201, 400, 401, 403, 404, 500

JSON is the structure of the payload. As a tester, you care whether required fields exist, values make sense, and errors are handled consistently.`,
          ru: `## Думайте запросами и ответами

Клиент отправляет request. Сервер возвращает response. Ваша задача - понять, соответствует ли ответ контракту и бизнес-ожиданию.

## Частые методы

- GET для чтения данных
- POST для создания
- PUT или PATCH для обновления
- DELETE для удаления

## Status codes, которые вы будете видеть постоянно

- 200, 201, 400, 401, 403, 404, 500

JSON - это структура payload. Для тестировщика важно, существуют ли обязательные поля, логичны ли значения и одинаково ли система обрабатывает ошибки.`,
        },
      },
      {
        title: {
          en: "Postman Workflow",
          ru: "Workflow в Postman",
        },
        body: {
          en: `## Basic flow

In Postman, you choose a method, set the URL, add headers or authorization, optionally send a body, and inspect the response.

## What to validate

- status code
- response body structure
- required fields and data types
- error message on invalid input
- authorization behavior with missing or expired token

If UI and API disagree, compare the request, response, and visible behavior instead of guessing.`,
          ru: `## Базовый flow

В Postman вы выбираете метод, задаете URL, добавляете headers или authorization, при необходимости отправляете body и исследуете response.

## Что проверять

- status code
- структуру response body
- обязательные поля и типы данных
- error message при невалидном вводе
- поведение authorization при отсутствии или истечении token

Если UI и API противоречат друг другу, сравнивайте request, response и видимое поведение, а не гадайте.`,
        },
      },
      {
        title: {
          en: "Practice: Validate Login and Profile APIs",
          ru: "Практика: проверка login и profile API",
        },
        body: {
          en: `Build a small API check session.

1. Send a valid login request and verify success response.
2. Send an invalid login request and verify error handling.
3. Reuse the token for a profile request.
4. Try the same profile request without token.
5. Write a short note comparing valid and unauthorized behavior.`,
          ru: `Проведите небольшую API-check сессию.

1. Отправьте валидный login request и проверьте успешный ответ.
2. Отправьте невалидный login request и проверьте обработку ошибки.
3. Используйте token для profile request.
4. Повторите тот же profile request без token.
5. Напишите короткую заметку, сравнивающую valid и unauthorized behavior.`,
        },
      },
    ],
    quizTitle: {
      en: "API Testing Quiz",
      ru: "Квиз: API-тестирование",
    },
    questions: [
      {
        text: {
          en: "What does HTTP 401 usually indicate?",
          ru: "Что обычно означает HTTP 401?",
        },
        type: "SINGLE",
        options: [
          { en: "Successful request", ru: "Успешный запрос" },
          { en: "Unauthorized request", ru: "Неавторизованный запрос" },
          { en: "Successful creation", ru: "Успешное создание" },
          { en: "Layout bug", ru: "Проблема верстки" },
        ],
        correctAnswerIndexes: [1],
      },
      {
        text: {
          en: "Which items are valid API checks?",
          ru: "Какие из пунктов относятся к валидным API-проверкам?",
        },
        type: "MULTI",
        options: [
          { en: "Status code", ru: "Status code" },
          { en: "Response schema or required fields", ru: "Схема ответа или обязательные поля" },
          { en: "Authorization behavior", ru: "Поведение авторизации" },
          { en: "Font family on the page", ru: "Семейство шрифта на странице" },
        ],
        correctAnswerIndexes: [0, 1, 2],
      },
      {
        text: {
          en: "Why does manual QA need API testing if UI exists?",
          ru: "Зачем manual QA нужно API-тестирование, если уже есть UI?",
        },
        type: "SINGLE",
        options: [
          { en: "To isolate backend behavior and diagnose issues faster", ru: "Чтобы изолировать backend-поведение и быстрее диагностировать проблемы" },
          { en: "To avoid all browser testing forever", ru: "Чтобы навсегда отказаться от browser-testing" },
          { en: "To replace requirements analysis", ru: "Чтобы заменить анализ требований" },
          { en: "To skip bug reports", ru: "Чтобы не писать баг-репорты" },
        ],
        correctAnswerIndexes: [0],
      },
      {
        text: {
          en: "Which method is commonly used to create a resource?",
          ru: "Какой метод обычно используют для создания ресурса?",
        },
        type: "SINGLE",
        options: [
          { en: "GET", ru: "GET" },
          { en: "POST", ru: "POST" },
          { en: "DELETE", ru: "DELETE" },
          { en: "OPTIONS", ru: "OPTIONS" },
        ],
        correctAnswerIndexes: [1],
      },
      {
        text: {
          en: "What should you compare when UI shows an error but you are unsure why?",
          ru: "Что нужно сравнить, если UI показывает ошибку, а причина неясна?",
        },
        type: "SINGLE",
        options: [
          { en: "Only the page color", ru: "Только цвет страницы" },
          { en: "Request, response, and visible UI behavior", ru: "Request, response и видимое поведение UI" },
          { en: "Only the browser zoom level", ru: "Только масштаб браузера" },
          { en: "Only the favicon", ru: "Только favicon" },
        ],
        correctAnswerIndexes: [1],
      },
    ],
  },
  {
    title: {
      en: "Bug Reporting and Release Readiness",
      ru: "Баг-репорты и готовность к релизу",
    },
    description: {
      en: "Write stronger bug reports, understand severity and priority, and learn smoke, sanity, regression, and exploratory testing.",
      ru: "Научитесь писать сильные баг-репорты, различать severity и priority, а также понимать smoke, sanity, regression и exploratory testing.",
    },
    content: {
      overview: {
        en: "Finding a bug is only half the job. A tester becomes valuable when the team can reproduce the issue, estimate impact, and make a release decision based on clear evidence.",
        ru: "Найти баг - это только половина работы. Тестировщик становится ценным тогда, когда команда может воспроизвести проблему, оценить ее влияние и принять релизное решение на основе понятного evidence.",
      },
      outcomes: {
        en: [
          "Write bug reports with clear steps and impact",
          "Differentiate severity from business priority",
          "Understand smoke, sanity, regression, and exploratory approaches",
        ],
        ru: [
          "Писать баг-репорты с понятными шагами и описанием влияния",
          "Различать severity и business priority",
          "Понимать подходы smoke, sanity, regression и exploratory testing",
        ],
      },
      resources: {
        en: [
          "Create 3 bug reports from one tested page",
          "Draft a smoke checklist for a release candidate",
          "List features that should be covered by a short regression",
        ],
        ru: [
          "Создайте 3 баг-репорта по результатам тестирования одной страницы",
          "Подготовьте smoke-checklist для release candidate",
          "Перечислите фичи для короткого regression-прохода",
        ],
      },
      objectives: {
        en: [
          "Turn findings into actionable communication",
          "Decide what must be checked first when time is limited",
          "Think like a QA engineer close to release day",
        ],
        ru: [
          "Превращать находки в прикладную коммуникацию для команды",
          "Понимать, что проверять в первую очередь при дефиците времени",
          "Мыслить как QA engineer вблизи релиза",
        ],
      },
      skills: {
        en: ["Bug reporting", "Release testing", "Regression thinking", "Risk communication"],
        ru: ["Баг-репортинг", "Релизные проверки", "Regression-мышление", "Коммуникация рисков"],
      },
      whatYouWillLearn: {
        en: [
          "How to write a bug report other people can use",
          "How to prioritize checks before release",
          "How to summarize release quality with clarity",
        ],
        ru: [
          "Как писать баг-репорт, которым реально смогут пользоваться",
          "Как расставлять приоритет проверок перед релизом",
          "Как ясно подводить итог по качеству перед выпуском",
        ],
      },
      finalChallenge: {
        en: "Test a small web feature, prepare at least 5 bug reports, a smoke checklist, and a short release recommendation with open risks.",
        ru: "Протестируйте небольшую web-фичу, подготовьте минимум 5 баг-репортов, smoke-checklist и короткую release-рекомендацию с открытыми рисками.",
      },
      realWorldExample: {
        en: "A vague bug report can waste more team time than the bug itself, because developers cannot reproduce the issue and product cannot assess its impact.",
        ru: "Размытый баг-репорт иногда тратит больше времени команды, чем сам баг, потому что разработчики не могут воспроизвести проблему, а продукт не понимает влияние.",
      },
      quickChecks: {
        en: [
          "What is the difference between severity and priority?",
          "Why is smoke testing useful after a fresh build?",
          "What must every good bug report contain?",
        ],
        ru: [
          "В чем разница между severity и priority?",
          "Почему smoke testing полезно после новой сборки?",
          "Что обязательно должно быть в хорошем баг-репорте?",
        ],
      },
    },
    lessons: [
      {
        title: {
          en: "Write Bug Reports People Can Use",
          ru: "Пишите баг-репорты, которыми можно пользоваться",
        },
        body: {
          en: `## A useful bug report answers three questions

1. What is broken?
2. How can the team reproduce it?
3. Why does it matter?

## Core structure

- title
- environment
- preconditions
- steps to reproduce
- expected result
- actual result
- severity and priority
- attachments if useful

Write facts, not frustration.`,
          ru: `## Полезный баг-репорт отвечает на три вопроса

1. Что сломано?
2. Как это воспроизвести?
3. Почему это важно?

## Базовая структура

- title
- environment
- preconditions
- steps to reproduce
- expected result
- actual result
- severity и priority
- attachments при необходимости

Пишите факты, а не эмоции.`,
        },
      },
      {
        title: {
          en: "Smoke, Sanity, Regression, and Exploratory Testing",
          ru: "Smoke, sanity, regression и exploratory testing",
        },
        body: {
          en: `## Smoke

Smoke confirms the build is stable enough for deeper testing. It covers the most critical paths only.

## Sanity

Sanity focuses on a narrow area, usually after a specific fix.

## Regression

Regression checks whether old behavior still works after new changes.

## Exploratory

Exploratory testing is purposeful investigation, not random clicking.`,
          ru: `## Smoke

Smoke подтверждает, что сборка достаточно стабильна для дальнейшего тестирования. Оно покрывает только самые критичные пути.

## Sanity

Sanity фокусируется на узкой зоне, обычно после конкретного фикса.

## Regression

Regression проверяет, не сломался ли старый функционал после новых изменений.

## Exploratory

Exploratory testing - это целенаправленное исследование, а не хаотичные клики.`,
        },
      },
      {
        title: {
          en: "Final Practice: Release Recommendation",
          ru: "Финальная практика: рекомендация к релизу",
        },
        body: {
          en: `Test one small web feature and package your work like a junior QA engineer.

Deliver:
1. at least 5 bug reports
2. one smoke checklist
3. one short regression list
4. one release recommendation: ready, ready with risks, or not ready

Your recommendation must name the top risks and explain why the team should care.`,
          ru: `Протестируйте одну небольшую web-фичу и оформите результат как junior QA engineer.

Подготовьте:
1. минимум 5 баг-репортов
2. один smoke-checklist
3. один короткий regression-list
4. одну release-рекомендацию: ready, ready with risks или not ready

В рекомендации обязательно назовите ключевые риски и объясните, почему команде важно на них смотреть.`,
        },
      },
    ],
    quizTitle: {
      en: "Bug Reporting and Release Readiness Quiz",
      ru: "Квиз: баг-репорты и готовность к релизу",
    },
    questions: [
      {
        text: {
          en: "What is the main purpose of a bug report?",
          ru: "Какова главная цель баг-репорта?",
        },
        type: "SINGLE",
        options: [
          { en: "To criticize the developer", ru: "Покритиковать разработчика" },
          { en: "To make the issue reproducible and actionable", ru: "Сделать проблему воспроизводимой и пригодной для работы" },
          { en: "To increase the number of tickets", ru: "Увеличить количество тикетов" },
          { en: "To replace regression testing", ru: "Заменить regression testing" },
        ],
        correctAnswerIndexes: [1],
      },
      {
        text: {
          en: "Which items belong in a solid bug report?",
          ru: "Какие элементы входят в хороший баг-репорт?",
        },
        type: "MULTI",
        options: [
          { en: "Steps to reproduce", ru: "Шаги воспроизведения" },
          { en: "Expected and actual result", ru: "Expected и actual result" },
          { en: "Environment details", ru: "Детали окружения" },
          { en: "A random joke", ru: "Случайная шутка" },
        ],
        correctAnswerIndexes: [0, 1, 2],
      },
      {
        text: {
          en: "What is smoke testing mainly used for?",
          ru: "Для чего в основном используют smoke testing?",
        },
        type: "SINGLE",
        options: [
          { en: "To check if the build is stable enough for deeper testing", ru: "Чтобы понять, достаточно ли стабильна сборка для дальнейших проверок" },
          { en: "To replace all functional testing", ru: "Чтобы заменить все functional testing" },
          { en: "To test only colors and fonts", ru: "Чтобы проверять только цвета и шрифты" },
          { en: "To generate documentation automatically", ru: "Чтобы автоматически генерировать документацию" },
        ],
        correctAnswerIndexes: [0],
      },
      {
        text: {
          en: "How is priority different from severity?",
          ru: "Чем priority отличается от severity?",
        },
        type: "SINGLE",
        options: [
          { en: "Priority reflects business urgency, severity reflects product impact", ru: "Priority отражает бизнес-срочность, severity - влияние на продукт" },
          { en: "They always mean the same thing", ru: "Они всегда означают одно и то же" },
          { en: "Priority is only for designers", ru: "Priority нужно только дизайнерам" },
          { en: "Severity is only for analytics", ru: "Severity нужно только аналитикам" },
        ],
        correctAnswerIndexes: [0],
      },
      {
        text: {
          en: "What makes a release recommendation credible?",
          ru: "Что делает release-рекомендацию убедительной?",
        },
        type: "SINGLE",
        options: [
          { en: "A confident tone without evidence", ru: "Уверенный тон без evidence" },
          { en: "Clear coverage, known risks, and supporting findings", ru: "Понятное покрытие, известные риски и подтверждающие findings" },
          { en: "Only one successful happy-path test", ru: "Только один успешный happy-path test" },
          { en: "No bug reports at all", ru: "Полное отсутствие баг-репортов" },
        ],
        correctAnswerIndexes: [1],
      },
    ],
  },
];

const QA_REAL_WORLD_LABS: Localized<string>[][] = [
  [
    {
      en: `## Workplace artifact: QA intake note

Use this note when a product manager gives you a new feature before development starts.

| Field | Example |
| --- | --- |
| Feature | Email sign-up with verification code |
| User goal | Create an account and confirm ownership of the email |
| Main risk | User cannot finish registration because the code expires or error text is unclear |
| First question | What happens after 3 failed code attempts? |
| Evidence to collect | Requirements link, test data, screenshots, browser, environment |

## Real beginner task

Write a 6-line QA intake note for this feature: "A learner can save a lesson to bookmarks and find it later in Bookmarks."

Your answer should include:
- one user goal
- three product or UI risks
- two questions for the team
- one environment where you would test first`,
      ru: `## Рабочий артефакт: QA intake note

Используйте такую заметку, когда product manager приносит новую фичу еще до разработки.

| Поле | Пример |
| --- | --- |
| Feature | Регистрация по email с verification code |
| Цель пользователя | Создать аккаунт и подтвердить владение email |
| Главный риск | Пользователь не может завершить регистрацию из-за истекшего кода или непонятной ошибки |
| Первый вопрос | Что происходит после 3 неверных попыток ввода кода? |
| Evidence | Ссылка на требования, тестовые данные, screenshots, browser, environment |

## Реальная задача для новичка

Напишите QA intake note на 6 строк для фичи: "Студент может сохранить урок в bookmarks и позже найти его в Bookmarks."

В ответе должны быть:
- одна цель пользователя
- три продуктовых или UI-риска
- два вопроса команде
- одно окружение, где вы проверите фичу первым`,
    },
    {
      en: `## Workplace artifact: sprint QA map

Use this map to understand where QA participates during a sprint.

| Sprint moment | QA action | Output |
| --- | --- | --- |
| Backlog refinement | Find unclear requirements | Questions in the ticket |
| Planning | Confirm scope and test data | Testing notes |
| Development | Prepare checks before the build | Checklist or test cases |
| Code review/build ready | Run smoke and focused checks | Findings and blocker status |
| Before release | Summarize quality and risk | Release recommendation |

## Real beginner task

For a password reset feature, write one QA action for each sprint moment. Keep each action specific: "ask what happens when token expires" is better than "test everything".`,
      ru: `## Рабочий артефакт: sprint QA map

Эта карта показывает, где QA участвует в спринте.

| Момент спринта | Действие QA | Результат |
| --- | --- | --- |
| Backlog refinement | Найти неясные требования | Вопросы в ticket |
| Planning | Подтвердить scope и test data | Testing notes |
| Development | Подготовить проверки до сборки | Checklist или test cases |
| Code review/build ready | Запустить smoke и focused checks | Findings и blocker status |
| Before release | Суммировать качество и риски | Release recommendation |

## Реальная задача для новичка

Для фичи password reset напишите по одному QA-действию на каждый момент спринта. Делайте формулировки конкретными: "спросить, что происходит после истечения token" лучше, чем "проверить всё".`,
    },
    {
      en: `## Workplace artifact: risk register

| Risk | Impact | Probability | First check |
| --- | --- | --- | --- |
| Duplicate accounts are created | High | Medium | Register twice with the same email |
| Error text does not explain the problem | Medium | High | Submit invalid email and empty password |
| Mobile keyboard hides the submit button | Medium | Medium | Test on 390px width |
| Analytics event is missing | Low | Medium | Confirm event in Network/console |

## Real beginner task

Create a risk register for a checkout page with promo code, payment method, and order confirmation. Add at least 5 risks and mark the first check for each.`,
      ru: `## Рабочий артефакт: risk register

| Риск | Влияние | Вероятность | Первая проверка |
| --- | --- | --- | --- |
| Создаются дубли аккаунтов | High | Medium | Зарегистрироваться дважды с одним email |
| Текст ошибки не объясняет проблему | Medium | High | Отправить invalid email и пустой password |
| Mobile keyboard закрывает submit button | Medium | Medium | Проверить на ширине 390px |
| Analytics event не отправляется | Low | Medium | Проверить event в Network/console |

## Реальная задача для новичка

Создайте risk register для checkout page с promo code, payment method и order confirmation. Добавьте минимум 5 рисков и первую проверку для каждого.`,
    },
  ],
  [
    {
      en: `## Workplace artifact: requirement review

Weak requirement: "The user should be able to upload a profile image."

QA rewrite:
- Accepted formats: JPG, PNG, WebP
- Max size: 5 MB
- Min dimensions: 256x256
- Error state: unsupported format, too large file, upload timeout
- Success state: avatar preview updates without page reload
- Accessibility: upload control has visible label and keyboard access

## Real beginner task

Rewrite this vague requirement into testable acceptance criteria: "The lesson search should work fast and show relevant results."`,
      ru: `## Рабочий артефакт: requirement review

Слабое требование: "Пользователь должен иметь возможность загрузить profile image."

QA-переписывание:
- Accepted formats: JPG, PNG, WebP
- Max size: 5 MB
- Min dimensions: 256x256
- Error state: unsupported format, too large file, upload timeout
- Success state: avatar preview обновляется без reload
- Accessibility: upload control имеет видимый label и доступен с клавиатуры

## Реальная задача для новичка

Перепишите это расплывчатое требование в testable acceptance criteria: "Поиск по урокам должен работать быстро и показывать релевантные результаты."`,
    },
    {
      en: `## Workplace artifact: test design matrix

Feature: age field accepts 18-60.

| Technique | Values | Why |
| --- | --- | --- |
| Boundary values | 17, 18, 60, 61 | Finds off-by-one mistakes |
| Equivalence classes | 25, 10, empty, text | Covers valid and invalid groups |
| Negative checks | -1, 999, "abc" | Confirms safe validation |
| State checks | submit disabled/enabled | Confirms UI reacts correctly |

## Real beginner task

Build the same matrix for a password field: minimum 8 characters, must include a number, must include a capital letter.`,
      ru: `## Рабочий артефакт: test design matrix

Feature: поле age принимает 18-60.

| Техника | Значения | Зачем |
| --- | --- | --- |
| Boundary values | 17, 18, 60, 61 | Находит off-by-one ошибки |
| Equivalence classes | 25, 10, empty, text | Покрывает valid и invalid группы |
| Negative checks | -1, 999, "abc" | Подтверждает безопасную validation |
| State checks | submit disabled/enabled | Подтверждает реакцию UI |

## Реальная задача для новичка

Постройте такую же matrix для password field: минимум 8 символов, нужна цифра, нужна заглавная буква.`,
    },
    {
      en: `## Workplace artifact: test case sample

**Title:** Login succeeds with valid credentials
**Preconditions:** User exists and email is verified
**Data:** student@levio.local / valid password
**Steps:**
1. Open login page
2. Enter valid email
3. Enter valid password
4. Click Sign in

**Expected result:** User lands on Dashboard, session is active, no validation errors are shown.

## Real beginner task

Write two test cases in this format:
- invalid email format
- correct email with wrong password`,
      ru: `## Рабочий артефакт: пример test case

**Title:** Login succeeds with valid credentials
**Preconditions:** User exists and email is verified
**Data:** student@levio.local / valid password
**Steps:**
1. Open login page
2. Enter valid email
3. Enter valid password
4. Click Sign in

**Expected result:** User lands on Dashboard, session is active, validation errors are not shown.

## Реальная задача для новичка

Напишите два test case в таком же формате:
- invalid email format
- correct email with wrong password`,
    },
  ],
  [
    {
      en: `## Workplace artifact: browser checklist

Feature: edit profile.

| Area | Checks |
| --- | --- |
| UI | Labels, required marks, helper text, disabled/enabled button |
| Validation | Empty name, long name, invalid characters |
| State | Loading, success, error, refresh after save |
| Navigation | Cancel, back button, redirect after save |
| Mobile | 390px layout, keyboard overlap, tap targets |

## Real beginner task

Run this checklist against any settings page in the project and write 5 findings. A finding can be "works as expected" if it includes evidence.`,
      ru: `## Рабочий артефакт: browser checklist

Feature: edit profile.

| Зона | Проверки |
| --- | --- |
| UI | Labels, required marks, helper text, disabled/enabled button |
| Validation | Empty name, long name, invalid characters |
| State | Loading, success, error, refresh after save |
| Navigation | Cancel, back button, redirect after save |
| Mobile | 390px layout, keyboard overlap, tap targets |

## Реальная задача для новичка

Пройдите этот checklist на любой settings page в проекте и напишите 5 findings. Finding может быть "works as expected", если есть evidence.`,
    },
    {
      en: `## Workplace artifact: DevTools investigation note

Use this note when the UI shows an error but the reason is unclear.

| Signal | What to capture |
| --- | --- |
| Console | Error text, file, line, time |
| Network | URL, method, status code, request body, response body |
| Storage | Token exists, cookie expiry, stale local storage value |
| Reproduction | Exact steps and account used |

## Real beginner task

Simulate a failed login and write a DevTools investigation note. If you cannot access the real backend, describe what you would capture.`,
      ru: `## Рабочий артефакт: DevTools investigation note

Используйте эту заметку, когда UI показывает ошибку, но причина неясна.

| Signal | Что зафиксировать |
| --- | --- |
| Console | Error text, file, line, time |
| Network | URL, method, status code, request body, response body |
| Storage | Token exists, cookie expiry, stale local storage value |
| Reproduction | Точные шаги и account |

## Реальная задача для новичка

Сымитируйте failed login и напишите DevTools investigation note. Если нет доступа к реальному backend, опишите, что именно вы бы зафиксировали.`,
    },
    {
      en: `## Workplace artifact: responsive test run

| Viewport | What to inspect |
| --- | --- |
| 1440px desktop | Main layout, sidebar/header, spacing |
| 1024px tablet | Navigation, cards per row, wrapping |
| 390px mobile | Text overflow, button size, sticky footer, keyboard |
| 320px narrow mobile | Long words, icons, critical CTA visibility |

## Real beginner task

Pick one module page and inspect it at 1440px, 390px, and 320px. Report at least one observation per viewport.`,
      ru: `## Рабочий артефакт: responsive test run

| Viewport | Что проверить |
| --- | --- |
| 1440px desktop | Main layout, sidebar/header, spacing |
| 1024px tablet | Navigation, cards per row, wrapping |
| 390px mobile | Text overflow, button size, sticky footer, keyboard |
| 320px narrow mobile | Long words, icons, visibility of critical CTA |

## Реальная задача для новичка

Выберите одну module page и проверьте ее на 1440px, 390px и 320px. Зафиксируйте минимум одно observation на каждый viewport.`,
    },
  ],
  [
    {
      en: `## Workplace artifact: API contract card

Endpoint: GET /api/bookmarks

| Item | Expected |
| --- | --- |
| Auth | Valid session required |
| Success status | 200 |
| Response shape | { bookmarks: [{ id, title, href, createdAt }] } |
| Empty state | bookmarks is [] |
| Unauthorized | 401 or redirect to login |
| Data risk | Deleted lesson should not remain in bookmarks |

## Real beginner task

Write an API contract card for POST /api/bookmarks. Include request body, success response, validation error, and unauthorized behavior.`,
      ru: `## Рабочий артефакт: API contract card

Endpoint: GET /api/bookmarks

| Item | Expected |
| --- | --- |
| Auth | Valid session required |
| Success status | 200 |
| Response shape | { bookmarks: [{ id, title, href, createdAt }] } |
| Empty state | bookmarks is [] |
| Unauthorized | 401 или redirect to login |
| Data risk | Deleted lesson не должен оставаться в bookmarks |

## Реальная задача для новичка

Напишите API contract card для POST /api/bookmarks. Укажите request body, success response, validation error и unauthorized behavior.`,
    },
    {
      en: `## Workplace artifact: Postman collection plan

| Request | Purpose | Expected |
| --- | --- | --- |
| Login valid user | Get session/token | 200 and user object |
| Login wrong password | Validate auth error | 401 or clear error |
| Get profile with auth | Confirm protected data | 200 and profile fields |
| Get profile without auth | Confirm protection | 401/403 |
| Update profile invalid name | Validate input | 400/422 with field error |

## Real beginner task

Create a 5-request Postman plan for a lesson bookmark API. Name each request and describe the expected status.`,
      ru: `## Рабочий артефакт: Postman collection plan

| Request | Purpose | Expected |
| --- | --- | --- |
| Login valid user | Получить session/token | 200 and user object |
| Login wrong password | Проверить auth error | 401 или clear error |
| Get profile with auth | Подтвердить protected data | 200 and profile fields |
| Get profile without auth | Подтвердить protection | 401/403 |
| Update profile invalid name | Проверить input validation | 400/422 with field error |

## Реальная задача для новичка

Создайте 5-request Postman plan для lesson bookmark API. Назовите каждый request и опишите expected status.`,
    },
    {
      en: `## Workplace artifact: API finding

**Title:** POST /api/bookmarks accepts empty lessonId
**Environment:** local, Chrome, student account
**Request:** POST /api/bookmarks with body { "lessonId": "" }
**Expected:** 400 or 422 with field-level validation error
**Actual:** 200 and empty bookmark created
**Impact:** User can create broken saved items; Bookmarks page may show blank cards
**Evidence:** request/response body, timestamp, account

## Real beginner task

Write one API finding for unauthorized access to a protected endpoint.`,
      ru: `## Рабочий артефакт: API finding

**Title:** POST /api/bookmarks accepts empty lessonId
**Environment:** local, Chrome, student account
**Request:** POST /api/bookmarks with body { "lessonId": "" }
**Expected:** 400 or 422 with field-level validation error
**Actual:** 200 and empty bookmark created
**Impact:** User can create broken saved items; Bookmarks page may show blank cards
**Evidence:** request/response body, timestamp, account

## Реальная задача для новичка

Напишите один API finding для unauthorized access к protected endpoint.`,
    },
  ],
  [
    {
      en: `## Workplace artifact: strong bug report

**Title:** Save button remains enabled during profile update and creates duplicate requests
**Environment:** local, Chrome 124, student@levio.local
**Preconditions:** User is logged in and opens Profile settings
**Steps:**
1. Change the display name
2. Double-click Save quickly
3. Open Network tab

**Expected:** Button becomes disabled after first click; only one request is sent
**Actual:** Two update requests are sent
**Severity:** Medium
**Priority:** High if duplicate writes can corrupt data
**Evidence:** Network screenshot with two POST/PATCH requests

## Real beginner task

Write a bug report for this defect: "On mobile, the Continue button overlaps the last quiz option."`,
      ru: `## Рабочий артефакт: сильный bug report

**Title:** Save button remains enabled during profile update and creates duplicate requests
**Environment:** local, Chrome 124, student@levio.local
**Preconditions:** User is logged in and opens Profile settings
**Steps:**
1. Change the display name
2. Double-click Save quickly
3. Open Network tab

**Expected:** Button becomes disabled after first click; only one request is sent
**Actual:** Two update requests are sent
**Severity:** Medium
**Priority:** High if duplicate writes can corrupt data
**Evidence:** Network screenshot with two POST/PATCH requests

## Реальная задача для новичка

Напишите bug report для дефекта: "На mobile кнопка Continue перекрывает последний вариант ответа в quiz."`,
    },
    {
      en: `## Workplace artifact: release test strategy

| Test type | When to use | Example |
| --- | --- | --- |
| Smoke | Fresh build is deployed | Login, open dashboard, start module |
| Sanity | One focused fix | Retest bookmark save after fix |
| Regression | Before release | Login, tracks, module, quiz, certificate |
| Exploratory | Risk is unclear | Try unusual flows around progress and quiz retry |

## Real beginner task

Prepare a 10-item smoke checklist for releasing the QA learning path.`,
      ru: `## Рабочий артефакт: release test strategy

| Test type | Когда использовать | Пример |
| --- | --- | --- |
| Smoke | Fresh build deployed | Login, open dashboard, start module |
| Sanity | One focused fix | Retest bookmark save after fix |
| Regression | Before release | Login, tracks, module, quiz, certificate |
| Exploratory | Risk is unclear | Try unusual flows around progress and quiz retry |

## Реальная задача для новичка

Подготовьте smoke checklist из 10 пунктов для релиза QA learning path.`,
    },
    {
      en: `## Workplace artifact: release recommendation

**Recommendation:** Ready with risks
**Coverage completed:** login, QA track page, first module, quiz fallback, dashboard progress
**Open defects:** mobile overlap in quiz options, Gemini AI returns 403 locally
**Risk:** Learners can still complete modules, but AI-generated quiz is unavailable until API access is fixed
**Decision needed:** Release fallback learning flow now or block release until AI key is corrected

## Real beginner task

Write a release recommendation for a build where payment works, course progress works, but certificate PDF generation fails.`,
      ru: `## Рабочий артефакт: release recommendation

**Recommendation:** Ready with risks
**Coverage completed:** login, QA track page, first module, quiz fallback, dashboard progress
**Open defects:** mobile overlap in quiz options, Gemini AI returns 403 locally
**Risk:** Learners can still complete modules, but AI-generated quiz is unavailable until API access is fixed
**Decision needed:** Release fallback learning flow now or block release until AI key is corrected

## Реальная задача для новичка

Напишите release recommendation для build, где payment работает, course progress работает, но certificate PDF generation fails.`,
    },
  ],
];

function pickLocalized<T>(value: Localized<T>, locale: LearningLocale): T {
  return value[locale];
}

function normalizeOptionIds(question: RuntimeQuestion): string[] {
  if (question.options.length > 0) {
    return question.options.map((option, index) => option.id || `opt-${index + 1}`);
  }

  return ["opt-1", "opt-2", "opt-3", "opt-4"];
}

function applyQuestionOverride(question: RuntimeQuestion, override: OverrideQuestion | undefined, locale: LearningLocale): RuntimeQuestion {
  if (!override) {
    return question;
  }

  const optionIds = normalizeOptionIds(question);
  const localizedOptions = override.options.map((option, index) => ({
    id: optionIds[index] ?? `opt-${index + 1}`,
    text: pickLocalized(option, locale),
  }));

  return {
    ...question,
    text: pickLocalized(override.text, locale),
    type: override.type,
    options: localizedOptions,
    correctAnswer: override.correctAnswerIndexes.map((index) => optionIds[index] ?? `opt-${index + 1}`),
  };
}

function applyModuleOverride(
  module: RuntimeModule,
  override: OverrideModule | undefined,
  locale: LearningLocale,
  moduleIndex: number,
): RuntimeModule {
  if (!override) {
    return module;
  }

  return {
    ...module,
    title: pickLocalized(override.title, locale),
    description: pickLocalized(override.description, locale),
    content: {
      overview: pickLocalized(override.content.overview, locale),
      outcomes: pickLocalized(override.content.outcomes, locale),
      resources: pickLocalized(override.content.resources, locale),
      objectives: pickLocalized(override.content.objectives, locale),
      skills: pickLocalized(override.content.skills, locale),
      whatYouWillLearn: pickLocalized(override.content.whatYouWillLearn, locale),
      finalChallenge: pickLocalized(override.content.finalChallenge, locale),
      realWorldExample: pickLocalized(override.content.realWorldExample, locale),
      quickChecks: pickLocalized(override.content.quickChecks, locale),
    },
    lessons: module.lessons.map((lesson, index) => {
      const lessonOverride = override.lessons[index];
      if (!lessonOverride) {
        return lesson;
      }
      const realWorldLab = QA_REAL_WORLD_LABS[moduleIndex]?.[index];
      const lessonBody = pickLocalized(lessonOverride.body, locale);
      return {
        ...lesson,
        title: pickLocalized(lessonOverride.title, locale),
        body: realWorldLab ? `${lessonBody}\n\n${pickLocalized(realWorldLab, locale)}` : lessonBody,
      };
    }),
    quiz: module.quiz
      ? {
          ...module.quiz,
          title: pickLocalized(override.quizTitle, locale),
          questions: module.quiz.questions.map((question, index) =>
            applyQuestionOverride(question, override.questions[index], locale),
          ),
        }
      : null,
  };
}

export function normalizeLearningLocale(value: string | undefined): LearningLocale {
  return value === "en" ? "en" : "ru";
}

export function applyTrackContentOverrides(course: RuntimeCourse, locale: LearningLocale): RuntimeCourse {
  if (course.slug !== "qa-engineer") {
    return course;
  }

  return {
    ...course,
    description: pickLocalized(QA_TRACK_DESCRIPTION, locale),
    shortDescription: pickLocalized(QA_TRACK_DESCRIPTION, locale),
    modules: course.modules.map((moduleItem, index) =>
      applyModuleOverride(moduleItem, QA_MANUAL_MODULES[index], locale, index),
    ),
  };
}
