import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
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

    setLoading(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (!photo.base64) throw new Error("No image data");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: photo.base64,
            age: age ?? "unknown",
          }),
        }
      );

      const analysis = await response.json();

      router.push({
        pathname: "/analysis",
        params: {
          analysis: JSON.stringify(analysis),
        },
      });
    } catch (err) {
      console.error("Camera analyze error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* CAMERA */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
        pointerEvents="none" // 🔥 BU SATIR KRİTİK
      />

      {/* OVERLAY */}
      <View style={styles.overlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.capture}
          onPress={takePicture}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View style={styles.inner} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    pointerEvents: "box-none",
  },
  capture: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#000",
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
