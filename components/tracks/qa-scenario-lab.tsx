"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gauge,
  Radio,
  ShieldAlert,
  Target,
  Timer,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

type ScenarioChoice = {
  id: string;
  label: string;
  feedback: string;
  correct?: boolean;
};

type ScenarioStep = {
  id: string;
  title: string;
  prompt: string;
  choices: ScenarioChoice[];
};

type QaScenarioLabProps = {
  moduleTitle: string;
  moduleOrder: number;
  quizHref: string | null;
};

type ScenarioConfig = {
  title: string;
  intro: string;
  scene: {
    product: string;
    pressure: string;
    userReport: string;
    winCondition: string;
  };
  artifact: string[];
  rule: string;
  steps: ScenarioStep[];
};

const SCENARIOS: Record<number, ScenarioConfig> = {
  1: {
    title: "Первое расследование бага",
    intro: "Разберите проблему регистрации и соберите основу первого баг-репорта.",
    scene: {
      product: "Форма регистрации",
      pressure: "До демо инвесторам: 18 минут",
      userReport: "«Ввожу email и пароль, нажимаю Submit, но аккаунт не создаётся»",
      winCondition: "Передать разработчику воспроизводимый баг с понятным риском.",
    },
    artifact: ["Шаги воспроизведения", "Severity и продуктовый риск", "Заголовок баг-репорта"],
    rule: "Хороший тестировщик не просто находит ошибку. Он снижает неопределённость для команды.",
    steps: [
      {
        id: "triage",
        title: "1. Первичная проверка",
        prompt: "Команда выкатила форму регистрации. Пользователь пишет: «Не могу создать аккаунт». Что проверите первым?",
        choices: [
          { id: "clear-cache", label: "Попросить очистить кеш и закрыть задачу", feedback: "Слишком рано. Кеш может быть причиной, но сначала нужно воспроизвести и понять условия ошибки." },
          { id: "reproduce", label: "Повторить сценарий с теми же данными и окружением", feedback: "Верно. QA сначала фиксирует воспроизводимость: шаги, данные, браузер, ожидаемый и фактический результат.", correct: true },
          { id: "rewrite", label: "Сразу предложить переписать форму", feedback: "Это решение без диагностики. Сначала нужны факты: где ломается сценарий и какой риск для пользователя." },
        ],
      },
      {
        id: "severity",
        title: "2. Оценка риска",
        prompt: "Вы воспроизвели баг: кнопка Submit ничего не делает при валидных данных. Как оценить severity?",
        choices: [
          { id: "critical", label: "Высокая: пользователь не может завершить ключевой сценарий", feedback: "Да. Регистрация - ключевой путь. Если он заблокирован, это высокий продуктовый риск.", correct: true },
          { id: "low", label: "Низкая: интерфейс просто не отвечает", feedback: "Низкая severity подходит для косметики. Здесь пользователь полностью заблокирован." },
          { id: "none", label: "Не баг, потому что нет ошибки на экране", feedback: "Отсутствие сообщения об ошибке не отменяет дефект. Это может быть ещё и UX-проблемой." },
        ],
      },
      {
        id: "report",
        title: "3. Баг-репорт",
        prompt: "Какой заголовок будет полезнее для разработчика?",
        choices: [
          { id: "bad-title", label: "Регистрация не работает", feedback: "Понятно, но слишком широко. Разработчику придётся уточнять условия." },
          { id: "good-title", label: "Submit не создаёт аккаунт при валидных данных в Chrome", feedback: "Лучше: есть действие, результат, данные и окружение. Такой заголовок быстрее ведёт к исправлению.", correct: true },
          { id: "emotional", label: "Срочно всё сломалось", feedback: "Эмоции не помогают triage. Нужны факты и воспроизводимые шаги." },
        ],
      },
    ],
  },
  2: {
    title: "Разбор требований перед тестом",
    intro: "Проверьте требования к скидке и выберите покрытие, которое ловит реальные риски.",
    scene: {
      product: "Промо-скидка для постоянных клиентов",
      pressure: "Backend уже начал реализацию",
      userReport: "«Нужно показывать скидку постоянным клиентам»",
      winCondition: "Превратить расплывчатое требование в проверяемые условия.",
    },
    artifact: ["Список неясностей", "Позитивный и негативный сценарий", "Граница для проверки"],
    rule: "Если требование нельзя проверить, его нужно уточнить до разработки или релиза.",
    steps: [
      {
        id: "ambiguity",
        title: "1. Найти неясность",
        prompt: "В требовании написано: «Показывать скидку постоянным клиентам». Что нужно уточнить первым?",
        choices: [
          { id: "color", label: "Какого цвета должен быть бейдж скидки", feedback: "Это тоже важно, но сначала нужно понять бизнес-правило." },
          { id: "definition", label: "Кто считается постоянным клиентом", feedback: "Верно. Без определения сегмента тестировать скидку невозможно.", correct: true },
          { id: "font", label: "Какой шрифт использовать", feedback: "Это визуальная деталь, а не главное условие логики скидки." },
        ],
      },
      {
        id: "boundary",
        title: "2. Граница",
        prompt: "Постоянный клиент - от 3 заказов. Какой набор данных лучше поймает ошибку?",
        choices: [
          { id: "one-case", label: "Только пользователь с 5 заказами", feedback: "Это проверит happy path, но не границу." },
          { id: "boundary-cases", label: "2, 3 и 4 заказа", feedback: "Да. Граница вокруг условия чаще всего даёт ценные дефекты.", correct: true },
          { id: "random", label: "Любой пользователь из базы", feedback: "Случайный пользователь не гарантирует проверку правила." },
        ],
      },
      {
        id: "negative",
        title: "3. Негативный сценарий",
        prompt: "Какой негативный сценарий нужен для требования про скидку?",
        choices: [
          { id: "not-eligible", label: "Пользователь с 2 заказами не видит скидку", feedback: "Верно. Негативный сценарий защищает от лишней скидки не тому сегменту.", correct: true },
          { id: "eligible", label: "Пользователь с 4 заказами видит скидку", feedback: "Это позитивный сценарий, не негативный." },
          { id: "reload", label: "Перезагрузить страницу пять раз", feedback: "Это может быть полезно позже, но не проверяет бизнес-правило напрямую." },
        ],
      },
    ],
  },
  3: {
    title: "Проверка формы и UI-состояний",
    intro: "Протестируйте форму оплаты как пользователь, который может ошибиться, ждать и вернуться назад.",
    scene: {
      product: "Оплата заказа",
      pressure: "Трафик с мобильных: 64%",
      userReport: "«После оплаты не понимаю, ждать мне или нажимать ещё раз»",
      winCondition: "Найти состояния, которые мешают пользователю завершить оплату.",
    },
    artifact: ["UI чеклист", "Состояния ошибки и загрузки", "Адаптивная проверка"],
    rule: "UI-тестирование - это не пиксели ради пикселей. Это проверка понятности, доступности и устойчивости сценария.",
    steps: [
      {
        id: "state",
        title: "1. Состояние формы",
        prompt: "Пользователь нажал «Оплатить», запрос идёт 4 секунды. Что должно быть в проверке?",
        choices: [
          { id: "nothing", label: "Ничего, главное чтобы платёж прошёл", feedback: "Без loading-state пользователь может нажать повторно или решить, что всё зависло." },
          { id: "loading", label: "Loading-state и защита от повторного клика", feedback: "Верно. Это снижает риск дублей и потери доверия.", correct: true },
          { id: "animation", label: "Только красивая анимация", feedback: "Анимация вторична. Важнее понятное состояние и блокировка опасного действия." },
        ],
      },
      {
        id: "error",
        title: "2. Ошибка",
        prompt: "Карта отклонена банком. Какой результат лучше?",
        choices: [
          { id: "silent", label: "Оставить пользователя на форме без сообщения", feedback: "Это тупик: пользователь не понимает, что произошло." },
          { id: "clear-message", label: "Показать понятную ошибку и разрешить повторить", feedback: "Да. Ошибка должна объяснять следующий шаг.", correct: true },
          { id: "logout", label: "Разлогинить пользователя", feedback: "Это разрушает сценарий и не помогает решить проблему оплаты." },
        ],
      },
      {
        id: "responsive",
        title: "3. Мобильная проверка",
        prompt: "Что обязательно проверить на мобильном экране?",
        choices: [
          { id: "tap-targets", label: "Поля, клавиатуру, видимость CTA и tap targets", feedback: "Верно. На мобильном часто ломается не логика, а возможность завершить действие.", correct: true },
          { id: "desktop-only", label: "Только desktop, потому что там удобнее", feedback: "Если пользователи приходят с телефона, desktop-проверка недостаточна." },
          { id: "screenshot", label: "Только сделать скриншот главного экрана", feedback: "Скриншот не заменяет прохождение сценария." },
        ],
      },
    ],
  },
  4: {
    title: "API-проверка профиля",
    intro: "Проверьте endpoint профиля и решите, какие ответы говорят о стабильном контракте.",
    scene: {
      product: "GET /profile",
      pressure: "Фронтенд уже зависит от контракта",
      userReport: "«Иногда профиль открывается пустым, но ошибок нет»",
      winCondition: "Отделить успешный HTTP-ответ от реально корректного API-контракта.",
    },
    artifact: ["Набор API-кейсов", "Ожидаемые статусы", "Короткий вывод по рискам"],
    rule: "API-тест без ожиданий - это просто запрос. QA заранее фиксирует статус, тело ответа и негативные условия.",
    steps: [
      {
        id: "status",
        title: "1. Успешный ответ",
        prompt: "GET /profile для авторизованного пользователя вернул 200. Что проверять кроме статуса?",
        choices: [
          { id: "body", label: "Структуру JSON и обязательные поля", feedback: "Да. 200 сам по себе не доказывает, что контракт корректный.", correct: true },
          { id: "nothing", label: "Ничего, 200 достаточно", feedback: "Недостаточно: тело может быть пустым или с неверными полями." },
          { id: "color", label: "Цвет кнопки в UI", feedback: "Это не уровень API-проверки." },
        ],
      },
      {
        id: "unauthorized",
        title: "2. Неавторизованный запрос",
        prompt: "Что должен вернуть endpoint без токена?",
        choices: [
          { id: "200", label: "200 и пустой профиль", feedback: "Так можно случайно скрыть проблему доступа." },
          { id: "401", label: "401 Unauthorized", feedback: "Верно. Это явный и проверяемый ответ для отсутствующей авторизации.", correct: true },
          { id: "500", label: "500 Internal Server Error", feedback: "500 означает поломку сервера, а не корректную обработку доступа." },
        ],
      },
      {
        id: "contract",
        title: "3. Контракт",
        prompt: "Поле email внезапно стало null. Почему это важно?",
        choices: [
          { id: "not-important", label: "Не важно, UI сам разберётся", feedback: "UI может сломаться или показать неверные данные." },
          { id: "breaking", label: "Это нарушение ожидаемого контракта", feedback: "Верно. Контракт API должен быть стабильным для клиентов.", correct: true },
          { id: "ignore", label: "Игнорировать, если статус 200", feedback: "Статус 200 не отменяет ошибок в данных." },
        ],
      },
    ],
  },
  5: {
    title: "Release readiness",
    intro: "Перед релизом выберите минимальный набор проверок и сформулируйте рекомендацию команде.",
    scene: {
      product: "Релиз-кандидат",
      pressure: "Окно релиза закрывается через 30 минут",
      userReport: "«Нужно понять, можно ли выпускать версию сегодня»",
      winCondition: "Дать команде решение по релизу через факты, покрытие и открытые риски.",
    },
    artifact: ["Smoke checklist", "Открытые риски", "Release recommendation"],
    rule: "QA не говорит «релизить» или «не релизить» на эмоциях. Он показывает риск и качество покрытия.",
    steps: [
      {
        id: "smoke",
        title: "1. Smoke-набор",
        prompt: "До релиза осталось 30 минут. Что включить в smoke test?",
        choices: [
          { id: "all", label: "Все возможные проверки продукта", feedback: "Это уже regression, не smoke. Времени не хватит." },
          { id: "critical", label: "Критические пользовательские пути", feedback: "Да. Smoke должен быстро подтвердить, что ядро продукта живо.", correct: true },
          { id: "random", label: "Любые три экрана", feedback: "Случайность не защищает ключевые риски." },
        ],
      },
      {
        id: "open-bug",
        title: "2. Открытый дефект",
        prompt: "Остался баг: в Safari съезжает второстепенный блок. Что важно указать в рекомендации?",
        choices: [
          { id: "risk", label: "Impact, affected users и workaround", feedback: "Верно. Решение о релизе требует контекста риска.", correct: true },
          { id: "hide", label: "Не упоминать, чтобы не задерживать релиз", feedback: "Скрытый риск вернётся проблемой для пользователей и команды." },
          { id: "panic", label: "Автоматически блокировать релиз", feedback: "Не каждый UI-дефект блокер. Нужна оценка impact." },
        ],
      },
      {
        id: "recommendation",
        title: "3. Формулировка",
        prompt: "Какая рекомендация звучит профессионально?",
        choices: [
          { id: "good", label: "Можно релизить при принятом риске Safari-дефекта, core flows прошли smoke", feedback: "Да. Есть покрытие, условие и прозрачный риск.", correct: true },
          { id: "vague", label: "Вроде всё нормально", feedback: "Слишком расплывчато. Нужны факты." },
          { id: "emotion", label: "Мне страшно релизить", feedback: "Чувство риска полезно, но команде нужна проверяемая аргументация." },
        ],
      },
    ],
  },
};

