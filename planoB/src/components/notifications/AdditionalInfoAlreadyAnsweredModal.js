import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors, ButtonText } from "../../components/estilos";

const { brand, primary, darkLight, customGreen } = Colors;

/**
 * Modal informativo para notificações de informações adicionais já respondidas
 * @param {boolean} visible - Controla a visibilidade do modal
 * @param {Function} onClose - Função para fechar o modal
 * @param {Object} notification - Dados da notificação
 */
const AdditionalInfoAlreadyAnsweredModal = ({
  visible,
  onClose,
  notification,
}) => {
  // Extrai dados da notificação
  const notificationData = notification?.request?.content?.data || {};
  const title =
    notification?.request?.content?.title || "Informações Adicionais";
  const protocolNumber =
    notificationData.protocolNumber || notificationData.protocol || "N/A";

  // Dados sobre a resposta (se disponíveis)
  const responseDate =
    notificationData.responseDate || notificationData.dataResposta;
  const additionalInfoResponse =
    notificationData.respInfoAdicional ||
    notificationData.additionalInfoResponse;

  console.log(
    "[AdditionalInfoAlreadyAnsweredModal.js] - Dados da notificação: ",
    notificationData
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header with icon and close button */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Feather name="info" size={24} color={customGreen} />
              <Text style={styles.title}>Notificação já respondida</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={darkLight} />
            </TouchableOpacity>
          </View>

          {/* Main content */}
          <View style={styles.body}>
            <View style={styles.messageContainer}>
              <Feather name="check-circle" size={48} color={customGreen} />
              <Text style={styles.mainMessage}>
                Esta notificação de informações adicionais já foi respondida
                anteriormente.
              </Text>
            </View>

            {/* Protocol information */}
            {protocolNumber && protocolNumber !== "N/A" && (
              <View style={styles.protocolContainer}>
                <Text style={styles.protocolLabel}>Protocolo:</Text>
                <Text style={styles.protocolValue}>{protocolNumber}</Text>
              </View>
            )}

            {/* Original notification title/subject */}
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Assunto da notificação:</Text>
              <Text style={styles.infoValue}>
                {notificationData.parentTaskName}
              </Text>
            </View>

            {/* Response information if available */}
            {responseDate && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Data da resposta:</Text>
                <Text style={styles.infoValue}>
                  {new Date(responseDate).toLocaleDateString("pt-BR")}
                </Text>
              </View>
            )}

            {/* Preview of response if available */}
            {additionalInfoResponse && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Informações fornecidas:</Text>
                <Text style={styles.responsePreview} numberOfLines={3}>
                  {additionalInfoResponse.length > 100
                    ? `${additionalInfoResponse.substring(0, 100)}...`
                    : additionalInfoResponse}
                </Text>
              </View>
            )}

            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Se você precisar fornecer informações adicionais, entre em
                contato através dos canais de atendimento da prefeitura ou
                aguarde uma nova notificação caso seja necessário.
              </Text>
            </View>
          </View>

          {/* Action button */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
              <Feather name="check" size={20} color="white" />
              <ButtonText style={styles.buttonText}>Entendido</ButtonText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: brand,
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  body: {
    padding: 20,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  mainMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginTop: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  protocolContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  protocolLabel: {
    fontWeight: "bold",
    color: brand,
    marginRight: 8,
  },
  protocolValue: {
    fontWeight: "600",
    color: "#333",
    fontSize: 16,
  },
  infoSection: {
    marginBottom: 15,
  },
  infoLabel: {
    fontWeight: "bold",
    color: brand,
    marginBottom: 5,
    fontSize: 14,
  },
  infoValue: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },
  responsePreview: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: customGreen,
  },
  instructionContainer: {
    backgroundColor: "#e8f4f8",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  instructionText: {
    fontSize: 14,
    color: "#2c5282",
    lineHeight: 20,
    textAlign: "center",
  },
  buttonsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  confirmButton: {
    backgroundColor: customGreen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});

export default AdditionalInfoAlreadyAnsweredModal;
