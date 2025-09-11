// imports nativos
import { Platform } from "react-native";

// imports de terceiros
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// imports locais
import {
  saveDeviceInfo,
  savePushToken,
  collectDeviceInfo,
} from "./NotificationUtilities";
import { SignInContext } from "../hooks/SignInContext";

/**
 * Configura os canais de notificação para Android
 * @returns {Promise<void>}
 */
export const setupNotifications = async () => {
  // Create multiple channels for different notification types
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notificações Padrão",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#004db3d9",
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync("comunique-se", {
      name: "Comunique-se",
      description: "Notificações de comunicações oficiais da prefeitura",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250, 250, 250],
      lightColor: "#004db3d9",
      showBadge: true,
    });

    // console.log("[NotificationSetup.js] - Canais de notificação configurados.");
  }

  // Configura como as notificações devem aparecer no app em segundo plano
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // console.log("[NotificationSetup.js] - Configuração de notificações concluída.");
};

/**
 * Configura os listeners de notificação
 * @param {Function} handleNotification - Função para processar notificação recebida
 * @param {Function} handleNotificationResponse - Função para processar resposta de notificação
 * @param {Object} user - Usuário atual
 * @returns {Object} - Objeto com referências aos listeners
 */
export const setupNotificationListeners = (
  handleNotification,
  handleNotificationResponse,
  user
) => {
  const listeners = {
    notificationListener: null,
    responseListener: null,
    tokenRefreshSubscription: null,
  };

  // Listener para notificações recebidas
  listeners.notificationListener =
    Notifications.addNotificationReceivedListener((notification) => {
      console.log(
        "[NotificationSetup.js] - Notificação recebida: ",
        notification
      );
      console.log(
        "[NotificationSetup.js] - Dados da notificação: ",
        notification.request.content.data
      );
      console.log("[NotificationSetup.js] - Usuário logado: ", user);
      handleNotification(notification);
    });
  // console.log("[NotificationSetup.js] - Listener de notificação configurado.");

  // Listener para toque em notificações
  listeners.responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      // console.log(
      //   "[NotificationSetup.js] - Resposta a notificação recebida:",
      //   response
      // );
      // handleNotificationResponse(response);
    });

  // console.log("[NotificationSetup.js] - Listener de resposta configurado.");

  return listeners;
};

/**
 * Remove os listeners de notificação
 * @param {Object} listeners - Objeto com referências aos listeners
 */
export const removeNotificationListeners = (listeners) => {
  // console.log(
  //   "[NotificationSetup.js] - Removendo listeners de notificação: ",
  //   listeners
  // );

  if (listeners.notificationListener) {
    Notifications.removeNotificationSubscription(
      listeners.notificationListener
    );
  }

  if (listeners.responseListener) {
    Notifications.removeNotificationSubscription(listeners.responseListener);
  }
};

/**
 * Registra o dispositivo para receber notificações push e recebe o token Expo
 * @returns {Promise<Object>} Objeto contendo o token de notificação e informações do dispositivo
 */
export async function registerForPushNotificationsAsync() {
  // Collect device information
  const deviceInfo = collectDeviceInfo();

  // Save device info to storage
  await saveDeviceInfo(deviceInfo);

  // Create notification channels for Android
  if (Platform.OS === "android") {
    await setupNotifications();
  }

  // Check existing notification permissions
  const { status: finalStatus } = await Notifications.getPermissionsAsync();
  console.log(
    "[NotificationSetup.js] - Status atual da permissão:",
    finalStatus
  );

  // Exit if permissions are not granted
  if (finalStatus !== "granted") {
    console.log(
      "[NotificationSetup.js] - Falha ao tentar obter o ExpoToken para notificação. Permissão do dispositivo não concedida."
    );

    return { token: null, deviceInfo };
  }

  // Retrieve the project ID
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.log("[NotificationSetup.js] - ID do projeto não encontrado.");
    return { token: null, deviceInfo };
  }

  const timestamp = new Date().getTime();
  console.log(
    `[NotificationSetup.js] - Solicitando novo token (timestamp: ${timestamp})`
  );

  try {
    // Get the Expo push token
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    console.log(
      "[NotificationSetup.js] - Expo push token:",
      expoPushToken.data
    );

    // Store the token
    await savePushToken(expoPushToken.data);

    return {
      token: expoPushToken.data,
      deviceInfo,
    };
  } catch (error) {
    console.error(
      "[NotificationSetup.js] - Erro ao obter o push token:",
      error
    );
    return { token: null, deviceInfo };
  }
}
