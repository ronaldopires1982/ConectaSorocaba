// src/components/CheckboxComponent.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "./estilos";

const { primary, darkLight, customRed, brand } = Colors;

const CheckboxComponent = ({
  label,
  value,
  onValueChange,
  hasError = false,
  disabled = false,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        hasError && styles.containerError,
        disabled && styles.containerDisabled,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          value && styles.checkboxChecked,
          hasError && styles.checkboxError,
          disabled && styles.checkboxDisabled,
        ]}
      >
        {value && <Feather name="check" size={16} color="white" />}
      </View>

      <Text
        style={[
          styles.label,
          hasError && styles.labelError,
          disabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  containerError: {
    // Add any container error styling if needed
  },
  containerDisabled: {
    opacity: 0.6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: darkLight,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginRight: 12,
    marginTop: 2, // Align with first line of text
  },
  checkboxChecked: {
    backgroundColor: brand,
    borderColor: brand,
  },
  checkboxError: {
    borderColor: customRed,
  },
  checkboxDisabled: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    textAlign: "justify",
  },
  labelError: {
    color: customRed,
  },
  labelDisabled: {
    color: "#999",
  },
});

export default CheckboxComponent;
