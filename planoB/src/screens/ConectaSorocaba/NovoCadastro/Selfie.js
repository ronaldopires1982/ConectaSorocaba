import React, { useState, useRef, useContext, useEffect } from "react";
import {
  Alert,
  Button,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SignUpContext } from "../../../hooks/SignUpContext";
import { SelfieManager } from "../../../utils/SelfieManager";
import { Colors } from "../../../components/estilos";

const { width, height } = Dimensions.get("window");
const { brand, primary, darkLight, tertiary, customGreen } = Colors;

// Constantes para definir formato do enquadramento oval
const FRAME_WIDTH = width * 0.7;
const FRAME_HEIGHT = FRAME_WIDTH * 1.2;
const FRAME_TOP = (height - FRAME_HEIGHT) / 2 - 50;

export default function SignUpSelfie({ navigation }) {
  const [facing, setFacing] = useState("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const { formData, updateFormData } = useContext(SignUpContext);

  const cameraRef = useRef(null);

  console.log("[Selfie] Permissão:", permission);

  useEffect(() => {
    // Solicita permissão de acesso à câmera ao montar o componente
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Aguarde, carregando...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar style="dark" />
        <View style={styles.permissionContent}>
          <Feather name="camera-off" size={64} color={darkLight} />
          <Text style={styles.permissionTitle}>
            Permissão de câmera necessária
          </Text>
          <Text style={styles.permissionMessage}>
            Para capturar sua selfie, precisamos de acesso à câmera do seu
            dispositivo.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Permitir acesso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const takePicture = async () => {
    if (isCapturing || !cameraRef.current) return;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      console.log("[Selfie] Foto tirada:", photo);

      if (photo && photo.uri) {
        console.log("[Selfie] Tirando foto...");
        // Grava a foto utilizando o SelfieManager.js
        const savedUri = await SelfieManager.saveSelfie(
          photo.uri,
          formData.cpf
        );

        if (savedUri) {
          updateFormData({ selfieUri: savedUri });

          // Navega para a próxima tela
          navigation.navigate("SignUpTerms");
        } else {
          Alert.alert(
            "Erro",
            "Não foi possível salvar a selfie. Tente novamente.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("Erro ao capturar selfie:", error);
      Alert.alert(
        "Erro",
        "Não foi possível capturar a selfie. Verifique se a câmera está funcionando e tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        ratio="16:9"
      />

      {/* Sobreposição com enquadramento oval */}
      <View style={styles.overlay}>
        {/* Área mais escura ao redor do oval */}
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlayLeft} />

          {/* Enquadramento oval */}
          <View style={styles.frameContainer}>
            <View style={styles.ovalFrame}>
              <View style={styles.ovalInner} />
            </View>
          </View>

          <View style={styles.overlayRight} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Instruções para a foto */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Posicione seu rosto dentro da área oval
        </Text>
        <Text style={styles.instructionsSubtext}>
          Posicione-se em local com boa iluminação e olhe diretamente para a
          câmera
        </Text>
      </View>

      {/* Botões de controle */}
      <View style={styles.controlsContainer}>
        {/* Botão para trocar de câmera */}
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <MaterialIcons name="flip-camera-ios" size={32} color={primary} />
        </TouchableOpacity>

        {/* Botão de captura */}
        <TouchableOpacity
          style={[
            styles.captureButton,
            isCapturing && styles.captureButtonDisabled,
          ]}
          onPress={takePicture}
          disabled={isCapturing}
          activeOpacity={0.8}
        >
          <View style={styles.captureButtonInner}>
            {isCapturing ? (
              <Feather name="loader" size={32} color={primary} />
            ) : (
              <Feather name="camera" size={32} color={primary} />
            )}
          </View>
        </TouchableOpacity>

        {/* Botão para voltar/cancelar */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activityOpacity={0.7}
        >
          <Feather name="x" size={32} color={primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: primary,
  },
  loadingText: {
    fontSize: 18,
    color: brand,
    marginTop: 10,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: primary,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: tertiary,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  permissionMessage: {
    fontSize: 16,
    color: darkLight,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: brand,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: primary,
    fontSize: 18,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlayMiddle: {
    height: FRAME_HEIGHT,
    flexDirection: "row",
  },
  overlayLeft: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  frameContainer: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  ovalFrame: {
    width: FRAME_WIDTH - 20,
    height: FRAME_HEIGHT - 20,
    borderRadius: FRAME_WIDTH / 2,
    borderWidth: 3,
    borderColor: primary,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  ovalInner: {
    width: "95%",
    height: "95%",
    borderRadius: FRAME_WIDTH / 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "transparent",
  },
  overlayRight: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  instructionsContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : RNStatusBar.currentHeight + 20 || 40,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 1,
  },
  instructionsText: {
    color: primary,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionsSubtext: {
    color: primary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    zIndex: 1,
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: customGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});
