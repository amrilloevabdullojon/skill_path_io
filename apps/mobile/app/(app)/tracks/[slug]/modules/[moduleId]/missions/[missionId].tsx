import { useLocalSearchParams } from "expo-router";

import { MissionScreen } from "~/screens/MissionScreen";

export default function MissionRoute() {
  const { slug, moduleId, missionId } = useLocalSearchParams<{
    slug: string;
    moduleId: string;
    missionId: string;
  }>();
  return (
    <MissionScreen slug={String(slug)} moduleId={String(moduleId)} missionId={String(missionId)} />
  );
}
