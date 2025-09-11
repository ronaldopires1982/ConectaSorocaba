// imports nativos
import { Alert } from "react-native";

// imports de terceiros
import * as Notifications from "expo-notifications";

// imports locais
import {
  registrarTokenNoServidor,
  markNotificationAsRead,
  updateTokenWithUserId,
} from "../api/NotificationService";
import { registerForPushNotificationsAsync } from "./NotificationSetup";
import {
  getStoredDeviceInfo,
  getStoredPushToken,
} from "./NotificationUtilities";

// Define chaves para o AsyncStorage
export const EXPO_PUSH_TOKEN_KEY = "expo_Push_Token";
export const DEVICE_INFO_KEY = "device_info";

// Variável para evitar múltiplas configurações simultâneas
let isSettingUpToken = false;

/**
 * Solicita permissão para notificações caso a permissão nativa não tenha sido concedida.
 * @returns {Promise<boolean>} - Retorna true ou falso, se a permissão foi concedida ou não.
 */
export const solicitarPermissaoNotificacoes = async () => {
  try {
    // Verifica o status atual da permissão para receber notificações
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    console.log(
      "NotificationActions.js: Status da permissão antes do alerta:",
      existingStatus
    );

    if (existingStatus === "granted") {
      console.log("NotificationActions.js: Permissão já concedida.");
      return true;
    }

    // Se o status não é granted (pode ser denied ou undetermined),
    // mostra um alerta informativo primeiro
    await new Promise((resolve) => {
      Alert.alert(
        "Notificações",
        "Para receber atualizações sobre suas solicitações, você precisa conceder a permissão para enviarmos as notificações.",
        [
          {
            text: "Eu entendo",
            onPress: () => {
              console.log(
                "NotificationActions.js: Usuário entendeu o aviso sobre notificações."
              );
              resolve();
            },
          },
        ],
        { cancelable: false }
      );
    });

    // Após o usuário clicar em "Eu entendo", solicita a permissão nativa
    console.log("NotificationActions.js: Solicitando permissão nativa...");
    const { status } = await Notifications.requestPermissionsAsync();
    console.log(
      "NotificationActions.js: Status da permissão após solicitação nativa:",
      status
    );
    return status === "granted";
  } catch (error) {
    console.error(
      "NotificationActions.js: erro ao solicitar permissão para notificações:",
      error
    );
    return false;
  }
};

/**
 * Configura o dispositivo e token para notificações
 * @returns {Promise<{token: string|null, deviceInfo: Object|null}>} - Informações de notificação
 */
export const setupDeviceAndToken = async () => {
  // Evita múltiplas inicializações simultâneas
  if (isSettingUpToken) {
    console.log(
      "NotificationActions.js: Configuração de token já em andamento."
    );
    return { token: null, deviceInfo: null };
  }

  isSettingUpToken = true;

  try {
    // Verifica se já temos token e informações do dispositivo
    // const storedToken = await getStoredPushToken();
    // const storedDeviceInfo = await getStoredDeviceInfo();

    // if (storedToken && storedDeviceInfo) {
    //   console.log(
    //     "NotificationActions.js: Usando token armazenado:",
    //     storedToken
    //   );
    //   isSettingUpToken = false;
    //   return { token: storedToken, deviceInfo: storedDeviceInfo };
    // }

    // Se não temos dados armazenados, registra novo token
    console.log("NotificationActions.js: Registrando novo token...");

    // Solicita permissão para notificações
    const permissionGranted = await solicitarPermissaoNotificacoes();

    if (!permissionGranted) {
      console.log(
        "NotificationActions.js: Permissão negada, continuando sem notificações"
      );
      isSettingUpToken = false;
      return { token: null, deviceInfo: null };
    }

    // Registra para receber notificações
    const result = await registerForPushNotificationsAsync();

    if (result && result.token) {
      console.log(
        "NotificationActions.js: Novo token registrado:",
        result.token
      );

      // Registra o token no servidor
      await registrarTokenNoServidor(result.token, result.deviceInfo);

      isSettingUpToken = false;
      return { token: result.token, deviceInfo: result.deviceInfo };
    } else {
      console.log("NotificationActions.js: Falha ao registrar token");
      isSettingUpToken = false;
      return { token: null, deviceInfo: null };
    }
  } catch (error) {
    console.error("NotificationActions.js: Erro na configuração:", error);
    isSettingUpToken = false;
    return { token: null, deviceInfo: null };
  }
};

/**
 * Atualiza o token com o ID do usuário quando o usuário faz login
 * @param {string} userId - ID do usuário logado
 * @returns {Promise<boolean>} - Status de sucesso da operação
 */
export const updateUserIdForToken = async (userId) => {
  if (!userId) {
    console.log("NotificationActions.js: ID de usuário inválido");
    return false;
  }

  try {
    const token = await getStoredPushToken();
    const deviceInfo = await getStoredDeviceInfo();

    if (!token || !deviceInfo) {
      console.log(
        "NotificationActions.js: Token ou informações do dispositivo não disponíveis"
      );
      return false;
    }

    return await updateTokenWithUserId(token, deviceInfo, userId);
  } catch (error) {
    console.error(
      "NotificationActions.js: Erro ao atualizar token com ID do usuário:",
      error
    );
    return false;
  }
};

/**
 * Marca uma notificação como lida
 * @param {string} notificationId - ID da notificação
 * @param {string} userId - ID do usuário (opcional)
 * @returns {Promise<boolean>} - Status de sucesso
 */
export const markNotificationReadStatus = async (
  notificationId,
  userId = null
) => {
  if (!notificationId) {
    console.warn("NotificationActions.js: ID de notificação ausente");
    return false;
  }

  try {
    console.log(
      `NotificationActions.js: Marcando notificação como lida: ${notificationId}`
    );
    return await markNotificationAsRead(notificationId, userId);
  } catch (error) {
    console.error(
      "NotificationActions.js: Erro ao marcar notificação como lida:",
      error
    );
    return false;
  }
};
