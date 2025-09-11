// src/components/notifications/SatisfactionSurveyNotification.js
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors, ButtonText } from "../../components/estilos";

const { brand, primary, darkLight } = Colors;

const SatisfactionSurveyNotification = ({ visible, onClose, notification }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Obtém os dados da notificação
  const title =
    notification?.request?.content?.title || "Pesquisa de Satisfação";
  const body =
    notification?.request?.content?.body ||
    "Gostaríamos de saber sua opinião sobre o atendimento.";
  const data = notification?.request?.content?.data || {};

  // Link para abrir a pesquisa no browser
  const surveyUrl =
    "https://survey.sorocaba.sp.gov.br/index.php/118367?lang=pt-BR";

  const handleOpenSurvey = async () => {
    try {
      setIsLoading(true);

      // Verifica se o link pode ser aberto
      const canOpen = await Linking.canOpenURL(surveyUrl);

      if (canOpen) {
        await Linking.openURL(surveyUrl);
        // Fecha o modal após um timeout de 500ms
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível abrir o link da pesquisa. Por favor, tente novamente mais tarde."
        );
      }
    } catch (error) {
      console.error("Error opening survey URL:", error);
      Alert.alert(
        "Erro",
        "Não foi possível abrir o link da pesquisa. Por favor, tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    // Fecha o modal caso o usuário não queira responder à pesquisa
    onClose();
  };

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
              <Feather name="star" size={24} color={brand} />
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Feather
                name="x"
                size={24}
                color={isLoading ? darkLight : "black"}
              />
            </TouchableOpacity>
          </View>

          {/* Notification body */}
          <View style={styles.body}>
            <Text style={styles.bodyText}>{body}</Text>

            {/* Display protocol information if available */}
            {data.protocolNumber && (
              <View style={styles.protocolContainer}>
                <Text style={styles.protocolLabel}>Protocolo:</Text>
                <Text style={styles.protocolValue}>{data.protocolNumber}</Text>
              </View>
            )}

            {/* Additional survey information */}
            <View style={styles.surveyInfo}>
              <Feather
                name="info"
                size={18}
                color={brand}
                style={styles.infoIcon}
              />
              <Text style={styles.surveyInfoText}>
                A pesquisa é rápida e ajudará a melhorar nossos serviços.
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={handleOpenSurvey}
              disabled={isLoading}
            >
              <Feather name="external-link" size={18} color="white" />
              <ButtonText style={styles.buttonText}>
                {isLoading ? "Abrindo pesquisa..." : "Participar da pesquisa"}
              </ButtonText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDismiss}
              disabled={isLoading}
            >
              <ButtonText style={styles.secondaryButtonText}>
                Responder depois
              </ButtonText>
            </TouchableOpacity>
          </View>

          {/* Privacy note */}
          <Text style={styles.privacyNote}>
            Suas respostas são confidenciais e ajudarão a melhorar nosso
            atendimento.
          </Text>
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
  protocolContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  protocolLabel: {
    fontWeight: "bold",
    marginRight: 5,
  },
  protocolValue: {
    fontWeight: "500",
  },
  surveyInfo: {
    flexDirection: "row",
    backgroundColor: "#e8f4fc",
    padding: 12,
    borderRadius: 5,
    alignItems: "flex-start",
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  surveyInfoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonsContainer: {
    marginTop: 15,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: brand,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  secondaryButtonText: {
    color: brand,
    fontSize: 16,
  },
  privacyNote: {
    fontSize: 12,
    color: darkLight,
    textAlign: "center",
    marginTop: 15,
    fontStyle: "italic",
  },
});

export default SatisfactionSurveyNotification;
