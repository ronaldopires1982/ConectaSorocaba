import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";

// Importa componentes de notificação específicos
import InformativeNotification from "./InformativeNotification";
import ResolutionAcceptanceNotification from "./ResolutionAcceptanceNotification";
import SatisfactionSurveyNotification from "./SatisfactionSurveyNotification";
import AdditionalInfoAlreadyAnsweredModal from "./AdditionalInfoAlreadyAnsweredModal";

// importa servicos de chamada de API
import { sendResolutionResponse } from "../../api/NotificationService";

/**
 * NotificationManager é o componente responsável por gerenciar e renderizar diferentes tipos de notificações
 * @param {Object} notification - A notificação recebida
 * @param {boolean} visible - Indica se a notificação está visível
 * @param {Function} onClose - Função para fechar a notificação
 * @param {Function} onNotificationAcceptanceResponse - Callback para atualizar resposta de aceite de resolução
 * @param {Function} onAdditionalInfoAlreadyAnswered - Callback para informações adicionais já respondidas
 * @returns {JSX.Element} O componente NotificationManager
 */
const NotificationManager = ({
  notification,
  visible,
  onClose,
  onNotificationAcceptanceResponse,
  onAdditionalInfoAlreadyAnswered,
}) => {
  if (!notification) {
    return null;
  }

  const [notificationType, setNotificationType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigation = useNavigation();

  console.log(
    "[NotificationManager.js] - Renderizando NotificationManager com notificação do tipo:",
    notification.request?.content?.data?.notificationType || "informative"
  );
  console.log(
    "[NotificationManager.js] - Dados da notificação: ",
    notification.request?.content?.data
  );
  console.log(
    "[NotificationManager.js] - Qual a resposta do aceite de resolução, dado pelo munícipe? ",
    notification.request?.content?.data?.respAceite || "Ainda não respondido"
  );

  // Determina o tipo de notificação baseado nos dados da notificação
  useEffect(() => {
    if (notification && notification.request?.content?.data) {
      const { notificationType: type } = notification.request.content.data;
      let mappedType = type;

      if (type === "pedido_info") {
        mappedType = "additional_info";
      } else if (type === "aceite") {
        mappedType = "resolution_acceptance";
      } else if (type === "pesquisa") {
        mappedType = "satisfaction_survey";
      } else if (type === "Informativo") {
        mappedType = "informative";
      }
      setNotificationType(mappedType || "informative");
    }
  }, [notification]);

  /**
   * Função auxiliar para verificar se a notificação do tipo informações complementares ja foi respondida
   * @param {Object} notificationData - Resposta do munícipe obtida do servidor
   * @returns {boolean} true se a notificação do tipo infos complementares ja foi respondida, false caso contrário
   */
  const isAdditionalInfoAlreadyAnswered = (notificationData) => {
    const respInfoAdicional = notificationData?.respMunicipe;

    console.log(
      "[NotificationManager.js] - Verificando resposta do munícipe: ",
      respInfoAdicional
    );

    // Retorna true se existir resposta válida (não vazia, não null, não undefined)
    return (
      respInfoAdicional !== "" &&
      respInfoAdicional !== null &&
      respInfoAdicional !== undefined &&
      respInfoAdicional.trim() !== "" // Remove espaços em branco nos extremos
    );
  };

  // Bloco dentro de useEffect para gerenciar navegação de additional_info
  useEffect(() => {
    if (visible && notificationType === "additional_info") {
      const notificationData = notification.request?.content?.data || {};

      // Se não foi respondida, navega para a tela de infos adicionais
      if (isAdditionalInfoAlreadyAnswered(notificationData)) {
        console.log(
          "[NotificationManager.js] - Informações adicionais já foram respondidas - modal será exibido pelo switch statement."
        );
        return;
      }
      console.log(
        "[NotificationManager.js] - Navegando para tela de informações adicionais..."
      );
      onClose(); // Fecha a notificação atual

      navigation.navigate("AdditionalInfoNotification", {
        notification,
        onAdditionalInfoAlreadyAnswered,
      });
    }
  }, [
    visible,
    notificationType,
    navigation,
    notification,
    onClose,
    onAdditionalInfoAlreadyAnswered,
  ]);

  /**
   * A função handleAcceptResolution é chamada quando o usuário responde "SIM" a uma notificação de aceite de resolução.
   * @param {Object} notification - A notificação recebida
   * @returns {Object} result - Retorna o resultado com detalhes
   */
  const handleAcceptResolution = async (notification) => {
    if (isProcessing) return false; // Evita múltiplos envios

    try {
      setIsProcessing(true);

      const notificationData = notification.request?.content?.data || {};
      const notificationId =
        notification.messageId || notificationData.notificationId;

      if (!notificationId) {
        throw new Error(
          "[NotificationManager.js] - ID da notificação não encontrado"
        );
      }

      console.log(
        "[NotificationManager.js] - Aceitando resolução para notificação ID:",
        notificationId
      );

      const result = await sendResolutionResponse(notificationId, true);

      if (result.success) {
        console.log(
          "[NotificationManager.js] - Resolução aceita com sucesso:",
          result
        );

        Alert.alert(
          "Sucesso",
          "Sua resposta foi registrada com sucesso. Obrigado pelo seu feedback!",
          [{ text: "OK", onPress: onClose }]
        );
        return true;
      } else {
        throw new Error(
          "[NotificationManager.js] - Falha ao aceitar resolução: " +
            result.message
        );
      }
    } catch (error) {
      console.error("Erro ao aceitar resolução:", error);

      Alert.alert(
        "Erro",
        "Não foi possível processar sua resposta. Tente novamente.",
        [{ text: "OK" }]
      );
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * A função handleRejectResolution é chamada quando o usuário responde "NÃO" a uma notificação de aceite de resolução.
   * @param {Object} notification - A notificação recebida
   * @returns {Object} result - Retorna o resultado com detalhes
   */
  const handleRejectResolution = async (notification) => {
    if (isProcessing) return false;

    try {
      setIsProcessing(true);

      const notificationData = notification.request?.content?.data || {};
      const notificationId =
        notification.messageId || notificationData.notificationId;

      if (!notificationId) {
        throw new Error("ID da notificação não encontrado");
      }

      console.log(
        "[NotificationManager.js] - Rejeitando resolução para notificação ID:",
        notificationId
      );

      const result = await sendResolutionResponse(notificationId, false);

      if (result.success) {
        console.log(
          "[NotificationManager.js] - Resolução rejeitada com sucesso:",
          result
        );

        Alert.alert(
          "Sucesso",
          "Sua resposta foi registrada com sucesso. A solicitação será encaminhada para a Ouvidoria para reavaliação.",
          [{ text: "OK", onPress: onClose }]
        );
        return true;
      } else {
        throw new Error(result.message || "Falha ao rejeitar resolução");
      }
    } catch (error) {
      console.error("Erro ao rejeitar resolução: ", error);

      Alert.alert(
        "Erro",
        "Não foi possível processar sua resposta. Tente novamente mais tarde.",
        [{ text: "OK" }]
      );

      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Renderiza o modal de acordo com o tipo de notificação passado
  switch (notificationType) {
    case "informative":
      return (
        <InformativeNotification
          visible={visible}
          onClose={onClose}
          notification={notification}
        />
      );

    case "resolution_acceptance":
      return (
        <ResolutionAcceptanceNotification
          visible={visible}
          onClose={onClose}
          notification={notification}
          onAccept={handleAcceptResolution}
          onReject={handleRejectResolution}
          onNotificationAcceptanceResponse={onNotificationAcceptanceResponse}
        />
      );

    case "satisfaction_survey":
      return (
        <SatisfactionSurveyNotification
          visible={visible}
          onClose={onClose}
          notification={notification}
        />
      );

    case "additional_info":
      const notificationData = notification.request?.content?.data || {};
      if (isAdditionalInfoAlreadyAnswered(notificationData) && visible) {
        return (
          <AdditionalInfoAlreadyAnsweredModal
            visible={visible}
            onClose={onClose}
            notification={notification}
          />
        );
      }

      return null;
    default:
      return (
        <InformativeNotification
          visible={visible}
          onClose={onClose}
          notification={notification}
        />
      );
  }
};

export default NotificationManager;
