// imports nativos
import React, {
  useContext,
  useRef,
  useEffect,
  useCallback,
  useState,
} from "react";
import { navigate } from "../utils/NavigationService";

// imports locais
import { SignInContext } from "../hooks/SignInContext";
import { NotificationContext } from "../hooks/useNotification";
import {
  setupDeviceAndToken,
  solicitarPermissaoNotificacoes,
} from "../utils/NotificationActions";
import {
  setupNotificationListeners,
  removeNotificationListeners,
} from "../utils/NotificationSetup";

// Cria o componente NotificationProvider
export const NotificationProvider = ({ children }) => {
  // Busca o contexto do usuário
  const { user } = useContext(SignInContext);

  // Define variáveis de estado
  const [notification, setNotification] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Variáveis de referência
  const isMounted = useRef(true);
  const listeners = useRef({});
  const initialized = useRef(false);

  // Função para processar notificações recebidas
  const handleNotification = useCallback((notificationData) => {
    // Define como notificação atual
    setNotification(notificationData);

    // Verifica o tipo de notificação
    const notificationType =
      notificationData.request?.content?.data?.notificationType;

    // Mostra modal apenas para certos tipos de notificação quando o app está em primeiro plano
    if (notificationType && notificationType !== "additional_info") {
      setActiveNotification(notificationData);
      setShowNotificationModal(true);
    }
  }, []);

  /**
   * Processa a resposta de toque em uma notificação
   * @param {Object} response - Objeto de resposta da notificação
   */
  const handleNotificationResponse = useCallback(async (response) => {
    try {
      // Obtém dados da notificação
      const data = response.notification.request.content.data;
      console.log("NotificationContext.js: dados da notificação:", data);
      console.log("NotificationContext.js: usuário logado?", user);

      // Determina a navegação baseado no tipo de notificação
      const notificationType = data?.type;

      // Trecho de código para definir navegação ao toque na notificação, com pequeno atraso para garantir que a navegação funcione corretamente
      //       setTimeout(() => {
      //         if (user.isLoggedIn) {
      //           navigate("NotificationsScreen", { dadosNotificacao: data });
      //         } else {
      //           navigate("LoginSuiteCRM");
      //         }
      //
      //         if (notificationType === "additional_info") {
      //           navigate("AdditionalInfoNotification", {
      //             notification: response.notification,
      //           });
      //           return;
      //         }
      //       }, 500);
    } catch (error) {
      console.error(
        "NotificationContext.js: Erro ao processar resposta:",
        error
      );
      navigate("NotificationsScreen");
    }
  }, []);

  // Função para fechar o modal de notificação
  const handleCloseNotificationModal = useCallback(() => {
    setShowNotificationModal(false);
    setActiveNotification(null);
  }, []);

  // useEffect para inicialização
  useEffect(() => {
    console.log("NotificationContext.js: Inicializando provider");

    isMounted.current = true;

    const initializeNotifications = async () => {
      try {
        // Evita inicialização duplicada
        if (initialized.current) return;

        // Configura token e dispositivo
        await setupDeviceAndToken();

        // Configura listeners de notificação
        listeners.current = setupNotificationListeners(
          handleNotification,
          handleNotificationResponse,
          user
        );

        initialized.current = true;
        console.log(
          "NotificationContext.js: Provider inicializado com sucesso"
        );
      } catch (error) {
        console.log("NotificationContext.js: Erro na inicialização:", error);
      }
    };

    // Configura como as notificações devem aparecer no app em segundo plano
    // setupNotifications();

    initializeNotifications();

    // Limpeza ao desmontar, somente ao fechar o aplicativo
    return () => {
      console.log(
        "NotificationContext.js: Desmontando provider (app fechando)"
      );
      isMounted.current = false;
      if (listeners.current) {
        removeNotificationListeners(listeners.current);
        listeners.current = null;
      }
    };
  }, []);

  // useEffect para atualizar listeners quando o usuário muda
  useEffect(() => {
    // só atualiza se os listeners foram inicializados
    if (initialized.current && listeners.current) {
      console.log(
        "NotificationContext.js: Atualizando usuário nos listeners:",
        user?.idMunicipe
      );

      // remove listeners antigos
      removeNotificationListeners(listeners.current);

      // configura novos listeners com o novo usuário
      listeners.current = setupNotificationListeners(
        handleNotification,
        handleNotificationResponse,
        user
      );
    }
  }, [user]); // executa o useEffect quando o usuário muda

  // Valor do contexto com memoização para evitar renderizações desnecessárias
  const contextValue = React.useMemo(
    () => ({
      notification,
      activeNotification,
      showNotificationModal,
      handleNotification,
      handleCloseNotificationModal,
      solicitarPermissaoNotificacoes,
    }),
    [
      notification,
      activeNotification,
      showNotificationModal,
      handleCloseNotificationModal,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
