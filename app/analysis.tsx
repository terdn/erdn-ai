import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AnalysisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  if (!params.analysis) {
    return (
      <View style={styles.center}>
        <Text>No analysis available</Text>
      </View>
    );
  }

  const analysis = JSON.parse(params.analysis as string);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ERDN ANALYSIS</Text>

      <Section title="SKIN PROFILE">
        <Line label="Type" value={analysis.skinProfile?.type} />
        <Line label="Undertone" value={analysis.skinProfile?.undertone} />
        <Line label="Concern" value={analysis.skinProfile?.concern} />
      </Section>

      <Section title="RECOMMENDED PRODUCTS">
        {analysis.recommendedProducts?.map((p: string, i: number) => (
          <Text key={i} style={styles.text}>{i + 1}. {p}</Text>
        ))}
      </Section>

      <Section title="ROUTINE">
        <Text style={styles.sub}>Day</Text>
        {analysis.routine?.day?.map((s: string, i: number) => (
          <Text key={i} style={styles.text}>{i + 1}. {s}</Text>
        ))}

        <Text style={styles.sub}>Night</Text>
        {analysis.routine?.night?.map((s: string, i: number) => (
          <Text key={i} style={styles.text}>{i + 1}. {s}</Text>
        ))}
      </Section>

      <TouchableOpacity style={styles.button} onPress={() => router.replace("/")}>
        <Text style={styles.buttonText}>FINISH</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Line({ label, value }: any) {
  return (
    <Text style={styles.text}>
      <Text style={styles.bold}>{label}: </Text>{value}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  sub: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  text: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  bold: { fontWeight: "700" },
  button: { backgroundColor: "#000", padding: 16, borderRadius: 8, marginTop: 20 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
