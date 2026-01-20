import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AnalysisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const analysis = params.analysis
    ? JSON.parse(params.analysis as string)
    : null;

  if (!analysis || !analysis.skinProfile) {
    return (
      <View style={styles.center}>
        <Text>No analysis available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ERDN ANALYSIS</Text>

      <Text style={styles.text}>
        <Text style={styles.bold}>Type: </Text>{analysis.skinProfile.type}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Undertone: </Text>{analysis.skinProfile.undertone}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Concern: </Text>{analysis.skinProfile.concern}
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => router.replace("/")}>
        <Text style={styles.buttonText}>FINISH</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  text: { fontSize: 14, marginBottom: 8 },
  bold: { fontWeight: "700" },
  button: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: "#fff", textAlign: "center" },
});
