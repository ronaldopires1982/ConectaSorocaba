import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";

import {
  Colors,
  ButtonText,
  StyledButton,
  StyledButtonVoltar,
} from "../../components/estilos";
import MyTextInput from "../../components/MyTextInput";
import { ModalLoading } from "../../components/Modal";
import { submitAdditionalInfo } from "../../api/NotificationService";

// Importing the attachment handling logic
import { AnexarArquivos } from "../NovaSolicitacao/AnexarArquivos";

const { brand, primary, darkLight } = Colors;

const AdditionalInfoNotification = ({ route, navigation }) => {
  const [files, setFiles] = useState([]);
  const [showAttachmentPanel, setShowAttachmentPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalLoadingVisible, setModalLoadingVisible] = useState(false);

  // Obtém os dados da notificação a partir dos parâmetros da rota
  const notification = route.params?.notification || {};
  const notificationData = notification?.request?.content?.data || {};
  const onAdditionalInfoAlreadyAnswered =
    route.params?.onAdditionalInfoAlreadyAnswered;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      additionalInfo: "",
    },
  });

  const onSubmit = async (data) => {
    setModalLoadingVisible(true);
    setIsLoading(true);

    try {
      const notificationId = notificationData.notificationId;
      const additionalInfo = data.additionalInfo;

      // Valida se os dados necessários existem
      if (!notificationId) {
        throw new Error("ID da notificação não encontrado");
      }
      if (!additionalInfo?.trim()) {
        throw new Error("Informações adicionais são obrigatórias");
      }

      console.log(
        "[AdditionalInfoNotification.js] - Enviando informações adicionais:",
        {
          notificationId,
          additionalInfo: additionalInfo.length + " caracteres",
          filesCount: files.length,
        }
      );

      const result = await submitAdditionalInfo(
        notificationId,
        additionalInfo,
        files
      );

      if (result.success) {
        console.log(
          "[AdditionalInfoNotification.js] - Notificação respondida com sucesso:",
          result
        );

        // Atualiza a variável de estado com a resposta da notificação no objeto local através da função callback
        if (
          onAdditionalInfoAlreadyAnswered &&
          typeof onAdditionalInfoAlreadyAnswered === "function"
        ) {
          onAdditionalInfoAlreadyAnswered(notificationId, additionalInfo);
          console.log(
            "[AdditionalInfoNotification.js] - Local state updated via callback"
          );
        }

        Alert.alert(
          "Informação enviada",
          "Informações adicionais enviadas com sucesso.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Erro", result.error);
        throw new Error(
          "[AdditionalInfoNotification.js] - Falha ao responder notificação: " +
            result.error
        );
      }
    } catch (error) {
      throw new Error("Erro ao enviar informações adicionais.");
    } finally {
      setModalLoadingVisible(false);
      setIsLoading(false);
    }
  };

  const handleAttachmentComplete = (selectedFiles) => {
    setFiles(selectedFiles);
    setShowAttachmentPanel(false);
  };

  // Função auxiliar para validar dados da notificação
  const isValidNotificationData = () => {
    return notificationData.notificationId && notification?.request?.content;
  };

  // Exibe erro caso os dados da notificação sejam inválidos
  if (!isValidNotificationData()) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar style="dark" />
        <View style={styles.errorContent}>
          <Feather name="alert-triangle" size={48} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Dados inválidos</Text>
          <Text style={styles.errorMessage}>
            Não foi possível carregar os dados da notificação. Tente abrir a
            notificação novamente.
          </Text>
          <StyledButtonVoltar
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20, height: 50 }}
          >
            <ButtonText>Voltar</ButtonText>
          </StyledButtonVoltar>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Notification details header */}
        <View style={styles.notificationHeader}>
          <View style={styles.iconTitleContainer}>
            <Feather name="alert-circle" size={24} color={brand} />
            <Text style={styles.title}>
              {notification?.request?.content?.title ||
                "Informações Adicionais"}
            </Text>
          </View>

          <Text style={styles.subtitle}>
            {notification?.request?.content?.body ||
              "Por favor, forneça informações adicionais para esta solicitação."}
          </Text>

          {/* Display protocol number if available */}
          {notificationData.protocolNumber && (
            <View style={styles.protocolContainer}>
              <Text style={styles.protocolLabel}>Protocolo:</Text>
              <Text style={styles.protocolValue}>
                {notificationData.protocolNumber}
              </Text>
            </View>
          )}
        </View>

        {/* Additional information form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Informações Solicitadas:</Text>

          <Controller
            control={control}
            name="additionalInfo"
            rules={{
              required: "Este campo é obrigatório.",
              minLength: {
                value: 10,
                message: "Forneça uma descrição com pelo menos 10 caracteres.",
              },
              maxLength: {
                value: 2000,
                message: "A descrição não pode exceder 2000 caracteres.",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <MyTextInput
                label="Descrição detalhada:"
                icon="file-text"
                iconFamily="feather"
                placeholder="Forneça as informações solicitadas aqui"
                placeholderTextColor={darkLight}
                onChangeText={onChange}
                value={value}
                multiline={true}
                style={{ height: 150 }}
                iconContainerStyle={{ position: "relative", top: 50 }}
                border={!!errors.additionalInfo}
                borderColor={errors.additionalInfo ? "red" : "transparent"}
                autoCapitalize="sentences"
                disabled={isLoading}
                returnKeyType="default"
                blurOnSubmit={true}
              />
            )}
          />

          {errors.additionalInfo && (
            <Text style={styles.errorText}>
              {errors.additionalInfo.message}
            </Text>
          )}

          {/* Character counter */}
          <Controller
            control={control}
            name="additionalInfo"
            render={({ field: { value } }) => (
              <Text style={styles.characterCounter}>
                {value?.length || 0}/2000 caracteres
              </Text>
            )}
          />
        </View>

        {/* Attachments section - Commented out for now due to short deadline */}
        {/* 
        <View style={styles.attachmentsContainer}>
          <Text style={styles.sectionTitle}>Anexos:</Text>

          <View style={styles.attachmentsList}>
            {files.length > 0 ? (
              files.map((file, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <Feather
                    name={file.type === "document" ? "file" : "image"}
                    size={18}
                    color={brand}
                  />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {file.name || `Arquivo ${index + 1}`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const updatedFiles = files.filter((_, i) => i !== index);
                      setFiles(updatedFiles);
                    }}
                    disabled={isLoading}
                    style={styles.removeAttachmentButton}
                  >
                    <Feather name="x" size={16} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noAttachmentsText}>
                Nenhum anexo adicionado
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.addAttachmentButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={() => setShowAttachmentPanel(true)}
            disabled={isLoading}
          >
            <Feather name="paperclip" size={18} color="white" />
            <Text style={styles.addAttachmentText}>Adicionar Anexos</Text>
          </TouchableOpacity>
        </View>
        */}

        {/* Action buttons */}
        <View style={styles.buttonsContainer}>
          <StyledButton
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={[{ height: 60 }, isLoading && styles.disabledButton]}
          >
            <ButtonText>
              {isLoading ? "Enviando..." : "Enviar Informações"}
            </ButtonText>
          </StyledButton>

          <StyledButtonVoltar
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            style={[
              { marginTop: 10, height: 60 },
              isLoading && styles.disabledButton,
            ]}
          >
            <ButtonText>Cancelar</ButtonText>
          </StyledButtonVoltar>
        </View>
      </ScrollView>

      {/* Loading Modal */}
      <Modal
        visible={modalLoadingVisible}
        animationType="fade"
        transparent={true}
      >
        <ModalLoading />
      </Modal>

      {/* Attachment Panel Modal - Commented out for now */}
      {/* 
      {showAttachmentPanel && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={() => setShowAttachmentPanel(false)}
        >
          <View style={styles.attachmentModalContainer}>
            <View style={styles.attachmentModalHeader}>
              <Text style={styles.attachmentModalTitle}>Adicionar Anexos</Text>
              <TouchableOpacity onPress={() => setShowAttachmentPanel(false)}>
                <Feather name="x" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <AnexarArquivos
              isEmbedded={true}
              onComplete={handleAttachmentComplete}
              initialFiles={files}
            />
          </View>
        </Modal>
      )}
      */}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContent: {
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginTop: 20,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
  },
  notificationHeader: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  iconTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: brand,
    marginLeft: 10,
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
  },
  protocolContainer: {
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    padding: 10,
    borderRadius: 5,
  },
  protocolLabel: {
    fontWeight: "bold",
    marginRight: 5,
  },
  protocolValue: {
    fontWeight: "500",
  },
  formContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: brand,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
  },
  characterCounter: {
    fontSize: 12,
    color: darkLight,
    textAlign: "right",
    marginTop: 5,
    marginRight: 10,
  },
  attachmentsContainer: {
    marginBottom: 30,
  },
  attachmentsList: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    minHeight: 60,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8e8e8",
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  attachmentName: {
    marginLeft: 10,
    flex: 1,
  },
  removeAttachmentButton: {
    padding: 5,
    marginLeft: 10,
  },
  noAttachmentsText: {
    color: darkLight,
    fontStyle: "italic",
    textAlign: "center",
    padding: 10,
  },
  addAttachmentButton: {
    backgroundColor: brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 5,
  },
  addAttachmentText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonsContainer: {
    marginTop: 20,
  },
  attachmentModalContainer: {
    flex: 1,
    backgroundColor: primary,
  },
  attachmentModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  attachmentModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AdditionalInfoNotification;
