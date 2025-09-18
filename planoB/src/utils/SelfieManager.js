import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SELFIE_DIRECTORY = FileSystem.documentDirectory + "selfies/";
const SELFIE_KEY_PREFIX = "user_selfie_";

export class SelfieManager {
  /**
   * Inicializa o diretório de selfies
   */
  static async initializeSelfieDirectory() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(SELFIE_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(SELFIE_DIRECTORY, {
          intermediates: true,
        });
      }
      console.log(
        "[SelfieManager] - Diretório de selfies inicializado em:",
        SELFIE_DIRECTORY
      );
      return true;
    } catch (error) {
      console.error("Erro ao inicializar diretório de selfies:", error);
      return false;
    }
  }

  /**
   * Salva uma selfie no dispositivo
   * @param {string} imageUri - URI da imagem capturada
   * @param {string} cpf - CPF do usuário (usado como identificador)
   * @returns {Promise<string|null>} Caminho local da selfie salva ou null em caso de erro
   */
  static async saveSelfie(imageUri, cpf) {
    try {
      await this.initializeSelfieDirectory();

      // Remove selfie anterior do mesmo usuário
      await this.removeSelfie(cpf);

      // Define o nome do arquivo
      const fileName = `selfie_${cpf}_${Date.now()}.jpg`;
      const localUri = SELFIE_DIRECTORY + fileName;

      console.log(
        "[SelfieManager] - Diretório de selfies inicializado em:",
        SELFIE_DIRECTORY
      );

      // Copia a imagem para o diretório local
      await FileSystem.copyAsync({
        from: imageUri,
        to: localUri,
      });

      // Salva a referência no AsyncStorage
      await AsyncStorage.setItem(SELFIE_KEY_PREFIX + cpf, localUri);

      console.log("Selfie salva com sucesso:", localUri);
      return localUri;
    } catch (error) {
      console.error("Erro ao salvar selfie:", error);
      return null;
    }
  }

  /**
   * Recupera a selfie de um usuário
   * @param {string} cpf - CPF do usuário
   * @returns {Promise<string|null>} Caminho da selfie ou null se não encontrada
   */
  static async getSelfie(cpf) {
    try {
      // Primeiro, tenta buscar do AsyncStorage
      const storedPath = await AsyncStorage.getItem(SELFIE_KEY_PREFIX + cpf);

      if (storedPath) {
        // Verifica se o arquivo ainda existe
        const fileInfo = await FileSystem.getInfoAsync(storedPath);
        if (fileInfo.exists) {
          return storedPath;
        } else {
          // Remove referência inválida do AsyncStorage
          await AsyncStorage.removeItem(SELFIE_KEY_PREFIX + cpf);
        }
      }

      // Se não encontrou via AsyncStorage, busca no diretório
      await this.initializeSelfieDirectory();

      const files = await FileSystem.readDirectoryAsync(SELFIE_DIRECTORY);
      const userSelfieFile = files.find((file) =>
        file.includes(`selfie_${cpf}`)
      );

      if (userSelfieFile) {
        const fullPath = SELFIE_DIRECTORY + userSelfieFile;

        // Salva no AsyncStorage para próximas consultas
        await AsyncStorage.setItem(SELFIE_KEY_PREFIX + cpf, fullPath);

        return fullPath;
      }

      return null;
    } catch (error) {
      console.error("Erro ao recuperar selfie:", error);
      return null;
    }
  }

  /**
   * Remove a selfie de um usuário
   * @param {string} cpf - CPF do usuário
   * @returns {Promise<boolean>} True se removida com sucesso
   */
  static async removeSelfie(cpf) {
    try {
      // Remove do AsyncStorage
      await AsyncStorage.removeItem(SELFIE_KEY_PREFIX + cpf);

      // Remove arquivos físicos
      await this.initializeSelfieDirectory();

      const files = await FileSystem.readDirectoryAsync(SELFIE_DIRECTORY);
      const userSelfieFiles = files.filter((file) =>
        file.includes(`selfie_${cpf}`)
      );

      for (const file of userSelfieFiles) {
        const fullPath = SELFIE_DIRECTORY + file;
        await FileSystem.deleteAsync(fullPath, { idempotent: true });
      }

      return true;
    } catch (error) {
      console.error("Erro ao remover selfie:", error);
      return false;
    }
  }

  /**
   * Verifica se um usuário possui selfie
   * @param {string} cpf - CPF do usuário
   * @returns {Promise<boolean>} True se possui selfie
   */
  static async hasSelfie(cpf) {
    const selfieUri = await this.getSelfie(cpf);
    return selfieUri !== null;
  }

  /**
   * Lista todas as selfies armazenadas
   * @returns {Promise<Array>} Array com informações das selfies
   */
  static async listAllSelfies() {
    try {
      await this.initializeSelfieDirectory();

      const files = await FileSystem.readDirectoryAsync(SELFIE_DIRECTORY);
      const selfieFiles = files.filter((file) => file.startsWith("selfie_"));

      const selfieInfo = [];
      for (const file of selfieFiles) {
        const fullPath = SELFIE_DIRECTORY + file;
        const fileInfo = await FileSystem.getInfoAsync(fullPath);

        // Extrai CPF do nome do arquivo
        const cpfMatch = file.match(/selfie_(\d+)_/);
        const cpf = cpfMatch ? cpfMatch[1] : "unknown";

        selfieInfo.push({
          cpf,
          path: fullPath,
          size: fileInfo.size,
          modificationTime: fileInfo.modificationTime,
        });
      }

      return selfieInfo;
    } catch (error) {
      console.error("Erro ao listar selfies:", error);
      return [];
    }
  }

  /**
   * Limpa selfies antigas (mais de 30 dias sem uso)
   * @returns {Promise<number>} Número de selfies removidas
   */
  static async cleanupOldSelfies() {
    try {
      const allSelfies = await this.listAllSelfies();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      let removedCount = 0;

      for (const selfie of allSelfies) {
        if (selfie.modificationTime < thirtyDaysAgo) {
          await FileSystem.deleteAsync(selfie.path, { idempotent: true });
          await AsyncStorage.removeItem(SELFIE_KEY_PREFIX + selfie.cpf);
          removedCount++;
        }
      }

      console.log(
        `Limpeza concluída: ${removedCount} selfies antigas removidas`
      );
      return removedCount;
    } catch (error) {
      console.error("Erro na limpeza de selfies antigas:", error);
      return 0;
    }
  }

  /**
   * Obtém o tamanho total ocupado pelas selfies
   * @returns {Promise<number>} Tamanho em bytes
   */
  static async getTotalSize() {
    try {
      const allSelfies = await this.listAllSelfies();
      const totalSize = allSelfies.reduce(
        (sum, selfie) => sum + (selfie.size || 0),
        0
      );
      return totalSize;
    } catch (error) {
      console.error("Erro ao calcular tamanho total:", error);
      return 0;
    }
  }

  /**
   * Formata tamanho em bytes para formato legível
   * @param {number} bytes - Tamanho em bytes
   * @returns {string} Tamanho formatado
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
