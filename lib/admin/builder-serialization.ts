import { CourseStudioEntity, CourseTemplate, MediaAsset } from "@/types/builder/course-builder";

export type BuilderPersistedPayload = {
  courses: CourseStudioEntity[];
  templates: CourseTemplate[];
  mediaAssets: MediaAsset[];
};

export type BuilderPersistedSnapshot = {
  schemaVersion: number;
  savedAt: string;
  payload: BuilderPersistedPayload;
};

const BUILDER_SCHEMA_VERSION = 1;

export function createBuilderSnapshot(payload: BuilderPersistedPayload): BuilderPersistedSnapshot {
  return {
    schemaVersion: BUILDER_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    payload,
  };
}

export function serializeBuilderSnapshot(payload: BuilderPersistedPayload) {
  return JSON.stringify(createBuilderSnapshot(payload));
}

export function parseBuilderSnapshot(raw: string): BuilderPersistedSnapshot | null {
  try {
    const parsed = JSON.parse(raw) as Partial<BuilderPersistedSnapshot>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    if (typeof parsed.schemaVersion !== "number" || !parsed.payload) {
      return null;
    }
    if (
      !Array.isArray(parsed.payload.courses) ||
      !Array.isArray(parsed.payload.templates) ||
      !Array.isArray(parsed.payload.mediaAssets)
    ) {
      return null;
    }
    return {
      schemaVersion: parsed.schemaVersion,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
      payload: parsed.payload as BuilderPersistedPayload,
    };
  } catch {
    return null;
  }
}

