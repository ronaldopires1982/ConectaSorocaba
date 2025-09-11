import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors, ButtonText } from "../../components/estilos";

const { brand, primary, darkLight, customGreen, customRed } = Colors;

const ResolutionAcceptanceNotification = ({
  visible,
  onClose,
  notification,
  onAccept,
  onReject,
  onNotificationAcceptanceResponse,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Extrai título, corpo e dados da notificação
  const title =
    notification?.request?.content?.title || "Confirmação de Resolução";
  const body =
    notification?.request?.content?.body ||
    "Sua solicitação foi resolvida. Está satisfeito com a resolução?";
  const data = notification?.request?.content?.data || {};

  // Verifica se a notificação contém resposta de aceite
  const hasUserResponded = data.respAceite !== "";
  const userAccepted =
    data.respAceite === true ||
    data.respAceite === "1" ||
    data.respAceite === "true" ||
    data.respAceite === "Sim";

  const handleResponse = async (accepted) => {
    try {
      const userConfirmed = await new Promise((resolve) => {
        Alert.alert(
          "Confirmar Resposta",
          accepted
            ? "Você confirma que está satisfeito com a resolução da sua solicitação?"
            : "Você confirma que NÃO está satisfeito com a resolução? Sua solicitação será encaminhada para reavaliação.",
          [
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: accepted ? "Sim, estou satisfeito" : "Não estou satisfeito",
              style: accepted ? "default" : "destructive",
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (!userConfirmed) {
        return;
      }

      setSelectedOption(accepted ? "accept" : "reject");
      setIsSubmitting(true);

      // Call the appropriate callback
      let success;
      if (accepted) {
        success = await onAccept(notification);
      } else {
        success = await onReject(notification);
      }

      // Fecha o modal após o envio
      if (success) {
        const response = accepted ? "Sim" : "Não";
        const notificationId = notification.request.content.data.notificationId;

        // Atualiza o estado das variáveis de estado com a resposta da notificação usando a callback
        if (onNotificationAcceptanceResponse && notificationId) {
          onNotificationAcceptanceResponse(notificationId, response);
        }

        // Fecha o modal
        onClose();

        // Exibe feedback ao usuário
        Alert.alert(
          accepted ? "Resolução Aceita" : "Resolução Rejeitada",
          accepted
            ? "Obrigado pelo seu feedback. Sua solicitação foi concluída com sucesso."
            : "Obrigado pelo seu feedback. Iremos avaliar os próximos passos para sua solicitação."
        );
      } else {
        throw new Error("Falha ao processar resposta");
      }
    } catch (error) {
      console.error("Error submitting resolution response:", error);
      Alert.alert(
        "Erro",
        "Não foi possível processar sua resposta. Tente novamente."
      );
      setSelectedOption(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função auxiliar para exibir a mensagem de acordo com o que o usuário respondeu
  const getResponseMessage = () => {
    if (userAccepted) {
      return {
        icon: "check-circle",
        iconColor: customGreen,
        message:
          "Você confirmou que está satisfeito com a resolução de sua solicitação.",
        subtitle:
          "Sua solicitação foi concluída com sucesso. Obrigado pelo seu feedback!",
      };
    } else {
      return {
        icon: "x-circle",
        iconColor: customRed,
        message:
          "Você informou que não estava satisfeito com a resolução de sua solicitação.",
        subtitle:
          "Sua solicitação foi encaminhada à Ouvidoria para reavaliação. Obrigado pelo seu feedback!",
      };
    }
  };

  // Renderiza modal para notificações já respondidas
  const renderInformativeModal = () => {
    const responseInfo = getResponseMessage();

    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Header with icon and title */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Feather
                  name={responseInfo.icon}
                  size={24}
                  color={responseInfo.iconColor}
                />
                <Text style={styles.title}>Resposta Registrada</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Notification body */}
            <View style={styles.body}>
              <Text style={styles.bodyText}>{responseInfo.message}</Text>

              <Text style={styles.subtitleText}>{responseInfo.subtitle}</Text>

              {/* Display protocol information */}
              {data.protocolNumber && (
                <View style={styles.protocolContainer}>
                  <Text style={styles.protocolLabel}>Protocolo:</Text>
                  <Text style={styles.protocolValue}>
                    {data.protocolNumber}
                  </Text>
                </View>
              )}

              {/* Display resolution details if available */}
              {data.resolutionDetails && (
                <View style={styles.resolutionDetails}>
                  <Text style={styles.resolutionDetailsTitle}>
                    Detalhes da resolução:
                  </Text>
                  <Text style={styles.resolutionDetailsText}>
                    {data.resolutionDetails}
                  </Text>
                </View>
              )}

              {/* Display resolution date if available */}
              {data.resolutionDate && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Data da resolução:</Text>
                  <Text style={styles.dataValue}>{data.resolutionDate}</Text>
                </View>
              )}

              {/* Display response date if available */}
              {data.responseDate && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Data da resposta:</Text>
                  <Text style={styles.dataValue}>{data.responseDate}</Text>
                </View>
              )}
            </View>

            {/* Close button */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Feather name="check" size={20} color="white" />
                <ButtonText style={styles.buttonText}>Entendido</ButtonText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Renderiza modal de aceite de resolução com opções de resposta
  const renderInteractiveModal = () => {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Header with icon and title */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Feather name="check-circle" size={24} color={brand} />
                <Text style={styles.title}>{title}</Text>
              </View>
              <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                <Feather
                  name="x"
                  size={24}
                  color={isSubmitting ? darkLight : "black"}
                />
              </TouchableOpacity>
            </View>

            {/* Notification body */}
            <View style={styles.body}>
              <Text style={styles.bodyText}>{body}</Text>

              {/* Display protocol information */}
              {data.protocolNumber && (
                <View style={styles.protocolContainer}>
                  <Text style={styles.protocolLabel}>Protocolo:</Text>
                  <Text style={styles.protocolValue}>
                    {data.protocolNumber}
                  </Text>
                </View>
              )}

              {/* Display any additional information about the resolution */}
              {data.resolutionDetails && (
                <View style={styles.resolutionDetails}>
                  <Text style={styles.resolutionDetailsTitle}>
                    Detalhes da resolução:
                  </Text>
                  <Text style={styles.resolutionDetailsText}>
                    {data.resolutionDetails}
                  </Text>
                </View>
              )}

              {/* Display resolution date if available */}
              {data.resolutionDate && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Data da resolução:</Text>
                  <Text style={styles.dataValue}>{data.resolutionDate}</Text>
                </View>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.acceptButton,
                  isSubmitting && styles.disabledButton,
                  selectedOption === "accept" && styles.selectedButton,
                ]}
                onPress={() => handleResponse(true)}
                disabled={isSubmitting}
              >
                {isSubmitting && selectedOption === "accept" ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Feather name="check" size={20} color="white" />
                    <ButtonText style={styles.buttonText}>
                      Sim, estou satisfeito
                    </ButtonText>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rejectButton,
                  isSubmitting && styles.disabledButton,
                  selectedOption === "reject" && styles.selectedButton,
                ]}
                onPress={() => handleResponse(false)}
                disabled={isSubmitting}
              >
                {isSubmitting && selectedOption === "reject" ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Feather name="x" size={20} color="white" />
                    <ButtonText style={styles.buttonText}>
                      Não, ainda há pendências
                    </ButtonText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (hasUserResponded) {
    return renderInformativeModal();
  } else {
    return renderInteractiveModal();
  }
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
    backgroundColor: primary,
    borderRadius: 10,
    width: "90%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: brand,
    marginLeft: 10,
  },
  body: {
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
  },
  subtitleText: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
    color: darkLight,
    fontStyle: "italic",
  },
  protocolContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  protocolLabel: {
    fontWeight: "bold",
    marginRight: 5,
  },
  protocolValue: {
    fontWeight: "500",
  },
  resolutionDetails: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  resolutionDetailsTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  resolutionDetailsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  dataRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 5,
  },
  dataValue: {
    fontSize: 14,
  },
  buttonsContainer: {
    marginTop: 10,
    gap: 10,
  },
  acceptButton: {
    backgroundColor: customGreen,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  rejectButton: {
    backgroundColor: customRed,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  closeButton: {
    backgroundColor: brand,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: "#333",
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default ResolutionAcceptanceNotification;
