import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
  Animated,
  Linking,
  Alert,
} from "react-native";
import { ButtonText, Colors, ExtraText, StyledButton } from "./estilos";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { downloadAttachment } from "../api/AttachmentService";

const { brand, customGreen, customRed, primary, tertiary, darkLight } = Colors;

export const ModalLoading = ({ isVisible }) => {
  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    </Modal>
  );
};

export function ModalSucesso({
  isVisible,
  success = true,
  onClose,
  title = "Sucesso!",
  message1 = "Descrição da mensagem 1",
  message2,
  message3,
  message4,
  message5,
  buttonText = "Continuar",
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.containerModalSucesso}>
        <View style={styles.contentModalSucesso}>
          {/* Close X button */}
          <View style={styles.closeButtonContainerModalSucesso}>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={30} color="black" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View>
            <ExtraText style={styles.titleModalSucesso}>{title}</ExtraText>
          </View>
          <View>
            {success ? (
              <Feather name="check" size={120} color={customGreen} />
            ) : (
              <Feather name="x" size={120} color={customRed} />
            )}
          </View>

          {/* Message1 */}
          <View style={{ marginBottom: 10 }}>
            <ExtraText style={styles.textModalSucesso}>{message1}</ExtraText>
          </View>
          {/* Message2 */}
          {message2 && (
            <ExtraText style={styles.textModalSucesso}>{message2}</ExtraText>
          )}
          {/* Message3 */}
          {message3 && (
            <ExtraText style={styles.textModalSucesso}>{message3}</ExtraText>
          )}
          {/* Message4 */}
          {message4 && (
            <ExtraText style={styles.textModalSucesso}>{message4}</ExtraText>
          )}
          {/* Message5 */}
          {message5 && (
            <ExtraText style={styles.textModalSucesso}>{message5}</ExtraText>
          )}
        </View>
        {/* Action button */}
        <StyledButton style={styles.actionButtonModalSucesso} onPress={onClose}>
          <ButtonText>{buttonText}</ButtonText>
        </StyledButton>
      </View>
    </Modal>
  );
}