function scenarioForModule(order: number) {
  return SCENARIOS[order] ?? SCENARIOS[1];
}

export function QaScenarioLab({ moduleTitle, moduleOrder, quizHref }: QaScenarioLabProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const scenario = scenarioForModule(moduleOrder);

  const score = useMemo(() => {
    return scenario.steps.reduce((total, step) => {
      const selected = step.choices.find((choice) => choice.id === answers[step.id]);
      return total + (selected?.correct ? 1 : 0);
    }, 0);
  }, [answers, scenario.steps]);

  const completed = Object.keys(answers).length === scenario.steps.length;
  const confidence = Math.round((score / scenario.steps.length) * 100);
  const selectedChoices = scenario.steps
    .map((step) => {
      const selected = step.choices.find((choice) => choice.id === answers[step.id]);
      return selected ? { step, selected } : null;
    })
    .filter(Boolean) as Array<{ step: ScenarioStep; selected: ScenarioChoice }>;
  const currentStep = scenario.steps.find((step) => !answers[step.id]) ?? scenario.steps[scenario.steps.length - 1];
  const qualityGate =
    !completed ? "Соберите решения по всем этапам" :
    confidence >= 80 ? "Готово к передаче команде" :
    "Нужно пересмотреть рискованные решения";

  return (
    <section id="scenario-lab" className="surface-elevated overflow-hidden border border-emerald-500/25 bg-card/60 backdrop-blur-md">
      <div className="border-b border-border/60 bg-background/25 p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                <Radio className="h-4 w-4" />
                QA смена
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
                <Timer className="h-4 w-4" />
                {scenario.scene.pressure}
              </span>
            </div>

            <div className="max-w-3xl">
              <p className="text-sm font-medium text-emerald-300">{moduleTitle}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{scenario.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {scenario.intro}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Объект
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{scenario.scene.product}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 md:col-span-2">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  Сигнал от пользователя
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{scenario.scene.userReport}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/55 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Gauge className="h-4 w-4" />
                  Quality gate
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">{qualityGate}</p>
              </div>
              <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                {confidence}%
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/40">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500" style={{ width: `${confidence}%` }} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {scenario.scene.winCondition}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4 p-5 sm:p-6">
          <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Текущий фокус</p>
            <p className="mt-2 text-base font-semibold text-foreground">{currentStep.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{currentStep.prompt}</p>
          </div>

          <div className="grid gap-4">
            {scenario.steps.map((step, stepIndex) => {
              const selectedId = answers[step.id];
              const selected = step.choices.find((choice) => choice.id === selectedId);

              return (
                <article key={step.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card/45">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 bg-background/25 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Этап {stepIndex + 1}</p>
                      <h3 className="mt-1 text-base font-semibold text-foreground">{step.title.replace(/^\d+\.\s*/, "")}</h3>
                    </div>
                    {selected ? (
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                        selected.correct ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300" : "border-amber-500/35 bg-amber-500/10 text-amber-300",
                      )}>
                        {selected.correct ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                        {selected.correct ? "надёжно" : "риск"}
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-2 p-4">
                    {step.choices.map((choice) => {
                      const isSelected = selectedId === choice.id;

                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => setAnswers((current) => ({ ...current, [step.id]: choice.id }))}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                            isSelected && choice.correct && "border-emerald-500/45 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/20",
                            isSelected && !choice.correct && "border-amber-500/45 bg-amber-500/10 text-foreground ring-1 ring-amber-500/20",
                            !isSelected && "border-border/60 bg-card/50 text-muted-foreground hover:border-emerald-500/35 hover:bg-card/70 hover:text-foreground",
                          )}
                        >
                          {choice.label}
                        </button>
                      );
                    })}
                  </div>

                  {selected ? (
                    <div className="border-t border-border/50 bg-background/20 px-4 py-3">
                      <p className="text-sm leading-relaxed text-muted-foreground">{selected.feedback}</p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <aside className="border-t border-border/60 bg-background/30 p-5 xl:border-l xl:border-t-0">
          <div className="sticky top-24 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Собранный отчёт</p>
              <p className="mt-2 text-4xl font-semibold text-foreground">{score}/{scenario.steps.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {completed ? "Смена завершена. Проверьте итоговый артефакт и закрепите результат." : "Решения будут собираться в отчёт по мере выбора."}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4" />
                Evidence log
              </p>
              <div className="mt-3 space-y-3">
                {selectedChoices.length > 0 ? selectedChoices.map(({ step, selected }) => (
                  <div key={step.id} className="rounded-xl border border-border/50 bg-background/30 p-3">
                    <p className="text-xs font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{selected.label}</p>
                  </div>
                )) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Выберите первое решение, чтобы начать собирать доказательства.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <ClipboardCheck className="h-4 w-4" />
                Артефакт
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {scenario.artifact.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/35 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldAlert className="h-4 w-4 text-amber-300" />
                Правило QA
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {scenario.rule}
              </p>
            </div>

            {quizHref ? (
              <Link href={quizHref} className="btn-primary inline-flex w-full items-center justify-center gap-2">
                Закрепить в квизе
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
