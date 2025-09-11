import { useContext, createContext } from "react";

/**
 * Contexto para gerenciamento de notificações
 * @typedef {Object} NotificationContextType
 * @property {Object} notification - Notificação atual
 * @property {Object} activeNotification - Notificação ativa sendo exibida
 * @property {boolean} showNotificationModal - Estado de exibição do modal de notificação
 * @property {Function} handleNotification - Função para processar notificações recebidas
 * @property {Function} handleCloseNotificationModal - Função para fechar o modal de notificação
 * @property {Function} markAsRead - Função para marcar notificação como lida
 * @property {Function} solicitarPermissaoNotificacoes - Função para solicitar permissão de notificação
 */

/**
 * Contexto para armazenar estado e funções relacionadas a notificações
 * @type {React.Context<NotificationContextType>}
 */
const NotificationContext = createContext(undefined);

/**
 * Hook para usar o contexto de notificações
 * @returns {NotificationContextType} O contexto de notificações
 * @throws {Error} Se usado fora de um NotificationProvider
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification deve estar contido no NotificationProvider"
    );
  }
  return context;
};

export { NotificationContext };
