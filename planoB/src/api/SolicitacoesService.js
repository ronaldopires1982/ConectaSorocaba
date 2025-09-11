import { fetchNotificationHistory } from "./NotificationService";

/**
 * Consulta uma solicitação por protocolo
 * @param {string} protocolo - Número do protocolo a ser consultado
 * @returns {Promise<Object>} Detalhes da solicitação consultada
 * @throws {Error} Se ocorrer um erro durante a consulta
 */
export const consultarPorProtocolo = async (protocolo) => {
  console.log("[SolicitacoesService.js] - Consultando protocolo:", protocolo);
  try {
    const result = await fetch(
      `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-lista-casesApp.php?protocolo=${protocolo}`
    );

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const data = await result.json();

    if (data.result_count_cases === 0) {
      return {
        status: 404,
        message: "Nenhum registro encontrado.",
      };
    }

    // Processa os dados usando a mesma lógica do ListarSolicitacoesPorMunicipe
    const processedData = processApiResponse(data);
    return processedData.length > 0 ? processedData[0] : null;
  } catch (error) {
    console.error("[SolicitacoesService] - Erro ao buscar protocolo:", error);
    throw error;
  }
};

/**
 * Lista todas as solicitações por munícipe
 * @param {string} idMunicipeRecebido - ID do munícipe para filtrar as solicitações
 * @returns {Promise<Array>} Lista de solicitações processadas com anexos e comunicados
 * @throws {Error} Se ocorrer um erro durante a consulta
 */
export const ListarSolicitacoesPorMunicipe = async (idMunicipeRecebido) => {
  try {
    console.log(
      "[SolicitacoesService.js] - Buscando dados para munícipe:",
      idMunicipeRecebido
    );

    // 1. Busca dados das solicitações
    const casesResponse = await fetch(
      `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-lista-casesApp.php?id_municipe=${idMunicipeRecebido}`
    );

    if (!casesResponse.ok) {
      throw new Error(`HTTP error! status: ${casesResponse.status}`);
    }

    const casesData = await casesResponse.json();
    console.log("[SolicitacoesService.js] - Dados da API:", {
      cases: casesData.result_count_cases,
      tasks: casesData.result_count_tasks,
      notes: casesData.result_count_notes,
    });

    if (casesData.result_count_cases === 0) {
      return [];
    }

    // 2. Busca notificações do usuário
    const notificationsResult =
      await fetchNotificationHistory(idMunicipeRecebido);
    const notifications = notificationsResult.error
      ? []
      : notificationsResult.notifications || [];

    console.log(
      "[SolicitacoesService.js] - Notificações encontradas:",
      notifications.length
    );

    // 3. Processa os dados
    const processedCases = processApiResponse(casesData, notifications);

    console.log(
      "[SolicitacoesService.js] - Casos processados:",
      processedCases.length
    );
    return processedCases;
  } catch (error) {
    console.error(
      "[SolicitacoesService.js] - Erro ao listar solicitações:",
      error
    );
    throw error;
  }
};

/**
 * Processa a resposta da API para criar objetos estruturados das solicitações
 * @param {Object} apiData - Resposta da API com cases, tasks e notes
 * @param {Array} notifications - Array de notificações do usuário
 * @returns {Array} Array de solicitações processadas
 */
