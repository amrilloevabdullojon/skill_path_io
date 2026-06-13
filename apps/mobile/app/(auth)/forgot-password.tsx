import { useRouter } from "expo-router";

import { ForgotPasswordScreen } from "~/screens/ForgotPasswordScreen";

export default function ForgotPasswordRoute() {
  const router = useRouter();
  return <ForgotPasswordScreen onShowLogin={() => router.push("/login")} />;
}
