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

import { ApiError } from "@/lib/api/v1/client";

import { useAuth } from "../auth";

export function RegisterScreen({ onShowLogin }: { onShowLogin: () => void }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(err.message || "Could not create the account.");
      } else {
        setError("Could not create the account. Check the API URL and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.brand}>Create your account</Text>
      <Text style={styles.subtitle}>Start learning with Levio</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor="#6b7280"
        autoCapitalize="words"
      />
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
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password (min 8 characters)"
        placeholderTextColor="#6b7280"
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, (submitting || !name || !email || !password) && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={submitting || !name || !email || !password}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onShowLogin} hitSlop={8}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e", justifyContent: "center", paddingHorizontal: 24 },
  brand: { color: "#fff", fontSize: 28, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#a5b4fc", fontSize: 15, textAlign: "center", marginTop: 4, marginBottom: 28 },
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