function processApiResponse(apiData, notifications = []) {
  const { cases = [], tasks = [], notes = [] } = apiData;

  // Cria mapa de tasks por case_id
  const tasksByCase = {};
  tasks.forEach((task) => {
    const parentId = task.name_value_list.parent_id?.value;
    const parentType = task.name_value_list.parent_type?.value;

    if (parentType === "Cases" && parentId) {
      if (!tasksByCase[parentId]) {
        tasksByCase[parentId] = [];
      }
      tasksByCase[parentId].push(task);
    }
  });

  // Cria mapa de notes por parent_id (cases e tasks)
  const notesByParent = {};
  notes.forEach((note) => {
    const parentId = note.name_value_list.parent_id?.value;
    if (parentId) {
      if (!notesByParent[parentId]) {
        notesByParent[parentId] = [];
      }
      notesByParent[parentId].push(note);
    }
  });

  // Função auxiliar para formatar data
  const dataReformatada = (dateString) => {
    const [ano, mes, dia] = dateString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  // Função auxiliar para formatar nome/assunto
  const formatarAssunto = (nomeOriginal, assuntoName) => {
    // Se há um nome do assunto no storage local, usa, se não, usa o nome original
    if (assuntoName && assuntoName.trim()) {
      return (
        assuntoName.charAt(0).toUpperCase() + assuntoName.slice(1).toLowerCase()
      );
    }

    if (nomeOriginal && nomeOriginal.trim()) {
      return (
        nomeOriginal.charAt(0).toUpperCase() +
        nomeOriginal.slice(1).toLowerCase()
      );
    }

    return "Assunto não definido";
  };

  // Processa cada case
  const processedCases = cases.map((caseItem) => {
    const caseId = caseItem.name_value_list.id.value;
    const protocolo = caseItem.name_value_list.protocolo_c.value;

    // Obtém o nome do assunto do case
    const assuntoName = caseItem.name_value_list.a01_assunto_name?.value;
    const assuntoId = caseItem.name_value_list.a01_assunto_id_c?.value;
    const nomeOriginal = caseItem.name_value_list.name.value;

    // console.log(`[SolicitacoesService.js] - Protocolo ${protocolo}:`, {
    //   assuntoId,
    //   assuntoName,
    //   nomeOriginal,
    // });

    // Coleta todas as notes relacionadas ao case
    const relatedNotes = [];

    // 1. Notes (anexos) diretamente relacionadas ao case
    const directNotes = notesByParent[caseId] || [];
    relatedNotes.push(...directNotes);

    // 2. Notes (anexos) relacionadas às tasks do case
    const caseTasks = tasksByCase[caseId] || [];
    caseTasks.forEach((task) => {
      const taskId = task.name_value_list.id.value;
      const taskNotes = notesByParent[taskId] || [];
      relatedNotes.push(...taskNotes);
    });

    // Separa anexos de comunicados (anexos têm filename)
    const attachments = relatedNotes.filter((note) => {
      const filename = note.name_value_list.filename?.value;
      return filename && filename.trim() !== "";
    });

    // Processa anexos
    const processedAttachments = attachments.map((att) => ({
      id: att.name_value_list.id.value,
      filename: att.name_value_list.filename.value,
      mime_type: att.name_value_list.file_mime_type?.value || "",
      date_uploaded: att.name_value_list.date_entered.value,
      name:
        att.name_value_list.name.value || att.name_value_list.filename.value,
      description: att.name_value_list.description?.value || "",
      parent_type: att.name_value_list.parent_type.value,
      parent_id: att.name_value_list.parent_id.value,
    }));

    // Filtra notificações para este protocolo
    const allNotifications = notifications.filter((notification) => {
      const notificationData = notification.request?.content?.data || {};
      return notificationData.protocolNumber === protocolo;
    });

    // Conta notificações não lidas para este protocolo
    const unreadNotifications = allNotifications.filter(
      (notification) => !notification.isRead
    );

    // Filtra as notificações lidas
    const readNotifications = allNotifications.filter((n) => n.isRead === true);

    // Processa tasks
    const processedTasks = caseTasks.map((task) => ({
      id: task.name_value_list.id.value,
      name: task.name_value_list.name.value,
      description: task.name_value_list.description.value,
      status: task.name_value_list.status.value,
      priority: task.name_value_list.priority.value,
      date_entered: task.name_value_list.date_entered.value,
      date_modified: task.name_value_list.date_modified.value,
    }));

    // Monta informações básicas da solicitação
    const basicInfo = {
      id: caseId,
      protocolo: protocolo,
      statusSol: caseItem.name_value_list.state.value,
      dia: dataReformatada(
        caseItem.name_value_list.date_entered.value.slice(0, 10)
      ),
      assunto: formatarAssunto(nomeOriginal, assuntoName),
      assuntoId: assuntoId,
      descAssunto: caseItem.name_value_list.description.value.replace(
        /&lt;p&gt;|&lt;\/p&gt;/g,
        ""
      ),
    };

    // Monta informações de endereço
    const addressInfo = {
      cep: caseItem.name_value_list.cep_c.value,
      logradouro: caseItem.name_value_list.end_logradouro_c.value,
      numero: caseItem.name_value_list.end_numero_c.value,
      complemento: caseItem.name_value_list.end_complemento_c.value,
      bairro: caseItem.name_value_list.end_bairro_c.value,
    };

    // Monta informações de anexos
    const attachmentInfo = {
      hasAttachments: processedAttachments.length > 0,
      attachmentsCount: processedAttachments.length,
      attachments: processedAttachments,
    };

    // Monta informações de notificações
    const notificationInfo = {
      hasNotifications: allNotifications.length > 0,
      notificationsCount: allNotifications.length,
      allNotifications: allNotifications,
      hasUnreadNotifications: unreadNotifications.length > 0,
      unreadNotificationsCount: unreadNotifications.length,
      unreadNotifications: unreadNotifications,
      hasReadNotifications: readNotifications.length > 0,
      readNotificationsCaount: readNotifications.length,
      readNotifications: readNotifications,
    };

    // Monta informações de tasks
    const taskInfo = {
      tasks: processedTasks,
    };

    // Monta dados completos para uso no modal
    const rawData = {
      rawCase: caseItem,
      rawTasks: caseTasks,
      rawNotes: relatedNotes,
    };

    // Combina todas as informações em um objeto final
    const solicitacao = {
      ...basicInfo,
      ...addressInfo,
      ...attachmentInfo,
      ...notificationInfo,
      ...taskInfo,
      ...rawData,
    };

    return solicitacao;
  });

  // Ordena por protocolo (decrescente)
  const sortedCases = processedCases.sort((a, b) => {
    return b.protocolo.localeCompare(a.protocolo);
  });

  return sortedCases;
}

/**
 * Busca anexos detalhados de uma solicitação específica
 * @param {string} recordId - ID do registro (case)
 * @returns {Promise<Array>} Lista detalhada de anexos
 * @throws {Error} Se ocorrer um erro durante a consulta
 */
export const buscarAnexosDetalhados = async (recordId) => {
  try {
    console.log(
      "[SolicitacoesService.js] - Buscando anexos para record ID:",
      recordId
    );

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-get-attachmentsApp.php?record_id=${recordId}&module=Cases`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log(
      "[SolicitacoesService.js] - Anexos encontrados:",
      data.total_attachments
    );

    if (data.status === "success") {
      return data.attachments || [];
    } else {
      throw new Error(data.message || "Erro ao buscar anexos");
    }
  } catch (error) {
    console.error("[SolicitacoesService] - Erro ao buscar anexos:", error);
    throw error;
  }
};

/**
 * Constrói URL de download para um anexo
 * @param {string} noteId - ID da nota
 * @param {string} filename - Nome do arquivo
 * @returns {string} URL de download
 */
export const getDownloadUrl = (noteId, filename) => {
  return `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-get-attachmentsApp.php?download=1&note_id=${noteId}&filename=${encodeURIComponent(filename)}`;
};

/**
 * Formata tamanho do arquivo para exibição
 * @param {string} fileSize - Tamanho do arquivo (ex: "1.5 MB")
 * @returns {string} Tamanho formatado
 */
export const formatFileSize = (fileSize) => {
  if (!fileSize || fileSize === "N/A") return "";
  return fileSize;
};

// Função comentada para avaliação se pode ser removida ou não

// /**
//  * Formata data de upload para exibição
//  * @param {string} dateString - Data no formato ISO
//  * @returns {string} Data formatada
//  */
// export const formatUploadDate = (dateString) => {
//   if (!dateString) return "";
//
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("pt-BR", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch (error) {
//     return dateString;
//   }
// };

/**
 * Determina o ícone apropriado para o tipo de arquivo
 * @param {string} mimeType - Tipo MIME do arquivo
 * @param {string} filename - Nome do arquivo
 * @returns {string} Nome do ícone do Feather
 */
export const getFileIcon = (mimeType, filename) => {
  if (!mimeType && !filename) return "file";

  const type = mimeType || "";
  const ext = filename ? filename.split(".").pop()?.toLowerCase() : "";

  // Images
  if (
    type.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)
  ) {
    return "image";
  }

  // PDFs
  if (type === "application/pdf" || ext === "pdf") {
    return "file-text";
  }

  // Documents
  if (type.includes("word") || ["doc", "docx"].includes(ext)) {
    return "file-text";
  }

  // Spreadsheets
  if (
    type.includes("sheet") ||
    type.includes("excel") ||
    ["xls", "xlsx", "csv"].includes(ext)
  ) {
    return "grid";
  }

  // Videos
  if (
    type.startsWith("video/") ||
    ["mp4", "avi", "mov", "wmv", "flv"].includes(ext)
  ) {
    return "video";
  }

  // Audio
  if (
    type.startsWith("audio/") ||
    ["mp3", "wav", "flac", "aac"].includes(ext)
  ) {
    return "headphones";
  }

  // Archives
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return "archive";
  }

  return "file";
};
