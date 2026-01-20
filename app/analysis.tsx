import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AnalysisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const analysis = params.analysis
    ? JSON.parse(params.analysis as string)
    : null;

  if (!analysis) {
    return (
      <View style={styles.center}>
        <Text>No analysis available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ERDN ANALYSIS</Text>

      <Section title="SKIN PROFILE">
        <Line label="Type" value={analysis.skinProfile.type} />
        <Line label="Undertone" value={analysis.skinProfile.undertone} />
        <Line label="Concern" value={analysis.skinProfile.concern} />
      </Section>

      <Section title="RECOMMENDED PRODUCTS">
        {analysis.recommendedProducts.map((item: string, i: number) => (
          <Text key={i} style={styles.text}>{i + 1}. {item}</Text>
        ))}
      </Section>

      <Section title="ROUTINE">
        <Text style={styles.subTitle}>Day</Text>
        {analysis.routine.day.map((step: string, i: number) => (
          <Text key={i} style={styles.text}>{i + 1}. {step}</Text>
        ))}

        <Text style={styles.subTitle}>Night</Text>
        {analysis.routine.night.map((step: string, i: number) => (
          <Text key={i} style={styles.text}>{i + 1}. {step}</Text>
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
  container: { backgroundColor: "#fff", padding: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  subTitle: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  text: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  bold: { fontWeight: "700" },
  button: { backgroundColor: "#000", padding: 16, borderRadius: 8 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
