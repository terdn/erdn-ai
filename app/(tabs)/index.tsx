import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ERDN Assistant</Text>

      <Text style={styles.subtitle}>
        Personalized skin analysis powered by AI
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/age")}
      >
        <Text style={styles.buttonText}>
          Continue · $2.99 / month
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Cancel anytime · No commitment
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 56,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  note: {
    marginTop: 14,
    fontSize: 12,
    color: "#777",
  },
});
