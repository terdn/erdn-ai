import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import {
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

export default function AnalysisScreen() {
  const params = useLocalSearchParams();
  const viewShotRef = useRef<any>(null);

  if (!params.analysis) {
    return (
      <View style={styles.center}>
        <Text>No analysis available</Text>
      </View>
    );
  }

  const analysis = JSON.parse(params.analysis as string);

  const handleFinish = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Gallery access is needed.");
        return;
      }
  
      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
  
      // küçük gecikme Android için
      setTimeout(() => {
        BackHandler.exitApp();
      }, 400);
  
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not save analysis.");
    }
  };
  

  return (
    <View style={{ flex: 1 }}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "jpg", quality: 0.95 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>ERDN ANALYSIS</Text>

          <Section title="SKIN PROFILE">
            <Line label="Type" value={analysis.skinProfile?.type} />
            <Line label="Undertone" value={analysis.skinProfile?.undertone} />
            <Line label="Concern" value={analysis.skinProfile?.concern} />
          </Section>

          <Section title="RECOMMENDED PRODUCTS">
            {analysis.recommendedProducts?.map((p: string, i: number) => (
              <Text key={i} style={styles.text}>
                {i + 1}. {p}
              </Text>
            ))}
          </Section>

          <Section title="ROUTINE">
            <Text style={styles.sub}>Day</Text>
            {analysis.routine?.day?.map((s: string, i: number) => (
              <Text key={i} style={styles.text}>
                {i + 1}. {s}
              </Text>
            ))}

            <Text style={styles.sub}>Night</Text>
            {analysis.routine?.night?.map((s: string, i: number) => (
              <Text key={i} style={styles.text}>
                {i + 1}. {s}
              </Text>
            ))}
          </Section>

          <Text style={styles.disclaimer}>
            This is not medical advice. Photos are deleted after analysis.
          </Text>
        </ScrollView>
      </ViewShot>

      {/* SABİT ALT BUTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>FINISH</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  if (!value) return null;
  return (
    <Text style={styles.text}>
      <Text style={styles.bold}>{label}: </Text>
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 140,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  sub: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  bold: {
    fontWeight: "700",
  },
  disclaimer: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  button: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
