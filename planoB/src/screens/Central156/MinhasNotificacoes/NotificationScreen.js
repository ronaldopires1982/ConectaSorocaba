import React, { useState, useEffect, useContext } from "react";
import {
  Platform,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors, ButtonText, StyledButton } from "../../../components/estilos";
import { SignInContext } from "../../../hooks/SignInContext";

// Importa componentes de notificação
import NotificationManager from "../../../components/notifications/NotificationManager";
import NotificationDemo from "../../../components/notifications/NotificationDemo";
import { markNotificationReadStatus } from "../../../utils/NotificationActions";
import { fetchNotificationHistory } from "../../../api/NotificationService";

const { brand, primary, darkLight } = Colors;

const NotificationsScreen = ({ navigation, route }) => {
  const { user } = useContext(SignInContext);

  // Get filter parameters from route
  const filterByProtocol = route?.params?.filterByProtocol;
  const screenTitle = route?.params?.title || "Minhas Notificações";

  // Variáveis de estado locais para lidar com as notificações
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [groupedNotifications, setGroupedNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());

  const loadNotifications = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const userId = user?.idMunicipe || null;
      const result = await fetchNotificationHistory(userId);

      if (result.error) {
        throw new Error(result.error);
      }

      const notificationList = result.notifications || [];
      setNotifications(notificationList);

      // Group notifications by protocol number
      let grouped = groupNotificationsByProtocol(notificationList);

      // Apply protocol filter if specified
      if (filterByProtocol) {
        console.log(
          "[NotificationScreen.js] - Filtering by protocol:",
          filterByProtocol
        );
        grouped = grouped.filter(
          (group) => group.protocolNumber === filterByProtocol
        );
        console.log(
          "[NotificationScreen.js] - Filtered groups:",
          grouped.length
        );
      }

      setGroupedNotifications(grouped);

      // Set sections as expanded by default
      if (grouped.length > 0) {
        if (filterByProtocol) {
          // When filtering by protocol, expand the specific protocol
          setExpandedSections(new Set([filterByProtocol]));
        } else {
          // Normal behavior - expand first section
          setExpandedSections(new Set([grouped[0].protocolNumber]));
        }
      }

      setError(null);
    } catch (err) {
      console.error("Erro ao carregar histórico de notificações:", err);
      setError(
        "Não foi possível carregar as notificações. Por favor, tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Função auxiliar para agrupar notificações por número de protocolo
  const groupNotificationsByProtocol = (notifications) => {
    const groups = {};

    notifications.forEach((notification) => {
      // Extract protocol number from different possible structures
      const protocolNumber =
        notification?.request?.content?.data?.protocolNumber || "Sem protocolo";

      console.log(
        "[NotificationScreen.js] - Notificação:",
        notification.request.content.data.notificationType
      );

      if (!groups[protocolNumber]) {
        groups[protocolNumber] = {
          protocolNumber,
          notifications: [],
          unreadCount: 0,
          latestDate: null,
          // Try to get case information from the first notification
          caseSubject:
            notification?.parentInfo?.case_name ||
            notification?.parentInfo?.task_name ||
            "Solicitação sem assunto",
          caseCreatedDate: notification?.receivedAt || "",
        };
      }

      groups[protocolNumber].notifications.push(notification);

      if (!notification.isRead) {
        groups[protocolNumber].unreadCount++;
      }

      // Update latest date
      const notificationDate = new Date(notification.receivedAt || new Date());
      if (
        !groups[protocolNumber].latestDate ||
        notificationDate > groups[protocolNumber].latestDate
      ) {
        groups[protocolNumber].latestDate = notificationDate;
      }
    });

    // Converte em um array e ordena pela data mais recente
    return Object.values(groups).sort((a, b) => b.latestDate - a.latestDate);
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.idMunicipe, filterByProtocol]);

  const clearFilter = () => {
    // Clear filter and reload all notifications
    navigation.setParams({ filterByProtocol: null, title: null });
    loadNotifications();
  };

  // Update screen title when filtering
  useEffect(() => {
    if (filterByProtocol && navigation) {
      navigation.setOptions({
        title: screenTitle,
      });
    }
  }, [filterByProtocol, screenTitle, navigation]);

  const marcarComoLida = async (notificationId) => {
    if (!notificationId) {
      console.warn("ID da notificação não fornecido.");
      return false;
    }

    const userId = user?.idMunicipe || null;
    const success = await markNotificationReadStatus(notificationId, userId);

    if (success) {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.messageId === notificationId
            ? {
                ...notification,
                isRead: true,
                readDate: new Date().toISOString(),
              }
            : notification
        )
      );

      // Update grouped notifications as well
      const updatedNotifications = notifications.map((notification) =>
        notification.messageId === notificationId
          ? {
              ...notification,
              isRead: true,
              readDate: new Date().toISOString(),
            }
          : notification
      );

      let regrouped = groupNotificationsByProtocol(updatedNotifications);

      // Apply filter again if needed
      if (filterByProtocol) {
        regrouped = regrouped.filter(
          (group) => group.protocolNumber === filterByProtocol
        );
      }

      setGroupedNotifications(regrouped);
    }

    return success;
  };

  const handleRefresh = () => {
    loadNotifications(true);
  };

  const handleNotificationPress = (item) => {
    setSelectedNotification(item);
    setShowNotificationModal(true);

    // marca como lida, caso não ainda não tenha sido lida
    if (!item.isRead) {
      marcarComoLida(item.messageId);
    }
  };

  /**
   * Função callback auxiliar para atualizar as variáveis de estado (notifications e groupedNotifications)
   * com a resposta do aceite da notificação, sem a necessidade de atualizar a tela, refazendo a chamada de API
   * @param {string} notificationId - ID da notificação, a ser utilizado no map dos arrays para atualização local do objeto
   * @param {string} response  - "Sim" or "Não"
   * @returns {void}
   */
  const handleNotificationAcceptanceResponse = (notificationId, response) => {
    // Atualiza o estado da variável de estado com a resposta da notificação
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.messageId === notificationId
          ? {
              ...notification,
              request: {
                ...notification.request,
                content: {
                  ...notification.request.content,
                  data: {
                    ...notification.request.content.data,
                    respAceite: response, // "Sim" or "Não"
                  },
                },
              },
            }
          : notification
      )
    );

    // Atualiza também o estado da variável de estado das notificações agrupadas
    setGroupedNotifications((prevGrouped) =>
      prevGrouped.map((group) => ({
        ...group,
        notifications: group.notifications.map((notification) =>
          notification.messageId === notificationId
            ? {
                ...notification,
                request: {
                  ...notification.request,
                  content: {
                    ...notification.request.content,
                    data: {
                      ...notification.request.content.data,
                      respAceite: response, // "Sim" or "Não"
                    },
                  },
                },
              }
            : notification
        ),
      }))
    );
  };

  /**
   * Função callback auxiliar para atualizar as variáveis de estado (notifications e groupedNotifications)
   * com a resposta da notificação, sem a necessidade de atualizar a tela e refazer a chamada de API
   * @param {string} notificationId - ID da notificação, a ser utilizado no map dos arrays para atualização
   * local do objeto
   * @param {string} response  - Resposta da notificação feita pelo munícipe
   * @returns {void}
   */
  const handleAdditionalInfoAlreadyAnswered = (notificationId, response) => {
    console.log(
      "[NotificationScreen.js] - Atualizando notificação localmente:",
      { notificationId, response: response.substring(0, 50) + "..." }
    );

    // Atualiza o estado da variável de estado com a resposta da notificação
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.messageId === notificationId
          ? {
              ...notification,
              request: {
                ...notification.request,
                content: {
                  ...notification.request.content,
                  data: {
                    ...notification.request.content.data,
                    respMunicipe: response,
                  },
                },
              },
            }
          : notification
      )
    );

    // Atualiza também o estado da variável de estado das notificações agrupadas
    setGroupedNotifications((prevGrouped) =>
      prevGrouped.map((group) => ({
        ...group,
        notifications: group.notifications.map((notification) =>
          notification.messageId === notificationId
            ? {
                ...notification,
                request: {
                  ...notification.request,
                  content: {
                    ...notification.request.content,
                    data: {
                      ...notification.request.content.data,
                      respMunicipe: response,
                    },
                  },
                },
              }
            : notification
        ),
      }))
    );
  };

  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    setSelectedNotification(null);
  };

  // Alterna abertura e fechamento do colapsible
  const toggleSection = (protocolNumber) => {
    setExpandedSections((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(protocolNumber)) {
        newExpanded.delete(protocolNumber);
      } else {
        newExpanded.add(protocolNumber);
      }
      return newExpanded;
    });
  };

  // Formata o horário para o padrão brasileiro
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";

    // Verifica se a notificação é do dia de hoje
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return `Hoje, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    }

    // Verifica se a notificação foi de ontem
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return `Ontem, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    }

    // Formada a data para o formato dd/mm/yyyy, hh:mm, para notificações mais antigas
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  // Format date for case creation
  const formatCaseDate = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";

    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  };

  const mapNotificationType = (type) => {
    const typeMap = {
      Informativo: "informative",
      aceite: "resolution_acceptance",
      pedido_info: "additional_info",
      pesquisa: "satisfaction_survey",
    };

    return typeMap[type] || "informative";
  };

  // Function to get the correct icon based on notification type
  const getNotificationIcon = (notificationType) => {
    const mappedType = mapNotificationType(notificationType);

    switch (mappedType) {
      case "resolution_acceptance":
        return "check-circle";
      case "additional_info":
        return "help-circle";
      case "satisfaction_survey":
        return "star";
      case "informative":
      default:
        return "bell";
    }
  };

  // renderiza os itens de notificação dentro dos grupos
  const renderNotificationItem = (item) => {
    // Extract notification data - this should match your API response structure
    const notificationData = item.request?.content?.data || item;
    const notificationType = notificationData.notificationType || "";

    // Get the correct icon based on notification type
    const icon = getNotificationIcon(notificationType);

    return (
      <TouchableOpacity
        key={item.messageId || item.notificationId}
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          <Feather name={icon} size={16} color={brand} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.request.content.data.notificationType || "Notificação"}
          </Text>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {item.request?.content?.body || item.body || ""}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTimestamp(item.receivedAt || new Date())}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  // renderiza um grupo de notificações (cartão principal por caso)
  const renderCaseCard = ({ item: group, index }) => {
    const hasUnread = group.unreadCount > 0;
    const isExpanded = expandedSections.has(group.protocolNumber);

    return (
      <View style={[styles.caseCard, hasUnread && styles.caseCardUnread]}>
        {/* Case Header - Clickable to expand/collapse */}
        <TouchableOpacity
          style={styles.caseHeader}
          onPress={() => toggleSection(group.protocolNumber)}
          activeOpacity={0.7}
        >
          <View style={styles.caseHeaderLeft}>
            <Feather name="folder" size={20} color={brand} />
            <View style={styles.caseHeaderText}>
              <Text style={styles.caseSubjectTitle} numberOfLines={2}>
                {group.notifications[0].parentInfo.task_name}
              </Text>
              <Text style={styles.caseDate}>
                Protocolo: {group.protocolNumber}
              </Text>
              <Text style={styles.caseDate}>
                Criado em: {formatCaseDate(group.caseCreatedDate)}
              </Text>
            </View>
          </View>
          <View style={styles.caseHeaderRight}>
            {hasUnread && (
              <View style={styles.caseUnreadBadge}>
                <Text style={styles.caseUnreadText}>{group.unreadCount}</Text>
              </View>
            )}
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={darkLight}
              style={styles.expandIcon}
            />
          </View>
        </TouchableOpacity>

        {/* Collapsible Notifications Section */}
        {isExpanded && (
          <View style={styles.notificationsContainer}>
            <Text style={styles.notificationsLabel}>Notificações:</Text>
            <ScrollView
              style={styles.notificationsScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              // Prevent scroll conflict with main FlatList
              onScrollBeginDrag={() => {
                // This prevents the parent FlatList from scrolling when we start scrolling the nested ScrollView
              }}
              // Add momentum handling to prevent refresh control activation
              scrollEventThrottle={16}
              onMomentumScrollEnd={(event) => {
                // Ensure we don't trigger refresh when scrolling back to top
                const { contentOffset } = event.nativeEvent;
                if (contentOffset.y <= 0) {
                  // At the top, but don't trigger refresh
                }
              }}
            >
              {group.notifications.map((notification) =>
                renderNotificationItem(notification)
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Filter chip when filtering */}
        {filterByProtocol && (
          <View style={styles.filterContainer}>
            <View style={styles.filterChip}>
              <Text style={styles.filterText}>
                Filtrado pelo protocolo: {filterByProtocol}
              </Text>
              <TouchableOpacity
                style={styles.filterCloseButton}
                onPress={clearFilter}
              >
                <Feather name="x" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={18} color={Colors.customRed} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={brand} />
            <Text style={styles.loadingText}>Carregando notificações...</Text>
          </View>
        ) : (
          <FlatList
            data={groupedNotifications}
            renderItem={renderCaseCard}
            keyExtractor={(item) => item.protocolNumber}
            contentContainerStyle={[
              styles.listContent,
              groupedNotifications.length === 0 && styles.emptyList,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[brand]}
              />
            }
            // Disable scroll when any section is being scrolled
            scrollEnabled={!refreshing}
            ListEmptyComponent={
              !isLoading && (
                <View style={styles.emptyStateContainer}>
                  <Feather name="bell-off" size={64} color={darkLight} />
                  <Text style={styles.emptyStateText}>
                    {filterByProtocol
                      ? `Nenhuma notificação encontrada para o protocolo ${filterByProtocol}`
                      : "Você ainda não recebeu nenhuma notificação"}
                  </Text>
                </View>
              )
            }
          />
        )}
      </SafeAreaView>

      {/* Notification Detail Modal */}
      <NotificationManager
        visible={showNotificationModal}
        notification={selectedNotification}
        onClose={handleCloseNotificationModal}
        onNotificationAcceptanceResponse={handleNotificationAcceptanceResponse}
        onAdditionalInfoAlreadyAnswered={handleAdditionalInfoAlreadyAnswered}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: primary,
    alignItems: "center", // Center the filter chip
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(252, 237, 216, 0.863)", // Very subtle orange background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.3)", // Subtle orange border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    color: "#666", // Darker text since background is very light now
    fontSize: 14,
    fontWeight: "400", // Regular font weight
    marginRight: 8,
  },
  filterCloseButton: {
    padding: 2,
  },
  listContent: {
    padding: 15,
    paddingBottom: 80, // Extra padding at bottom for footer buttons
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },

  // Case Card styles
  caseCard: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  caseCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: brand,
  },
  caseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  caseHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  caseHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  caseHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  caseSubjectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  caseProtocol: {
    fontSize: 12,
    color: darkLight,
    fontStyle: "italic",
  },
  caseDate: {
    fontSize: 12,
    color: darkLight,
    fontStyle: "italic",
  },
  caseUnreadBadge: {
    backgroundColor: brand,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
    marginRight: 8,
  },
  caseUnreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  expandIcon: {
    marginLeft: 4,
  },

  // Notifications container styles
  notificationsContainer: {
    padding: 16,
  },
  notificationsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  notificationsScrollView: {
    maxHeight: 200, // Fixed height for scroll area
    backgroundColor: "#fafafa",
    borderRadius: 8,
    paddingHorizontal: 4,
  },

  // Individual notification styles (inside cards)
  notificationItem: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    marginVertical: 2,
    marginHorizontal: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    backgroundColor: "#f0f8ff",
    borderLeftWidth: 3,
    borderLeftColor: brand,
  },
  notificationIcon: {
    marginRight: 10,
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 3,
    color: "#333",
  },
  notificationBody: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 10,
    color: darkLight,
    alignSelf: "flex-end",
  },
  unreadIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: brand,
    position: "absolute",
    top: 12,
    right: 8,
  },

  // Other styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: darkLight,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: darkLight,
    textAlign: "center",
    marginTop: 20,
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
    color: Colors.customRed,
    marginLeft: 10,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  demoButton: {
    backgroundColor: brand,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  demoButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "500",
  },
  demoModeButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: brand,
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default NotificationsScreen;
