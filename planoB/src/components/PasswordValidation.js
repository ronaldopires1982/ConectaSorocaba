import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "./estilos";

const PasswordValidation = ({ password }) => {
  const { customGreen, customRed } = Colors;

  const validations = [
    {
      text: "No mínimo 8 (oito) caracteres",
      isValid: password.length >= 8,
    },
    {
      text: "Pelo menos 2 (dois) números",
      isValid: (password.match(/\d/g) || []).length >= 2,
    },
    {
      text: "Pelo menos 1 (uma) letra minúscula",
      isValid: /[a-z]/.test(password),
    },
    {
      text: "Pelo menos 1 (uma) letra maiúscula",
      isValid: /[A-Z]/.test(password),
    },
    {
      text: "Pelo menos 1 (um) caracter especial",
      isValid: /[!@#$%&*(),.?":{}|<>]/.test(password),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Sua senha deverá possuir:</Text>
      {validations.map((validation, index) => (
        <View key={index} style={styles.validationRow}>
          <Feather
            name={validation.isValid ? "check-circle" : "x-circle"}
            size={16}
            color={validation.isValid ? customGreen : customRed}
            style={styles.icon}
          />
          <Text
            style={[
              styles.validationText,
              { color: validation.isValid ? customGreen : customRed },
            ]}
          >
            {validation.text}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
  },
  titleText: {
    fontSize: 16,
    flex: 1,
    marginBottom: 10,
  },
  validationText: {
    fontSize: 14,
    flex: 1,
  },
});

export default PasswordValidation;
