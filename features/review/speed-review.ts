import { UserBookmark, UserNote } from "@/types/personalization";

export type ReviewCard = {
  id: string;
  title: string;
  type: "summary" | "mistake" | "question" | "bookmark";
  detail: string;
  answer?: string; // Optional answer for interactive checking
};

export function buildSpeedReviewCards(
  notes: UserNote[],
  bookmarks: UserBookmark[],
  mistakeCards: ReviewCard[] = [],
): ReviewCard[] {
  const noteCards: ReviewCard[] = notes.slice(0, 4).map((note) => ({
    id: `note-${note.id}`,
    title: note.title,
    type: "summary",
    detail: note.content,
  }));

  const bookmarkCards: ReviewCard[] = bookmarks.slice(0, 4).map((bookmark) => ({
    id: `bookmark-${bookmark.id}`,
    title: bookmark.title,
    type: "bookmark",
    detail: `Источник закладки: ${bookmark.tag}`,
  }));

  const quickQuestions: ReviewCard[] = [
    {
      id: "qq-1",
      title: "Быстрый вопрос (QA)",
      type: "question",
      detail: "Что означает HTTP статус код 401 Unauthorized?",
      answer: "Запрос не был выполнен, так как для него не предоставлены (или недействительны) данные аутентификации."
    },
    {
      id: "qq-2",
      title: "Частая ошибка (BA)",
      type: "mistake",
      detail: "Написание User Story без критериев приемки (Acceptance Criteria).",
      answer: "Критерии приемки обязательны — без них невозможно понять, выполнена ли задача и соответствует ли она ожиданиям бизнеса."
    },
    {
      id: "qq-3",
      title: "Быстрый вопрос (SQL)",
      type: "question",
      detail: "В чем фундаментальная разница между WHERE и HAVING?",
      answer: "WHERE фильтрует строки до группировки (до GROUP BY), а HAVING фильтрует уже сгруппированные данные."
    },
    {
      id: "qq-4",
      title: "Быстрый вопрос (QA)",
      type: "question",
      detail: "Что такое техника 'Классы эквивалентности'?",
      answer: "Это техника тест-дизайна, когда мы делим входные данные на группы (классы), где каждое значение группы приводит к одинаковому поведению системы."
    },
    {
      id: "qq-5",
      title: "Быстрый вопрос (BA)",
      type: "question",
      detail: "В чем разница между функциональными и нефункциональными требованиями?",
      answer: "Функциональные описывают ЧТО система должна делать (например, авторизация). Нефункциональные — КАК она это делает (скорость, безопасность, надежность)."
    },
    {
      id: "qq-6",
      title: "Быстрый вопрос (QA)",
      type: "question",
      detail: "Зачем нужно регрессионное тестирование?",
      answer: "Чтобы убедиться, что новые изменения в коде (фичи или багфиксы) не поломали старый, ранее работающий функционал."
    },
    {
      id: "qq-7",
      title: "Быстрый вопрос (API)",
      type: "question",
      detail: "Чем различаются методы PUT и PATCH в REST API?",
      answer: "PUT полностью заменяет ресурс по указанному URI, а PATCH применяет частичные изменения (обновляет только переданные поля)."
    },
    {
      id: "qq-8",
      title: "Быстрый вопрос (Scrum)",
      type: "question",
      detail: "Кто в Scrum отвечает за максимизацию ценности продукта?",
      answer: "Владелец продукта (Product Owner)."
    },
    {
      id: "qq-9",
      title: "Быстрый вопрос (SQL)",
      type: "question",
      detail: "Что вернет LEFT JOIN, если во второй таблице нет совпадений?",
      answer: "Он вернет все строки из первой/левой таблицы, а для столбцов из второй таблицы поставит значение NULL."
    },
    {
      id: "qq-10",
      title: "Частая ошибка (QA)",
      type: "mistake",
      detail: "Тестирование только позитивных сценариев ('Happy Path').",
      answer: "Большинство критических уязвимостей лежит в негативных и граничных сценариях. Важно проверять неожиданное поведение системы."
    },
    {
      id: "qq-11",
      title: "Частая ошибка (BA)",
      type: "mistake",
      detail: "Смешивание Бизнес-требований и Технического задания.",
      answer: "Бизнес-требования должны отражать потребность клиента ('хочу покупать в 1 клик'), а не техническую реализацию ('добавить кнопку с POST-запросом')."
    },
    {
      id: "qq-12",
      title: "Концепция (Общее)",
      type: "summary",
      detail: "Agile Manifesto: Люди и взаимодействия важнее процессов и инструментов.",
      answer: "- Процессы и инструменты важны, но без коммуникации внутри команды проект может застопориться."
    }
  ];

  return [...mistakeCards, ...quickQuestions, ...noteCards, ...bookmarkCards];
}