export function ModalSolicitacao({
  protocolo,
  situacao,
  status,
  dia,
  assunto,
  descAssunto,
  cep,
  logradouro,
  numero,
  complemento,
  bairro,
  anexos = [],
  hasUnreadNotifications = false,
  loadingAnexos = false,
  isPublicView = false,
  handleClose,
  onNavigateToComuniqueSeRelacionados,
}) {
  const [anexosExpanded, setAnexosExpanded] = useState(false);
  const [modalLoadingVisible, setModalLoadingVisible] = useState(false);

  console.log("[ModalSolicitacao.js] - anexos passados para o Modal:", anexos);

  // Função para mapear situação com novos estados
  const getSituacaoInfo = (situacao) => {
    const statusMap = {
      Open_New: {
        text: "Nova",
        color: "#007aff",
        backgroundColor: "#e3f2fd",
        icon: "plus-circle",
      },
      Open_Assigned: {
        text: "Atribuída",
        color: "#ff9500",
        backgroundColor: "#fff3e0",
        icon: "user",
      },
      Open_Pending_Input: {
        text: "Pendente de Informação",
        color: "#ff3b30",
        backgroundColor: "#ffebeb",
        icon: "help-circle",
      },
      Open_Pending_Research: {
        text: "Em Análise",
        color: "#5856d6",
        backgroundColor: "#f3f2ff",
        icon: "search",
      },
      Closed_Closed: {
        text: "Concluída",
        color: customGreen,
        backgroundColor: "#e8f5e8",
        icon: "check-circle",
      },
      Closed: {
        text: "Concluída",
        color: customGreen,
        backgroundColor: "#e8f5e8",
        icon: "check-circle",
      },
      Open: {
        text: "Aberta",
        color: "#ff9500",
        backgroundColor: "#fff3e0",
        icon: "clock",
      },
      Closed_Rejected: {
        text: "Rejeitada",
        color: customRed,
        backgroundColor: "#ffebeb",
        icon: "x-circle",
      },
      Open_Onbudsman: {
        text: "Encaminhada à Ouvidoria",
        color: "#007aff",
        backgroundColor: "#e3f2fd",
        icon: "send",
      },
      Open_Onbudsman_Ana: {
        text: "Encaminhada à Ouvidoria",
        color: "#007aff",
        backgroundColor: "#e3f2fd",
        icon: "send",
      },
      Open_Pending_OK: {
        text: "Aguardando aceite",
        color: "#5ac8fa",
        backgroundColor: "#e6f7ff",
        icon: "clock",
      },
    };

    return (
      statusMap[situacao] || {
        text: situacao,
        color: darkLight,
        backgroundColor: "#f5f5f5",
        icon: "help-circle",
      }
    );
  };

  const situacaoInfo = getSituacaoInfo(situacao);

  // Handle navigation to Comunique-se relacionados
  const handleNavigateToComuniqueSe = () => {
    if (onNavigateToComuniqueSeRelacionados) {
      onNavigateToComuniqueSeRelacionados(protocolo);
    }
    handleClose();
  };

  // Handle backdrop press to close modal
  const handleBackdropPress = () => {
    handleClose();
  };

  // Prevent modal from closing when content is pressed
  const handleContentPress = () => {
    // Do nothing - prevents event bubbling
  };

  // Toggle anexos expansion
  const toggleAnexos = () => {
    setAnexosExpanded(!anexosExpanded);
  };

  // Render anexo item (futuramente fazer chamada de função a ser alocada em FileUtils.js para renderização de tipos de ícones)
  const renderAnexo = (anexo, index) => {
    const isImage =
      anexo.tipo === "image" || anexo.mime_type?.startsWith("image/");
    const isPdf = anexo.tipo === "pdf" || anexo.mime_type === "application/pdf";

    return (
      <TouchableOpacity
        key={index}
        style={styles.anexoItem}
        onPress={async () => {
          try {
            console.log("Conteúdo do anexo:", anexo);
            setModalLoadingVisible(true);

            const result = await downloadAttachment(anexo.id, anexo.filename);

            setModalLoadingVisible(false);
            console.log("[Modal.js] - Download result:", result);
          } catch (error) {
            setModalLoadingVisible(false);
            console.error("Erro ao baixar o anexo:", error);
          }
        }}
      >
        <View style={styles.anexoIcon}>
          {isImage ? (
            anexo.thumbnail ? (
              <Image
                source={{ uri: anexo.thumbnail }}
                style={styles.anexoThumbnail}
              />
            ) : (
              <Feather name="image" size={24} color={brand} />
            )
          ) : isPdf ? (
            <MaterialCommunityIcons
              name="file-pdf-box"
              size={24}
              color={customRed}
            />
          ) : (
            <Feather name="file" size={24} color={darkLight} />
          )}
        </View>
        <View style={styles.anexoInfo}>
          <Text style={styles.anexoNome} numberOfLines={1}>
            {anexo.filename || anexo.name || `Anexo ${index + 1}`}
          </Text>
          <Text style={styles.anexoTipo}>
            {isImage ? "Imagem" : isPdf ? "PDF" : "Documento"}
          </Text>
        </View>
        <Feather name="download" size={16} color={darkLight} />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.containerModalSolicitacao}>
          <TouchableWithoutFeedback onPress={handleContentPress}>
            <View style={styles.contentModalSolicitacao}>
              {/* Header com close button */}
              <View style={styles.headerModalSolicitacao}>
                <View style={styles.titleContainer}>
                  <Feather name="file-text" size={24} color={brand} />
                  <Text style={styles.titleModalSolicitacao}>
                    Detalhes da Solicitação
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* Assunto e Status */}

              <View style={styles.assuntoStatusContainer}>
                {/* Assunto - with same background as protocolo */}
                <View style={styles.sectionWithBackground}>
                  <Text style={styles.sectionTitle}>Assunto</Text>
                  <Text style={styles.sectionContent}>{assunto}</Text>
                </View>
                <View
                  style={[
                    styles.statusContainer,
                    { backgroundColor: situacaoInfo.backgroundColor },
                  ]}
                >
                  <Feather
                    name={situacaoInfo.icon}
                    size={16}
                    color={situacaoInfo.color}
                  />
                  <Text
                    style={[styles.statusText, { color: situacaoInfo.color }]}
                  >
                    {situacaoInfo.text}
                  </Text>
                </View>
              </View>

              {/* Descrição - with same background as protocolo */}
              {descAssunto && descAssunto.trim() && (
                <View style={styles.sectionWithBackground}>
                  <Text style={styles.sectionTitle}>Descrição</Text>
                  <Text style={styles.sectionContent}>{descAssunto}</Text>
                </View>
              )}

              {/* Endereço - with same background as protocolo */}
              <View style={styles.sectionWithBackground}>
                <Text style={styles.sectionTitle}>Endereço da Solicitação</Text>
                <View style={styles.enderecoContainer}>
                  <Feather name="map-pin" size={16} color={brand} />
                  <View style={styles.enderecoInfo}>
                    <Text style={styles.enderecoText} numberOfLines={3}>
                      {complemento
                        ? `${logradouro}, ${numero} - ${complemento} - ${bairro}`
                        : `${logradouro}, ${numero} - ${bairro}`}
                    </Text>
                    {cep && <Text style={styles.cepText}>CEP: {cep}</Text>}
                  </View>
                </View>
              </View>

              {/* Somente renderiza anexos se NÃO for uma consulta pública (sem login) */}
              {!isPublicView && (
                <View style={styles.sectionWithBackground}>
                  <TouchableOpacity
                    style={styles.anexosHeader}
                    onPress={toggleAnexos}
                  >
                    <View style={styles.anexosHeaderLeft}>
                      <Text style={styles.sectionTitle}>Anexos</Text>
                      {/* {anexos.length > 0 && (
                        <View style={styles.anexosCount}>
                          <Text style={styles.anexosCountText}>
                            {anexos.length}
                          </Text>
                        </View>
                      )} */}
                    </View>
                    <View style={styles.anexosHeaderRight}>
                      {loadingAnexos && (
                        <ActivityIndicator size="small" color={brand} />
                      )}
                      <Feather
                        name={anexosExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={darkLight}
                      />
                    </View>
                  </TouchableOpacity>

                  {anexosExpanded && (
                    <View style={styles.anexosContent}>
                      {loadingAnexos ? (
                        <View style={styles.loadingAnexos}>
                          <Text style={styles.loadingAnexosText}>
                            Carregando anexos...
                          </Text>
                        </View>
                      ) : anexos.length > 0 ? (
                        <View style={styles.anexosList}>
                          {anexos.map((anexo, index) =>
                            renderAnexo(anexo, index)
                          )}
                        </View>
                      ) : (
                        <View style={styles.noAnexos}>
                          <Feather
                            name="paperclip"
                            size={20}
                            color={darkLight}
                          />
                          <Text style={styles.noAnexosText}>
                            Nenhum anexo encontrado
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Data - with conditional bottom border radius for public view */}
              {dia && (
                <View
                  style={[
                    styles.dataContainer,
                    isPublicView && styles.dataContainerPublic,
                  ]}
                >
                  <View style={styles.protocoloContainer}>
                    <Text style={styles.protocoloLabel}>Protocolo</Text>
                    <Text style={styles.protocoloValue}>{protocolo}</Text>
                  </View>
                  <Feather name="calendar" size={16} color={darkLight} />
                  <Text style={styles.dataText}>Aberta em: {dia}</Text>
                </View>
              )}

              {/* Extra spacing for public view */}
              {isPublicView && <View style={styles.publicViewBottomSpacing} />}

              <ScrollView
                style={styles.scrollContentModalSolicitacao}
                showsVerticalScrollIndicator={false}
              ></ScrollView>

              {/* Footer com botão - ONLY SHOW if NOT public view */}
              {!isPublicView && onNavigateToComuniqueSeRelacionados && (
                <View style={styles.footerModalSolicitacao}>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.actionButtonModalSolicitacao}
                      onPress={handleNavigateToComuniqueSe}
                    >
                      <Text style={styles.actionButtonText}>
                        Ver Comunique-se relacionados
                      </Text>
                    </TouchableOpacity>

                    {/* Ícone de sino sobreposto ao botão para notificações não lidas */}
                    {hasUnreadNotifications && (
                      <View style={styles.buttonBellIconContainer}>
                        <View style={styles.buttonBellIcon}>
                          <Feather name="bell" size={13} color="#ff0000" />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      <ModalLoading isVisible={modalLoadingVisible} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(24, 24, 24, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    backgroundColor: "white",
    width: "85%",
    alignItems: "center",
    marginTop: 15,
    paddingBottom: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "thin",
    textAlign: "center",
  },
  textLabel: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  viewAssunto: {
    padding: 10,
  },
  viewEndereco: {
    padding: 10,
  },
  viewDescAssunto: {
    padding: 10,
  },

  containerModalSucesso: {
    flex: 1,
    backgroundColor: "rgba(24, 24, 24, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentModalSucesso: {
    backgroundColor: "white",
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 8,
    padding: 15,
  },
  closeButtonContainerModalSucesso: {
    alignSelf: "flex-end",
  },
  titleModalSucesso: {
    fontSize: 22,
    fontWeight: "bold",
    color: brand,
  },
  textModalSucesso: {
    color: tertiary,
    fontSize: 18,
    fontWeight: "thin",
    textAlign: "justify",
  },
  actionButtonModalSucesso: {
    width: "80%",
  },

  // ENHANCED STYLES for ModalSolicitacao
  containerModalSolicitacao: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentModalSolicitacao: {
    backgroundColor: primary,
    borderRadius: 12,
    width: "100%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  headerModalSolicitacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleModalSolicitacao: {
    fontSize: 18,
    fontWeight: "bold",
    color: brand,
    marginLeft: 10,
  },
  closeButton: {
    padding: 4,
  },
  assuntoStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
    backgroundColor: "#f8f9fa",
  },
  protocoloContainer: {
    flex: 1,
  },
  protocoloLabel: {
    fontSize: 12,
    color: darkLight,
    marginBottom: 2,
  },
  protocoloValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  dataContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dataContainerPublic: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 0,
  },
  publicViewBottomSpacing: {
    height: 20,
    backgroundColor: primary,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  dataText: {
    fontSize: 14,
    color: darkLight,
    marginLeft: 8,
  },
  scrollContentModalSolicitacao: {
    flex: 1,
  },
  section: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  sectionWithBackground: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  sectionContent: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  enderecoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  enderecoInfo: {
    marginLeft: 8,
    flex: 1,
  },
  enderecoText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  cepText: {
    fontSize: 12,
    color: darkLight,
    marginTop: 4,
  },
  // ENHANCED: Collapsible anexos styles
  anexosHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  anexosHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  anexosHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  anexosCount: {
    backgroundColor: brand,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  anexosCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  anexosContent: {
    marginTop: 12,
  },
  anexosList: {
    gap: 10,
  },
  anexoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  anexoIcon: {
    marginRight: 12,
  },
  anexoThumbnail: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  anexoInfo: {
    flex: 1,
  },
  anexoNome: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  anexoTipo: {
    fontSize: 12,
    color: darkLight,
    marginTop: 2,
  },
  loadingAnexos: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingAnexosText: {
    fontSize: 14,
    color: darkLight,
    marginTop: 8,
  },
  noAnexos: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noAnexosText: {
    fontSize: 14,
    color: darkLight,
    marginTop: 8,
  },
  footerModalSolicitacao: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  buttonContainer: {
    position: "relative",
  },
  actionButtonModalSolicitacao: {
    backgroundColor: brand,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonBellIconContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    zIndex: 10,
  },
  buttonBellIcon: {
    backgroundColor: "#fffb00",
    borderRadius: 13,
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
});
