import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { api } from "../api";

export function ForgotPasswordScreen({ onShowLogin }: { onShowLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await api.auth.requestPasswordReset({ email: email.trim() });
      setSent(true);
    } catch {
      setError("Could not send the reset email. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.brand}>Reset password</Text>

      {sent ? (
        <>
          <Text style={styles.note}>
            If an account exists for {email.trim()}, we sent a reset link. Check your email.
          </Text>
          <TouchableOpacity onPress={onShowLogin} hitSlop={8}>
            <Text style={styles.link}>Back to sign in</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Enter your email and we'll send a reset link.</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.button, (submitting || !email) && styles.buttonDisabled]}
            onPress={onSubmit}
            disabled={submitting || !email}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send reset link</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onShowLogin} hitSlop={8}>
            <Text style={styles.link}>Back to sign in</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e", justifyContent: "center", paddingHorizontal: 24 },
  brand: { color: "#fff", fontSize: 28, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#a5b4fc", fontSize: 15, textAlign: "center", marginTop: 6, marginBottom: 28 },
  note: { color: "#cbd5e1", fontSize: 15, textAlign: "center", marginTop: 16, lineHeight: 22 },
  input: {
    backgroundColor: "#1b1733",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { color: "#fca5a5", marginBottom: 12, textAlign: "center" },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { color: "#a5b4fc", fontSize: 14, textAlign: "center", marginTop: 20 },
});
