import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Camera } from "expo-camera";
import * as VideoThumbnails from "expo-video-thumbnails";

import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ButtonText, Colors, StyledButton } from "../../../components/estilos";
import { ModalLoading, ModalSucesso } from "../../../components/Modal";
import { registrarSolicitacaoComAnexos } from "../../../model/AbrirSolicitacao";
import { prepareFilesForUpload } from "../../../utils/FileUtils";

const { brand, primary, darkLight } = Colors;

const MAX_PHOTOS = 3;
const MAX_DOCUMENTS = 3;
const MAX_PHOTO_SIZE = 1 * 1024 * 1024; // 1MB in bytes
const MAX_DOC_SIZE = 3 * 1024 * 1024; // 3MB in bytes

export const AnexarArquivos = ({
  route,
  navigation,
  isEmbedded = false,
  onComplete,
  initialFiles = [],
}) => {
  const [files, setFiles] = useState(initialFiles);
  const [isLoading, setIsLoading] = useState(false);
  const [showModalSucesso, setShowModalSucesso] = useState(false);
  const [modalLoadingVisible, setModalLoadingVisible] = useState(false);

  // Get solicitation data from route if available
  const solicitacaoData = route?.params?.solicitacaoData || {};

  const checkPermissions = async () => {
    const { status: cameraStatus } =
      await Camera.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissões necessárias",
        "Precisamos de acesso à câmera e galeria para esta funcionalidade"
      );
      return false;
    }
    return true;
  };

  const countFilesByType = (type) => {
    return files.filter((file) =>
      type === "media"
        ? file.type === "image" || file.type === "video"
        : file.type === type
    ).length;
  };

  const handleTakePhoto = async () => {
    const currentMediaCount = countFilesByType("media");

    if (currentMediaCount >= MAX_PHOTOS) {
      Alert.alert(
        "Limite atingido",
        `Você já atingiu o limite máximo de ${MAX_PHOTOS} fotos/vídeos.`
      );
      return;
    }

    if (!(await checkPermissions())) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      if (file.fileSize > MAX_PHOTO_SIZE) {
        Alert.alert(
          "Arquivo muito grande",
          `O tamanho máximo permitido é ${MAX_PHOTO_SIZE / 1024 / 1024}MB`
        );
        return;
      }
      setFiles([...files, { uri: file.uri, type: "image", name: "photo.jpg" }]);
    }
  };

  const handleSelectFromGallery = async () => {
    const currentMediaCount = countFilesByType("media");

    if (currentMediaCount >= MAX_PHOTOS) {
      Alert.alert(
        "Limite atingido",
        `Você já atingiu o limite máximo de ${MAX_PHOTOS} fotos/vídeos.`
      );
      return;
    }

    if (!(await checkPermissions())) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      allowsEditing: true,
      videoMaxDuration: 30,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      if (file.fileSize > MAX_PHOTO_SIZE) {
        Alert.alert(
          "Arquivo muito grande",
          `O tamanho máximo permitido é ${MAX_PHOTO_SIZE / 1024 / 1024}MB`
        );
        return;
      }

      if (file.type === "video") {
        try {
          const thumbnail = await VideoThumbnails.getThumbnailAsync(file.uri);
          setFiles([
            ...files,
            {
              uri: file.uri,
              type: "video",
              thumbnail: thumbnail.uri,
              name: "video_gallery.mp4",
            },
          ]);
        } catch (e) {
          console.warn(e);
          Alert.alert("Erro", "Não foi possível processar o vídeo");
        }
      } else {
        setFiles([
          ...files,
          {
            uri: file.uri,
            type: "image",
            name: file.fileName || "gallery_image.jpg",
          },
        ]);
      }
    }
  };

  const handleSelectDocument = async () => {
    const currentDocCount = countFilesByType("document");

    if (currentDocCount >= MAX_DOCUMENTS) {
      Alert.alert(
        "Limite atingido",
        `Você já atingiu o limite máximo de ${MAX_DOCUMENTS} documentos.`
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.size > MAX_DOC_SIZE) {
          Alert.alert(
            "Arquivo muito grande",
            `O tamanho máximo permitido é ${MAX_DOC_SIZE / 1024 / 1024}MB`
          );
          return;
        }
        setFiles([
          ...files,
          {
            uri: file.uri,
            type: "document",
            name: file.name,
          },
        ]);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Erro", "Não foi possível selecionar o documento");
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async () => {
    setModalLoadingVisible(true);
    setIsLoading(true);

    try {
      if (isEmbedded && onComplete) {
        // When embedded, call the onComplete callback with files
        onComplete(files);
      } else {
        // Process and submit the solicitation with attachments
        if (!solicitacaoData || !solicitacaoData.id_municipe) {
          throw new Error("Dados de solicitação incompletos");
        }

        // Create a copy of the solicitation data
        const submitData = { ...solicitacaoData };

        // Somente prossegue com anexos se houver arquivos
        if (files.length > 0) {
          try {
            const preparedFiles = await prepareFilesForUpload(files);

            // adiciona os arquivos preparados ao objeto de solicitação
            submitData.anexos = preparedFiles;
          } catch (fileError) {
            console.error("Erro ao preparar arquivos:", fileError);
            Alert.alert(
              "Erro nos anexos.",
              "Não foi possível processar um ou mais anexos. Verifique os arquivos e tente novamente."
            );
            return;
          }
        }

        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000)
          );

          const fetchPromise = registrarSolicitacaoComAnexos(submitData);

          const result = await Promise.race([fetchPromise, timeoutPromise]);

          if (result && result.status === "success") {
            setShowModalSucesso(true);
          } else {
            throw new Error(
              result?.message || "Resposta inesperada do servidor."
            );
          }
        } catch (err) {
          // se for um erro de timout, assume que teve sucesso
          if (
            err.message === "Timeout" ||
            err.message.includes("540") ||
            err.message.includes("timeout")
          ) {
            console.log(
              "[AnexarArquivos.js] - Ocorreu timeout, assumindo sucesso..."
            );
            setShowModalSucesso(true);
          } else {
            throw err;
          }
        }
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível enviar a solicitação"
      );
    } finally {
      setModalLoadingVisible(false);
      setIsLoading(false);
    }
  };

  const renderFilePreview = (file, index) => {
    if (file.type === "image") {
      return (
        <Image
          source={{ uri: file.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      );
    } else if (file.type === "video") {
      return (
        <Image
          source={{ uri: file.thumbnail }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      );
    } else {
      return (
        <View style={styles.documentPreview}>
          <MaterialCommunityIcons name="file-pdf-box" size={40} color={brand} />
          <Text style={styles.documentName} numberOfLines={1}>
            {file.name}
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {!isEmbedded && <StatusBar style="dark" />}
      <View
        style={{
          flex: 1,
          backgroundColor: primary,
          paddingTop: isEmbedded ? 0 : 10,
        }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.subtitle}>
            São permitidos até {MAX_PHOTOS + MAX_DOCUMENTS} anexos
            {!isEmbedded ? " na abertura da solicitação" : ""} ({MAX_PHOTOS}{" "}
            fotos/vídeos de até {MAX_PHOTO_SIZE / 1024 / 1024}MB cada e{" "}
            {MAX_DOCUMENTS} documentos PDF de até {MAX_DOC_SIZE / 1024 / 1024}MB
            cada).
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleTakePhoto}
            >
              <MaterialCommunityIcons name="camera" size={32} color={brand} />
              <Text style={styles.uploadButtonText}>Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleSelectFromGallery}
            >
              <MaterialCommunityIcons
                name="image-multiple"
                size={32}
                color={brand}
              />
              <Text style={styles.uploadButtonText}>Galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleSelectDocument}
            >
              <MaterialCommunityIcons
                name="file-document"
                size={32}
                color={brand}
              />
              <Text style={styles.uploadButtonText}>Documento</Text>
            </TouchableOpacity>
          </View>

          {files.length > 0 && (
            <View style={styles.previewContainer}>
              {files.map((file, index) => (
                <View key={index} style={styles.previewWrapper}>
                  {renderFilePreview(file, index)}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFile(index)}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <StyledButton
            onPress={handleSubmit}
            disabled={isLoading}
            style={{ height: 60, width: "90%" }}
          >
            <ButtonText>
              {isEmbedded
                ? files.length === 0
                  ? "Continuar sem anexos"
                  : "Confirmar anexos"
                : files.length === 0
                  ? "Finalizar sem anexos"
                  : "Finalizar"}
            </ButtonText>
          </StyledButton>
        </View>
      </View>

      <ModalSucesso
        isVisible={showModalSucesso}
        onClose={() => {
          setShowModalSucesso(false);
          navigation && navigation.navigate("Welcome");
        }}
        title="Solicitação enviada!"
        message1="Em alguns instantes você poderá acompanhar sua nova solicitação em Minhas Solicitações"
        buttonText="Ir para o início"
      />

      <ModalLoading isVisible={modalLoadingVisible} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 10,
  },
  subtitle: {
    fontSize: 16,
    color: darkLight,
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  uploadButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  uploadButtonText: {
    marginTop: 5,
    fontSize: 12,
    color: brand,
  },
  previewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 30,
    padding: 30,
  },
  previewWrapper: {
    position: "relative",
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  documentPreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  documentName: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 5,
  },
  removeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "red",
    borderRadius: 15,
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomButtonContainer: {
    padding: 20,
    gap: 20,
    alignItems: "center",
  },
});
