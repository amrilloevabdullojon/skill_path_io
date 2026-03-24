export function isDemoModeEnabled() {
  const explicitServer = process.env.ENABLE_DEMO_MODE;
  if (explicitServer === "true") {
    return true;
  }
  if (explicitServer === "false") {
    return false;
  }

  const explicitClient = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE;
  if (explicitClient === "true") {
    return true;
  }
  if (explicitClient === "false") {
    return false;
  }

  return process.env.NODE_ENV !== "production";
}
