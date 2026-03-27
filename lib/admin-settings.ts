import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "admin-settings.json");

export type AdminSettings = {
  siteName: string;
  siteDescription: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
  analyticsEnabled: boolean;
  defaultUserRole: "STUDENT" | "ADMIN";
  maxUploadSizeMb: number;
  supportEmail: string;
};

export const DEFAULT_SETTINGS: AdminSettings = {
  siteName: "SkillPath Academy",
  siteDescription: "Professional skills learning platform",
  allowRegistration: true,
  requireEmailVerification: false,
  maintenanceMode: false,
  analyticsEnabled: true,
  defaultUserRole: "STUDENT",
  maxUploadSizeMb: 10,
  supportEmail: "support@skillpath.io",
};

export function readAdminSettings(): AdminSettings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return DEFAULT_SETTINGS;
    const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeAdminSettings(settings: Partial<AdminSettings>): void {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const current = readAdminSettings();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ ...current, ...settings }, null, 2));
}
