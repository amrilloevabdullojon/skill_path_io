import { useRouter } from "expo-router";

import { RegisterScreen } from "~/screens/RegisterScreen";

export default function RegisterRoute() {
  const router = useRouter();
  return <RegisterScreen onShowLogin={() => router.push("/login")} />;
}
