import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  saveOnboardingProfile,
  type Level,
  type OnboardingProfile,
  type Profession,
} from "../onboarding";

const PROFESSIONS: Array<{ value: Profession; label: string; blurb: string }> = [
  { value: "QA", label: "QA Engineer", blurb: "Testing, quality, automation" },
  { value: "BA", label: "Business Analyst", blurb: "Requirements, process, stakeholders" },
  { value: "DA", label: "Data Analyst", blurb: "SQL, dashboards, insights" },
];

const LEVELS: Array<{ value: Level; label: string }> = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const HOURS = [3, 5, 10, 15];

export function OnboardingScreen({ onComplete }: { onComplete: (profile: OnboardingProfile) => void }) {
  const [profession, setProfession] = useState<Profession | null>(null);
  const [level, setLevel] = useState<Level>("BEGINNER");
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  async function onContinue() {
    if (!profession) return;
    setSaving(true);
    const profile: OnboardingProfile = {
      profession,
      level,
      hoursPerWeek,
      createdAt: new Date().toISOString(),
    };
    try {
      await saveOnboardingProfile(profile);
      onComplete(profile);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.body}>
      <Text style={styles.brand}>Welcome to Levio</Text>
      <Text style={styles.subtitle}>Let's tailor your path.</Text>

      <Text style={styles.section}>I want to grow as a…</Text>
      {PROFESSIONS.map((item) => {
        const active = profession === item.value;
        return (
          <TouchableOpacity
            key={item.value}
            activeOpacity={0.85}
            onPress={() => setProfession(item.value)}
            style={[styles.card, active && styles.cardActive]}
          >
            <Text style={[styles.cardTitle, active && styles.textActive]}>{item.label}</Text>
            <Text style={[styles.cardBlurb, active && styles.textActiveDim]}>{item.blurb}</Text>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.section}>Current level</Text>
      <View style={styles.row}>
        {LEVELS.map((item) => {
          const active = level === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              activeOpacity={0.85}
              onPress={() => setLevel(item.value)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.pillText, active && styles.textActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.section}>Hours per week</Text>
      <View style={styles.row}>
        {HOURS.map((hours) => {
          const active = hoursPerWeek === hours;
          return (
            <TouchableOpacity
              key={hours}
              activeOpacity={0.85}
              onPress={() => setHoursPerWeek(hours)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.pillText, active && styles.textActive]}>{hours}h</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.button, (!profession || saving) && styles.buttonDisabled]}
        onPress={onContinue}
        disabled={!profession || saving}
      >
        <Text style={styles.buttonText}>{saving ? "Saving…" : "Continue"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0a1e" },
  body: { paddingHorizontal: 24, paddingTop: 72, paddingBottom: 48 },
  brand: { color: "#fff", fontSize: 32, fontWeight: "800" },
  subtitle: { color: "#a5b4fc", fontSize: 15, marginTop: 6 },
  section: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 28, marginBottom: 12 },
  card: {
    backgroundColor: "#1b1733",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1b1733",
    padding: 16,
    marginBottom: 10,
  },
  cardActive: { borderColor: "#6366f1", backgroundColor: "#241f44" },
  cardTitle: { color: "#e2e8f0", fontSize: 17, fontWeight: "700" },
  cardBlurb: { color: "#9ca3af", fontSize: 13, marginTop: 4 },
  textActive: { color: "#fff" },
  textActiveDim: { color: "#c7d2fe" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    borderWidth: 1,
    borderColor: "#312e62",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillActive: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  pillText: { color: "#cbd5e1", fontSize: 14, fontWeight: "600" },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 36,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
