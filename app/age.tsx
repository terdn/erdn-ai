import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AgeScreen() {
  const router = useRouter();
  const [age, setAge] = useState("");

  const handleContinue = () => {
    const numericAge = parseInt(age, 10);

    if (!numericAge || numericAge < 10 || numericAge > 100) {
      alert("Please enter a valid age.");
      return;
    }

    router.push({
      pathname: "/camera",
      params: { age: numericAge.toString() },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Age</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        This helps personalize your skin analysis.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 16,
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  note: {
    marginTop: 16,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});
