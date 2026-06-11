import { useLocalSearchParams } from "expo-router";

import { QuizScreen } from "~/screens/QuizScreen";

export default function QuizRoute() {
  const { slug, moduleId } = useLocalSearchParams<{ slug: string; moduleId: string }>();
  return <QuizScreen slug={String(slug)} moduleId={String(moduleId)} />;
}
