// NotificationUtilities.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Define constants
export const EXPO_PUSH_TOKEN_KEY = "expo_push_token";
export const DEVICE_INFO_KEY = "device_info";

/**
 * Coleta informações do dispositivo atual
 * @returns {Object} Objeto com informações do dispositivo
 */
export const collectDeviceInfo = () => {
  const deviceInfo = {
    deviceType:
      Device.deviceType === 1
        ? "celular"
        : Device.deviceType === 2
          ? "tablet"
          : "outro",
    manufacturer: Device.manufacturer || "Desconhecido",
    modelName: Device.modelName || "Desconhecido",
    osName: Device.osName || Platform.OS,
    osVersion: Device.osVersion || "Desconhecido",
  };

  console.log(
    "NotificationUtilities.js: Informações do dispositivo coletadas:",
    deviceInfo
  );

  return deviceInfo;
};

/**
 * Salva informações do dispositivo no AsyncStorage
 * @param {Object} deviceInfo - Objeto com informações do dispositivo
 * @returns {Promise<void>}
 */
export const saveDeviceInfo = async (deviceInfo) => {
  try {
    await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
    console.log("NotificationUtilities.js: Informações do dispositivo salvas");
  } catch (error) {
    console.error(
      "NotificationUtilities.js: Erro ao salvar informações do dispositivo:",
      error
    );
  }
};

/**
 * Salva o token de notificação no AsyncStorage
 * @param {string} token Token de notificação
 */
export const savePushToken = async (token) => {
  try {
    await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);
    console.log("NotificationUtilities.js: Token de notificação salvo");
  } catch (error) {
    console.error(
      "NotificationUtilities.js: Erro ao salvar token de notificação:",
      error
    );
  }
};

/**
 * Retorna as informações armazenadas do dispositivo
 * @returns {Promise<Object|null>} Informações do dispositivo ou null
 */
export const getStoredDeviceInfo = async () => {
  try {
    const deviceInfoString = await AsyncStorage.getItem(DEVICE_INFO_KEY);
    return deviceInfoString ? JSON.parse(deviceInfoString) : null;
  } catch (error) {
    console.error(
      "NotificationUtilities.js: Erro ao obter informações do dispositivo:",
      error
    );
    return null;
  }
};

/**
 * Retorna o token de notificação armazenado
 * @returns {Promise<string|null>} Token de notificação ou null
 */
export const getStoredPushToken = async () => {
  try {
    return await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);
  } catch (error) {
    console.error(
      "NotificationUtilities.js: Erro ao obter token de notificação:",
      error
    );
    return null;
  }
};
