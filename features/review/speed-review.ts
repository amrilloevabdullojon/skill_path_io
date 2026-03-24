import { UserBookmark, UserNote } from "@/types/personalization";

export type ReviewCard = {
  id: string;
  title: string;
  type: "summary" | "mistake" | "question" | "bookmark";
  detail: string;
};

export function buildSpeedReviewCards(notes: UserNote[], bookmarks: UserBookmark[]): ReviewCard[] {
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
    detail: `Review source: ${bookmark.tag}`,
  }));

  const quickQuestions: ReviewCard[] = [
    {
      id: "qq-1",
      title: "Quick check",
      type: "question",
      detail: "What does HTTP 200 represent in API validation?",
    },
    {
      id: "qq-2",
      title: "Common mistake",
      type: "mistake",
      detail: "User story without measurable acceptance criteria.",
    },
  ];

  return [...noteCards, ...bookmarkCards, ...quickQuestions];
}
