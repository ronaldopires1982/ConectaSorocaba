import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

/**
 * Baixa um anexo na memória cache e abre com app externo escolhido pelo usuário
 * @param {string} noteId - ID da Nota (anexo) que contém o arquivo a ser baixado
 * @param {string} filename - Nome do arquivo (opcional, usado como fallback)
 * @returns {Promise<object>} Resultado da operação
 */

export const downloadAttachment = async (noteId, filename) => {
  try {
    const url = `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-get-attachmentsApp.php?download=1&note_id=${encodeURIComponent(noteId)}`;

    // Download para cache temporário do app
    const tempUri = FileSystem.cacheDirectory + filename;
    const downloadResult = await FileSystem.downloadAsync(url, tempUri);

    if (downloadResult.status !== 200) {
      throw new Error("Falha ao baixar o anexo");
    }

    // Verifica se o compartilhamento está disponível
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        "Compartilhamento não disponível",
        "Nenhum aplicativo de compartilhamento encontrado."
      );
      return {
        success: false,
        message: "Nenhum aplicativo de compartilhamento encontrado.",
      };
    }

    // Abrir com app externo - mostra uma lista de apps disponíveis
    await Sharing.shareAsync(tempUri, {
      mimeType: getMimeType(filename),
      dialogTitle: `Abrir ${filename} com...`,
      UTI: getUTI(filename), // para iOS
    });

    return {
      success: true,
      uri: tempUri,
      filename: filename,
      action: "opened_with_external_app",
    };
  } catch (error) {
    console.error("Erro ao baixar ou abrir o anexo:", error);

    Alert.alert(
      "Erro ao abrir o arquivo",
      error.message || "Ocorreu um erro ao tentar abrir o arquivo.",
      [{ text: "OK" }]
    );
    throw error;
  }
};

/**
 * Determina o MIME type baseado na extensão do arquivo
 */

const getMimeType = (filename) => {
  const extension = filename.split(".").pop().toLowerCase();

  const mimeType = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    zip: "application/zip",
  };
  return mimeType[extension] || "application/octet-stream";
};

/**
 * Determina o UTI (Uniform Type Identifier) para iOS
 */
const getUTI = (filename) => {
  const extension = filename.split(".").pop()?.toLowerCase();

  const utis = {
    pdf: "com.adobe.pdf",
    jpg: "public.jpeg",
    jpeg: "public.jpeg",
    png: "public.png",
    gif: "com.compuserve.gif",
    doc: "com.microsoft.word.doc",
    docx: "org.openxmlformats.wordprocessingml.document",
    xls: "com.microsoft.excel.xls",
    xlsx: "org.openxmlformats.spreadsheetml.sheet",
    txt: "public.plain-text",
    mp4: "public.mpeg-4",
    mp3: "public.mp3",
  };
  return utis[extension];
};
