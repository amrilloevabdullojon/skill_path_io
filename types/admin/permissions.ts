export type AdminRole =
  | "SUPER_ADMIN"
  | "CONTENT_ADMIN"
  | "COURSE_EDITOR"
  | "REVIEWER"
  | "ANALYTICS_MANAGER";

export type AdminPermission =
  | "courses.read"
  | "courses.write"
  | "courses.publish"
  | "builder.write"
  | "templates.manage"
  | "media.manage"
  | "certificates.manage"
  | "users.manage"
  | "analytics.read"
  | "settings.manage";
