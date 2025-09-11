// src/components/notifications/InformativeNotification.js
import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors, ButtonText } from "../../components/estilos";

const { brand, primary, darkLight } = Colors;

const InformativeNotification = ({ visible, onClose, notification }) => {
  // Extract notification data from the payload
  const title = notification?.request?.content?.title || "Notificação";
  const body = notification?.request?.content?.body || "";
  const data = notification?.request?.content?.data || {};

  // Format the timestamp if available
  const timestamp = notification?.date
    ? new Date(notification.date).toLocaleString()
    : new Date().toLocaleString();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header with icon and close button */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Feather name="bell" size={24} color={brand} />
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Notification body */}
          <View style={styles.body}>
            <Text style={styles.bodyText}>{body}</Text>

            {/* Render any additional data if needed */}
            {data.additionalInfo && (
              <Text style={styles.additionalInfo}>{data.additionalInfo}</Text>
            )}

            {/* Display any custom fields */}
            {data.protocolNumber && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Protocolo:</Text>
                <Text style={styles.dataValue}>{data.protocolNumber}</Text>
              </View>
            )}

            {data.status && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Status:</Text>
                <Text style={styles.dataValue}>{data.status}</Text>
              </View>
            )}

            <Text style={styles.timestamp}>Recebido em: {timestamp}</Text>
          </View>

          {/* Action button */}
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <ButtonText>Fechar</ButtonText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: primary,
    borderRadius: 10,
    width: "90%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: brand,
    marginLeft: 10,
  },
  body: {
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  additionalInfo: {
    fontSize: 14,
    fontStyle: "italic",
    color: darkLight,
    marginTop: 10,
  },
  dataRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 5,
  },
  dataValue: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: darkLight,
    marginTop: 15,
    fontStyle: "italic",
    textAlign: "right",
  },
  button: {
    backgroundColor: brand,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default InformativeNotification;
