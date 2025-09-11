/**
 * Registra o dispositivo e o token de notificação no servidor
 * @param {string} token - O token de notificação do Expo
 * @param {Object} deviceData - Informações do dispositivo
 * @param {string} userId - O ID do usuário logado (opcional)
 * @returns {Promise<Object>} - Resultado do registro
 */
export const registrarTokenNoServidor = async (
  token,
  deviceData,
  userId = null
) => {
  try {
    console.log(
      "[NotificationService.js] - registrando token no servidor...",
      "token:",
      token,
      "dispositivo:",
      deviceData,
      "usuário:",
      userId
    );

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-register-device-tokenApp.php`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expoToken: token,
          userId: userId,
          device_type: deviceData.deviceType,
          device_manufacturer: deviceData.manufacturer,
          device_model: deviceData.modelName,
          device_os: deviceData.osName,
          device_os_version: deviceData.osVersion,
        }),
      }
    );

    const result = await response.json();
    console.log(
      "[NotificationService.js] - resultado do registro do token:",
      result
    );
    return result;
  } catch (error) {
    console.error(
      "[NotificationService.js] - erro ao gravar token no servidor:",
      error
    );
    return { status: false, error: error.message };
  }
};

/**
 * Atualiza o token de notificação no servidor quando o usuário faz login
 * @param {string} expoPushToken - O token de notificação do Expo
 * @param {Object} deviceInfo - Informações do dispositivo
 * @param {string} id_municipe - O ID do usuário logado
 * @returns {Promise<boolean>} - Status de sucesso
 */
export const updateTokenWithUserId = async (
  expoPushToken,
  deviceInfo,
  id_municipe
) => {
  try {
    if (!expoPushToken || !deviceInfo) {
      console.log(
        "[NotificationService.js] - Não há token ou informações do dispositivo disponíveis para atualizar."
      );
      return false;
    }

    console.log(
      "[NotificationService.js] - Associando ao token registrado o id do usuário:",
      id_municipe
    );
    const result = await registrarTokenNoServidor(
      expoPushToken,
      deviceInfo,
      id_municipe
    );
    return result && result.status === true; // Verifica se a chamada de API retornou algo e se o status do retorno é true, e se sim, retorna true
  } catch (err) {
    console.log(
      "[NotificationService.js] - Erro ao atualizar o token com o ID do usuário:",
      err
    );
    return false;
  }
};

/**
 * Busca o histórico de notificações para o usuário logado
 * @param {string} userId - ID do usuário logado, ou nulo
 * @returns {Promise<Object>} - Objeto contendo informações do histórico de notificações e paginação.
 */
export const fetchNotificationHistory = async (userId = null) => {
  try {
    console.log(
      `[NotificationService.js] - Buscando histórico de notificações para usuário ID: ${userId}.`
    );

    const url = new URL(
      `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-notifications-historyApp.php?userId=${userId}`
    );

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();

    console.log(
      "[NotificationService.js] - Histórico de notificações recebido:",
      `${result.notifications?.length || 0} notificações`
    );

    return {
      notifications: result.notifications || [],
      success: result.success || false,
    };
  } catch (error) {
    console.error(
      "[NotificationService.js] - Erro ao buscar histórico de notificações:",
      error
    );
    // Retorna vazio em caso de erro
    return {
      notifications: [],
      success: false,
      error: error.message,
    };
  }
};

/**
 * Marca notificação como lida no servidor
 * @param {string} notificationId - O ID da notificação para marcar como lida
 * @param {string} userId - ID do usuário logado, ou nulo
 * @returns {Promise<boolean>} - Status do resultado da operação
 */
export const markNotificationAsRead = async (notificationId, userId = null) => {
  try {
    console.log(
      `[NotificationService.js] - Marcando notificação de ID: ${notificationId}como lida:`
    );

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-mark-notification-readApp.php`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: notificationId,
          userId: userId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `[NotificationService.js] - Servidor respondeu com status: ${response.status}`
      );
    }

    const result = await response.json();

    console.log(
      "[NotificationService.js] - Resultado da marcação de notificação:",
      result
    );

    return result.success === true;
  } catch (error) {
    console.error(
      "[NotificationService.js] - Erro ao marcar notificação como lida:",
      error
    );
    return false;
  }
};

/**
 * Envia uma resposta para uma notificação de aceite de resolução
 * @param {string} notificationId - ID da notificação
 * @param {boolean} accepted - Booleano indicando se a resolução foi aceita ou rejeitada
 * @returns {Promise<Object>} - Resultado da operação com detalhes
 */
export const sendResolutionResponse = async (notificationId, accepted) => {
  try {
    console.log(
      `[NotificationService.js] - Enviando resposta de aceitação de resolução para a notificação ID ${notificationId}: ${accepted ? "Aceito" : "Rejeitado"}`
    );

    const requestBody = {
      notificationId: notificationId,
      responseType: "resolution_acceptance",
      accepted: accepted,
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-response-notificationApp.php`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(
        `[NotificationService.js] - HTTP error! Status: ${response.status}`
      );
    }

    const result = await response.json();

    console.log(
      "[NotificationService.js] - Resposta de resolução enviada com sucesso:",
      result
    );

    return {
      success: result.success || false,
      id: result.id,
      acceptance: result.acceptance,
      responseTimestamp: result.responseTimestamp,
      message: result.message || "Resposta enviada com sucesso.",
    };
  } catch (error) {
    console.error(
      "[NotificationService.js] - Erro ao enviar resposta de resolução:",
      error
    );
    throw new Error(
      `[NotificationService.js] - Erro ao enviar resposta de resolução: ${error.message}`
    );
  }
};

/**
 * Enviar resposta com informações adicionais para uma notificação
 * @param {string} notificationId - ID da notificação
 * @param {string} additionalInfo - Texto com a resposta da notificação
 * @param {Array} files - Vetor com objetos de arquivos a serem enviados
 * @returns {Promise<boolean>} - Status do resultado da operação
 */
export const submitAdditionalInfo = async (
  notificationId,
  additionalInfo,
  files = []
) => {
  try {
    console.log(
      `[NotificationService.js] - Enviando informações adicionais para notificação ID ${notificationId}`
    );

    // Prepara o vetor de anexos, se houver
    let attachments = [];
    if (files && files.length > 0) {
      // Converte os arquivos para o formato base64, conforme esperado pela API
      attachments = await Promise.all(
        files.map(async (file) => ({
          filename: file.name,
          file_mime_type:
            file.type === "image" ? "image/jpeg" : "application/pdf",
          file_content: await convertFileToBase64(file.uri),
        }))
      );
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-response-notificationApp.php`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: notificationId,
          responseType: "additional_info",
          responseText: additionalInfo,
          attachments: attachments,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log(
      "[NotificationService.js] - Resultado do envio das informações adicionais:",
      result
    );

    return {
      success: result.success || false,
      id: result.id,
      responseTimestamp: result.responseTimestamp,
      error: result.error,
    };
  } catch (error) {
    console.error(
      "[NotificationService.js] - Erro ao enviar informações adicionais:",
      error
    );
    throw new Error(
      `[NotificationService.js] - Erro ao enviar informações adicionais: ${error.message}`
    );
  }
};
