import { NextResponse } from "next/server";

import { resolveRuntimeCatalog } from "@/lib/learning/content-resolver";

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Default true; pass ?includeCourseEntities=0 to exclude studio courses
  const rawCourseEntities = url.searchParams.get("includeCourseEntities");
  const includeCourseEntities = rawCourseEntities === null || rawCourseEntities !== "0";
  const includeDraftCourses = url.searchParams.get("includeDraftCourses") === "1";

  const catalog = await resolveRuntimeCatalog({
    // Include studio courses by default; pass ?includeCourseEntities=0 to disable
    includeCourseEntities: includeCourseEntities !== false,
    includeDraftCourses,
  });

  return NextResponse.json(catalog);
}
