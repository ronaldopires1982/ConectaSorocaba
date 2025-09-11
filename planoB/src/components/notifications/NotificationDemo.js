// src/components/notifications/NotificationDemo.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { Colors, ButtonText } from "../../components/estilos";

// Import notification components
import InformativeNotification from "./InformativeNotification";
import ResolutionAcceptanceNotification from "./ResolutionAcceptanceNotification";
import SatisfactionSurveyNotification from "./SatisfactionSurveyNotification";
import NotificationManager from "./NotificationManager";

const { brand, primary, darkLight } = Colors;

const NotificationDemo = ({ navigation }) => {
  const [activeNotification, setActiveNotification] = useState(null);
  const [activeNotificationType, setActiveNotificationType] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Helper to create sample notifications
  const createSampleNotification = (type) => {
    const baseNotification = {
      date: new Date(),
      messageId: `demo-${type}-${Date.now()}`,
      request: {
        identifier: `demo-${type}-${Date.now()}`,
        content: {
          title: getNotificationTitle(type),
          body: getNotificationBody(type),
          data: {
            notificationType: type,
            protocolNumber: "2025/123456",
          },
        },
      },
    };

    // Add type-specific data
    switch (type) {
      case "resolution_acceptance":
        baseNotification.request.content.data.resolutionDetails =
          "O serviço foi realizado conforme solicitado. A equipe concluiu o reparo em 24/03/2025.";
        break;
      case "satisfaction_survey":
        baseNotification.request.content.data.surveyUrl =
          "https://example.com/survey";
        break;
      case "additional_info":
        baseNotification.request.content.data.requiredInfo =
          "Precisamos de mais detalhes sobre a localização exata do problema.";
        break;
    }

    return baseNotification;
  };

  // Helper to get appropriate titles
  const getNotificationTitle = (type) => {
    switch (type) {
      case "informative":
        return "Atualização de status";
      case "resolution_acceptance":
        return "Confirme a resolução";
      case "satisfaction_survey":
        return "Pesquisa de satisfação";
      case "additional_info":
        return "Informações adicionais necessárias";
      default:
        return "Notificação";
    }
  };

  // Helper to get appropriate body text
  const getNotificationBody = (type) => {
    switch (type) {
      case "informative":
        return "Sua solicitação recebeu uma atualização de status. Equipe responsável iniciou o atendimento.";
      case "resolution_acceptance":
        return "Sua solicitação foi marcada como resolvida. Por favor, confirme se está satisfeito com a resolução.";
      case "satisfaction_survey":
        return "Gostaríamos de saber sua opinião sobre o atendimento. Por favor, participe da nossa pesquisa de satisfação.";
      case "additional_info":
        return "Precisamos de mais informações para prosseguir com sua solicitação. Por favor, forneça os detalhes solicitados.";
      default:
        return "Você recebeu uma nova notificação.";
    }
  };

  // Show specific notification type
  const showNotification = (type) => {
    const notification = createSampleNotification(type);
    setActiveNotification(notification);
    setActiveNotificationType(type);
    setShowModal(true);
  };

  // Handle notification manager modal close
  const handleClose = () => {
    setShowModal(false);
    setActiveNotification(null);
    setActiveNotificationType(null);
  };

  // Sample handlers for resolution acceptance
  const handleAcceptResolution = async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  };

  const handleRejectResolution = async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  };

  // Render button for each notification type
  const renderNotificationButton = (type, icon, label) => (
    <TouchableOpacity
      style={styles.demoButton}
      onPress={() => showNotification(type)}
    >
      <Feather name={icon} size={24} color={brand} />
      <Text style={styles.demoButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerSection}>
          <Feather name="bell" size={30} color={brand} />
          <Text style={styles.headerTitle}>Demo de Notificações</Text>
        </View>

        <Text style={styles.sectionDescription}>
          Toque nos botões abaixo para visualizar cada tipo de notificação do
          sistema.
        </Text>

        <View style={styles.buttonsContainer}>
          {renderNotificationButton(
            "informative",
            "bell",
            "Notificação Informativa"
          )}
          {renderNotificationButton(
            "resolution_acceptance",
            "check-circle",
            "Confirmação de Resolução"
          )}
          {renderNotificationButton(
            "satisfaction_survey",
            "star",
            "Pesquisa de Satisfação"
          )}
          {renderNotificationButton(
            "additional_info",
            "help-circle",
            "Informações Adicionais"
          )}
        </View>

        {/* Instructions section */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Como usar:</Text>
          <Text style={styles.instructionsText}>
            • Cada botão demonstra um tipo diferente de notificação que o
            usuário pode receber
          </Text>
          <Text style={styles.instructionsText}>
            • A notificação "Informações Adicionais" levaria o usuário para uma
            tela separada
          </Text>
          <Text style={styles.instructionsText}>
            • As outras mostram um modal interativo com diferentes opções
          </Text>
        </View>

        {/* Technical section */}
        <View style={styles.technicalSection}>
          <Text style={styles.technicalTitle}>Informações Técnicas:</Text>
          <Text style={styles.technicalText}>
            O sistema de notificações utiliza o Expo Notifications e está
            configurado para receber notificações mesmo quando o aplicativo está
            em segundo plano.
          </Text>
        </View>
      </ScrollView>

      {/* Conditional rendering of the appropriate notification component */}
      {showModal && activeNotificationType === "informative" && (
        <InformativeNotification
          visible={showModal}
          onClose={handleClose}
          notification={activeNotification}
        />
      )}

      {showModal && activeNotificationType === "resolution_acceptance" && (
        <ResolutionAcceptanceNotification
          visible={showModal}
          onClose={handleClose}
          notification={activeNotification}
          onAccept={handleAcceptResolution}
          onReject={handleRejectResolution}
        />
      )}

      {showModal && activeNotificationType === "satisfaction_survey" && (
        <SatisfactionSurveyNotification
          visible={showModal}
          onClose={handleClose}
          notification={activeNotification}
        />
      )}

      {showModal && activeNotificationType === "additional_info" && (
        <NotificationManager
          visible={showModal}
          notification={activeNotification}
          onClose={handleClose}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: brand,
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
    color: darkLight,
  },
  buttonsContainer: {
    marginBottom: 30,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 15,
    color: "#333",
  },
  instructionsSection: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  instructionsText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#444",
    lineHeight: 20,
  },
  technicalSection: {
    backgroundColor: "#e8f4fc",
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  technicalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  technicalText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
});

export default NotificationDemo;
