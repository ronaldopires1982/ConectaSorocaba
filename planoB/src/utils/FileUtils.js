/**
 * Funções utilitárias para manipulação de arquivos
 */

/**
 * Lê um arquivo de URI e retorna seu conteúdo em formato Base64
 *
 * @param {string} uri URI do arquivo
 * @returns {Promise<string>} Retorna o conteúdo do arquivo em formato Base64
 */
export const readFileAsBase64 = async (uri) => {
  try {
    // Busca o arquivo usando a URI
    const response = await fetch(uri);
    const blob = await response.blob();

    // Converte para base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Get base64 data (remove data:image/xxx;base64, prefix)
        const base64data = reader.result.split(",")[1] || reader.result;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error reading file as base64:", error);
    throw new Error("Falha ao ler arquivo como base64");
  }
};

/**
 * Gets MIME type based on file extension
 *
 * @param {string} filename File name with extension
 * @returns {string} MIME type
 */
export const getMimeTypeFromFilename = (filename) => {
  const extension = filename.split(".").pop().toLowerCase();

  const mimeTypes = {
    // Imagens
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    svg: "image/svg+xml",
    tiff: "image/tiff",
    tif: "image/tiff",
    ico: "image/x-icon",
    // Documentos
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    rtf: "application/rtf",
    // Videos
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    webm: "video/webm",
    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    // Arquivos compactados
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
  };

  return mimeTypes[extension] || "application/octet-stream";
};

/**
 * Prepares selected files for upload (converts to base64)
 *
 * @param {Array} files Array of file objects with uri, type, and name
 * @returns {Promise<Array>} Array of prepared file objects with filename, file_mime_type and file_content
 */
export const prepareFilesForUpload = async (files) => {
  const preparedFiles = [];

  for (const file of files) {
    try {
      // Read file as base64
      const base64Content = await readFileAsBase64(file.uri);

      // Determine MIME type
      let mimeType = getMimeTypeFromFilename(file.name);

      console.log(
        `[FileUtils.js] - Arquivo: ${file.name}, MIME detectado: ${mimeType}, tipo de arquivo: ${file.type}.`
      );

      preparedFiles.push({
        filename: file.name,
        file_mime_type: mimeType,
        file_content: base64Content,
      });
    } catch (error) {
      console.error("Error preparing file:", error);
      throw new Error(`Falha ao processar arquivo: ${file.name}`);
    }
  }

  return preparedFiles;
};
