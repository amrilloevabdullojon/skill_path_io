import { describe, expect, it } from "vitest";

import { buildModulePrimaryCta } from "@/lib/tracks/module-cta";

describe("module primary CTA", () => {
  it("points unfinished modules to the artifact workspace", () => {
    expect(buildModulePrimaryCta({ isCompleted: false, nextModuleHref: "/next" })).toMatchObject({
      href: "#module-phases",
      label: "Собрать артефакт",
    });
  });

  it("points completed modules to the next module when available", () => {
    expect(buildModulePrimaryCta({ isCompleted: true, nextModuleHref: "/next" })).toMatchObject({
      href: "/next",
      label: "Следующий",
    });
  });

  it("points completed final modules to recommendations", () => {
    expect(buildModulePrimaryCta({ isCompleted: true, nextModuleHref: null })).toMatchObject({
      href: "#recommendations",
      label: "Рекомендации",
    });
  });
});
