import { useRouter } from "expo-router";

/**
 * Compatibility shim over expo-router.
 *
 * Screens were written against a small hand-rolled navigator (`navigate(route)`
 * / `goBack()`). Rather than rewrite every screen, this maps those Route objects
 * onto expo-router hrefs so the screen components stay unchanged while routing,
 * deep links and the Android back button are handled by expo-router.
 */

export type Route =
  | { name: "Tracks" }
  | { name: "Profile" }
  | { name: "Bookmarks" }
  | { name: "Interview" }
  | { name: "Jobs" }
  | { name: "Subscription" }
  | { name: "WeeklyReport" }
  | { name: "TrackDetail"; slug: string; title?: string }
  | { name: "ModuleDetail"; slug: string; moduleId: string; title?: string }
  | { name: "Quiz"; slug: string; moduleId: string; title?: string }
  | { name: "Mission"; slug: string; moduleId: string; missionId: string; title?: string };

function routeToHref(route: Route): string {
  switch (route.name) {
    case "Profile":
      return "/profile";
    case "Bookmarks":
      return "/bookmarks";
    case "Interview":
      return "/interview";
    case "Jobs":
      return "/jobs";
    case "Subscription":
      return "/subscription";
    case "WeeklyReport":
      return "/weekly-report";
    case "TrackDetail":
      return `/tracks/${encodeURIComponent(route.slug)}`;
    case "ModuleDetail":
      return `/tracks/${encodeURIComponent(route.slug)}/modules/${encodeURIComponent(route.moduleId)}`;
    case "Quiz":
      return `/tracks/${encodeURIComponent(route.slug)}/modules/${encodeURIComponent(route.moduleId)}/quiz`;
    case "Mission":
      return `/tracks/${encodeURIComponent(route.slug)}/modules/${encodeURIComponent(route.moduleId)}/missions/${encodeURIComponent(route.missionId)}`;
    case "Tracks":
    default:
      return "/tracks";
  }
}

export function useNavigation() {
  const router = useRouter();
  return {
    navigate: (route: Route) => router.push(routeToHref(route) as never),
    goBack: () => {
      if (router.canGoBack()) router.back();
      else router.replace("/tracks" as never);
    },
  };
}
