import { useLocalSearchParams } from "expo-router";

import { ModuleDetailScreen } from "~/screens/ModuleDetailScreen";

export default function ModuleDetailRoute() {
  const { slug, moduleId } = useLocalSearchParams<{ slug: string; moduleId: string }>();
  return <ModuleDetailScreen slug={String(slug)} moduleId={String(moduleId)} />;
}
