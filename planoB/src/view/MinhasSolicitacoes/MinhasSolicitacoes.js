//imports nativos
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";
import { useContext, useState, useEffect, useCallback } from "react";

//imports de terceiros
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";

//imports locais
import { Colors } from "../../components/estilos";
import { ModalSolicitacao } from "../../components/Modal";
import { ListarSolicitacoesPorMunicipe } from "../../api/SolicitacoesService";
import { SignInContext } from "../../hooks/SignInContext";
import useStorage from "../../hooks/useStorage";

const { brand, primary, darkLight, customGreen, customRed } = Colors;

export const MinhasSolicitacoes = ({ route }) => {
  const { user } = useContext(SignInContext);
  const { getItem } = useStorage();
  const navigation = useNavigation();
  const idMunicipe = user.idMunicipe;

  // Estado para lista de solicitações
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Estado para exibir/fechar modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);

  // Função para buscar o nome do assunto na lista de assuntos armazenada na storage local
  const findAssuntoName = useCallback((assuntoId, listaAssuntos) => {
    if (!assuntoId || !listaAssuntos?.entry_list) {
      return null;
    }

    // Busca o assunto correspondente na lista de assuntos
    const assunto = listaAssuntos.entry_list.find(
      (item) => item.name_value_list?.id?.value === assuntoId
    );

    return assunto?.name_value_list?.name?.value || null;
  }, []);

  // Função para carregar solicitações
  const loadSolicitacoes = useCallback(
    async (isRefreshing = false) => {
      try {
        if (isRefreshing) {
          setRefreshing(true);
        } else {
          setIsLoading(true);
        }

        // Busca as solicitações
        const solicitacoes = await ListarSolicitacoesPorMunicipe(idMunicipe);

        console.log(
          "[MinhasSolicitacoes.js] - Solicitações carregadas:",
          solicitacoes.length
        );
        console.log(
          "[MinhasSolicitacoes.js] - Com anexos:",
          solicitacoes.filter((s) => s.hasAttachments).length
        );
        // console.log(
        //   "[MinhasSolicitacoes.js] - Com comunicados:",
        //   solicitacoes.filter((s) => s.hasCommunications).length
        // );
        console.log(
          "[MinhasSolicitacoes.js] - Com notificações não lidas:",
          solicitacoes.filter((s) => s.hasUnreadNotifications).length
        );

        // Busca a lista de assuntos do storage
        const listaAssuntos = await getItem("@Assuntos");

        if (listaAssuntos?.entry_list) {
          console.log(
            "[MinhasSolicitacoes.js] - Quantidade de assuntos carregada do storage:",
            listaAssuntos.entry_list.length
          );

          // Mapeia os assuntos corretos para cada solicitação
          const solicitacoesComAssuntos = solicitacoes.map((solicitacao) => {
            // Busca o ID do assunto nos dados raw da solicitação
            const assuntoId =
              solicitacao.rawCase?.name_value_list?.a01_assunto_id_c?.value;

            if (assuntoId) {
              const assuntoName = findAssuntoName(assuntoId, listaAssuntos);

              if (assuntoName) {
                // console.log(
                //   "[MinhasSolicitacoes.js] - Assunto encontrado:",
                //   assuntoName
                // );

                return {
                  ...solicitacao,
                  assunto: assuntoName,
                  assuntoId: assuntoId,
                };
              }
            }

            // Se não encontrar o assunto, mantém o original
            console.log(
              "[MinhasSolicitacoes.js] - Assunto não encontrado, mantendo original para a solicitação do protocolo nº: ",
              solicitacao.protocolo
            );

            return {
              ...solicitacao,
              assuntoId: assuntoId || null,
            };
          });

          setData(solicitacoesComAssuntos);
        } else {
          console.warn(
            "[MinhasSolicitacoes.js] - Lista de assuntos não encontrada no storage"
          );
          setData(solicitacoes);
        }

        setError(null);
      } catch (err) {
        console.error("Erro ao carregar solicitações:", err);
        setError("Não foi possível carregar as solicitações. Tente novamente.");
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [idMunicipe, findAssuntoName]
  );

  // Carregar dados iniciais
  useEffect(() => {
    loadSolicitacoes();
  }, [loadSolicitacoes]);

  // Função para refresh
  const handleRefresh = useCallback(() => {
    loadSolicitacoes(true);
  }, [loadSolicitacoes]);

  // Função para copiar protocolo
  const handleCopyProtocolo = useCallback(async (protocolo) => {
    try {
      await Clipboard.setStringAsync(protocolo);
      alert("Protocolo copiado com sucesso!");
    } catch (error) {
      console.error("Erro ao copiar protocolo:", error);
      alert("Erro ao copiar protocolo.");
    }
  }, []);

  // Função para abrir modal
  const handleOpenModal = useCallback((item) => {
    setSelectedSolicitacao(item);
    setModalVisible(true);
    console.log(
      "[MinhasSolicitacoes.js] - Abrindo modal com seguintes anexos:",
      item.attachments
    );
  }, []);

  // Função para fechar modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedSolicitacao(null);
  }, []);

  // Função para navegar para Comunique-se relacionados
  const handleNavigateToComuniqueSeRelacionados = useCallback(
    (protocolo) => {
      console.log(
        "Navegando para NotificationsScreen com protocolo:",
        protocolo
      );
      navigation.navigate("NotificationsScreen", {
        filterByProtocol: protocolo,
        title: `Comunique-se - ${protocolo}`,
      });
    },
    [navigation]
  );

  // Função para mapear status com novos estados
  const getStatusInfo = useCallback((status) => {
    const statusMap = {
      Open_New: { text: "Nova", color: "#007aff", icon: "plus-circle" },
      Open_Assigned: { text: "Atribuída", color: "#ff9500", icon: "user" },
      Open_Pending_Input: {
        text: "Pendente de Informação",
        color: "#ff3b30",
        icon: "help-circle",
      },
      Open_Pending_Research: {
        text: "Em Análise",
        color: "#5856d6",
        icon: "search",
      },
      Closed_Closed: {
        text: "Concluída",
        color: customGreen,
        icon: "check-circle",
      },
      Closed: { text: "Concluída", color: customGreen, icon: "check-circle" },
      Open: { text: "Aberta", color: "#ff9500", icon: "clock" },
      Closed_Rejected: {
        text: "Rejeitada",
        color: customRed,
        icon: "x-circle",
      },
      Open_Onbudsman_Ana: {
        text: "Encaminhada à Ouvidoria",
        color: "#007aff",
        icon: "send",
      },
      Open_Pending_OK: {
        text: "Aguardando aceite",
        color: "#5ac8fa",
        icon: "clock",
      },
    };

    return (
      statusMap[status] || {
        text: status,
        color: darkLight,
        icon: "help-circle",
      }
    );
  }, []);

  // Função para formatar data
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Hoje";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Ontem";
    }

    return dateString;
  }, []);

  // Renderiza um único item da lista de solicitações
  const renderSolicitacaoItem = useCallback(
    ({ item }) => {
      const statusInfo = getStatusInfo(item.statusSol);

      return (
        <TouchableOpacity
          style={styles.solicitacaoItem}
          onPress={() => handleOpenModal(item)}
          onLongPress={() => handleCopyProtocolo(item.protocolo)}
          activeOpacity={0.7}
        >
          {/* Status indicator */}
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: statusInfo.color },
            ]}
          />

          <View style={styles.solicitacaoHeader}>
            {/* Header com Assunto e Status*/}
            <View style={styles.headerAssuntoStatus}>
              {/* Assunto */}
              <View style={styles.assuntoContainer}>
                <Text style={styles.assuntoText} numberOfLines={3}>
                  {item.assunto}
                </Text>
              </View>
              {/* Status */}
              <View style={styles.statusContainer}>
                <View style={styles.statusRow}>
                  <Feather
                    name={statusInfo.icon}
                    size={14}
                    color={statusInfo.color}
                  />
                  <Text
                    style={[styles.statusText, { color: statusInfo.color }]}
                  >
                    {statusInfo.text}
                  </Text>
                </View>
              </View>
            </View>

            {/* Conteúdo com protocolo, data e indicadores de notificação e anexos */}
            <View style={styles.solicitacaoContent}>
              <View style={styles.protocoloDataIndicadores}>
                <Text style={styles.protocoloText} numberOfLines={1}>
                  Protocolo {item.protocolo}
                </Text>
                <Text style={styles.dataText}>
                  Abertura em: {formatDate(item.dia)}
                </Text>
              </View>

              {/* Indicadores */}
              <View style={styles.indicatorsContainer}>
                {/* Indicador de notificações - apenas para não lidas */}
                {(item.hasUnreadNotifications || item.hasReadNotifications) && (
                  <View
                    style={[
                      styles.notificationIndicator,
                      item.hasUnreadNotifications
                        ? styles.unreadNotificationIndicator
                        : styles.readNotificationIndicator,
                    ]}
                  >
                    <Feather
                      name="bell"
                      size={14}
                      color={
                        item.hasUnreadNotifications ? "#ff0000" : "#9e9e9e"
                      }
                    />
                  </View>
                )}

                {/* Indicador de anexos */}
                {item.hasAttachments && (
                  <View style={styles.attachmentIndicator}>
                    <Feather name="paperclip" size={14} color={brand} />
                    {item.attachmentsCount > 1 && (
                      <Text style={styles.attachmentCount}>
                        {item.attachmentsCount}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.chevronContainer}>
            <Feather name="chevron-right" size={20} color={darkLight} />
          </View>
        </TouchableOpacity>
      );
    },
    [handleOpenModal, handleCopyProtocolo, getStatusInfo, formatDate]
  );

  // Componente de loading
  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brand} />
        <Text style={styles.loadingText}>Carregando solicitações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Mensagem de erro */}
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={18} color={customRed} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Lista de solicitações */}
        <FlatList
          data={data}
          renderItem={renderSolicitacaoItem}
          keyExtractor={(item) => item.protocolo}
          contentContainerStyle={[
            styles.listContainer,
            data.length === 0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[brand]}
            />
          }
          ListEmptyComponent={
            !isLoading && (
              <View style={styles.emptyStateContainer}>
                <Feather name="file-text" size={64} color={darkLight} />
                <Text style={styles.emptyStateText}>
                  Você ainda não possui solicitações
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Quando você fizer uma solicitação, ela aparecerá aqui
                </Text>
              </View>
            )
          }
        />

        {/* Modal de detalhes */}
        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <ModalSolicitacao
            handleClose={handleCloseModal}
            protocolo={selectedSolicitacao?.protocolo}
            situacao={selectedSolicitacao?.statusSol}
            dia={selectedSolicitacao?.dia}
            assunto={selectedSolicitacao?.assunto}
            descAssunto={selectedSolicitacao?.descAssunto}
            cep={selectedSolicitacao?.cep}
            logradouro={selectedSolicitacao?.logradouro}
            numero={selectedSolicitacao?.numero}
            complemento={selectedSolicitacao?.complemento}
            bairro={selectedSolicitacao?.bairro}
            anexos={selectedSolicitacao?.attachments || []}
            hasUnreadNotifications={
              selectedSolicitacao?.hasUnreadNotifications || false
            }
            loadingAnexos={false}
            onNavigateToComuniqueSeRelacionados={
              handleNavigateToComuniqueSeRelacionados
            }
          />
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: "#ffebeb",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 5,
  },
  errorText: {
    color: customRed,
    marginLeft: 10,
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  solicitacaoItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  statusIndicator: {
    width: 4,
    backgroundColor: brand,
  },
  solicitacaoHeader: {
    flex: 1,
    padding: 16,
  },
  headerAssuntoStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "left",
    marginBottom: 8,
  },
  assuntoContainer: {
    width: "70%",
  },
  solicitacaoContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  protocoloDataIndicadores: {
    // flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "left",
    marginBottom: 0,
  },
  protocoloText: {
    fontSize: 12,
    color: darkLight,
    marginLeft: 8,
  },
  dataText: {
    fontSize: 12,
    color: darkLight,
    marginLeft: 8,
  },
  assuntoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 0,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  // Container para os indicadores
  indicatorsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  // Indicador de notificações
  notificationIndicator: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  // Estilo para notificações não lidas
  unreadNotificationIndicator: {
    backgroundColor: "#ffee00",
  },
  // Estilo para notificações lidas
  readNotificationIndicator: {
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  // Indicador de anexos
  attachmentIndicator: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  attachmentCount: {
    fontSize: 10,
    fontWeight: "600",
    color: brand,
    marginLeft: 2,
  },
  chevronContainer: {
    justifyContent: "center",
    paddingRight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: primary,
  },
  loadingText: {
    marginTop: 10,
    color: darkLight,
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: darkLight,
    textAlign: "center",
    lineHeight: 20,
  },
});
