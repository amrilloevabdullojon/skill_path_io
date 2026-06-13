export type ModulePrimaryCtaInput = {
  isCompleted: boolean;
  nextModuleHref: string | null;
};

export type ModulePrimaryCta = {
  href: string;
  label: string;
  description: string;
};

export function buildModulePrimaryCta(input: ModulePrimaryCtaInput): ModulePrimaryCta {
  if (input.isCompleted && input.nextModuleHref) {
    return {
      href: input.nextModuleHref,
      label: "Следующий",
      description: "Модуль закрыт. Можно перейти к следующей ветке.",
    };
  }

  if (input.isCompleted) {
    return {
      href: "#recommendations",
      label: "Рекомендации",
      description: "Модуль закрыт. Посмотрите, что укрепить дальше.",
    };
  }

  return {
    href: "#module-phases",
    label: "Собрать артефакт",
    description: "Сначала заполните артефакт и портфолио, затем закрывайте модуль.",
  };
}
