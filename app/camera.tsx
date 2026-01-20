import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CameraScreen() {
  const router = useRouter();
  const { age } = useLocalSearchParams<{ age?: string }>();

  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  if (!permission) return <View style={{ flex: 1, backgroundColor: "#000" }} />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera access is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || loading) return;

    if (!API_URL) {
      Alert.alert(
        "Configuration Error",
        "Backend URL is missing. Check EXPO_PUBLIC_API_URL."
      );
      return;
    }

    setLoading(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (!photo?.base64) {
        throw new Error("Image capture failed");
      }

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: photo.base64,
          age: age ?? null,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }

      const analysis = await response.json();

      router.push({
        pathname: "/analysis",
        params: {
          analysis: JSON.stringify(analysis),
        },
      });
    } catch (err: any) {
      console.error("Camera analyze error:", err);
      Alert.alert("Analysis Failed", err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="front"
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.capture}
          onPress={takePicture}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.inner} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  capture: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  text: {
    color: "#fff",
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
  },
});
