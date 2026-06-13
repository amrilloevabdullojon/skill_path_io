import { useLocalSearchParams } from "expo-router";

import { TrackDetailScreen } from "~/screens/TrackDetailScreen";

export default function TrackDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <TrackDetailScreen slug={String(slug)} />;
}
