import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Keyboard } from "react-native";
import { Octicons, Ionicons } from "@expo/vector-icons";
import {
  LeftIcon,
  RightIcon,
  StyledTextInput,
  StyledInputLabel,
  Colors,
} from "./estilos";

const { brand, darkLight } = Colors;

const PasswordInput = ({
  onChangeText,
  value,
  disabled,
  icon,
  label,
  placeholder,
  placeholderTextColor,
  border,
  borderColor,
  ...props
}) => {
  const [hidePassword, setHidePassword] = useState(true);
  const textInputRef = useRef(null);

  const handlePasswordVisibilityToggle = () => {
    setHidePassword((prevState) => !prevState);
    // Focus the text input to keep the keyboard open
    textInputRef.current.focus();
  };

  return (
    <View>
      <LeftIcon>
        <Octicons name={icon} size={26} color={brand} />
      </LeftIcon>
      <StyledInputLabel>{label}</StyledInputLabel>
      <StyledTextInput
        ref={textInputRef}
        secureTextEntry={hidePassword}
        onChangeText={onChangeText}
        value={value}
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        border={border}
        borderColor={borderColor}
        style={[props.style, disabled && { opacity: 0.75 }]}
      />
      <TouchableOpacity
        onPress={handlePasswordVisibilityToggle}
        style={{
          position: "absolute",
          right: 8,
        }}
      >
        <RightIcon onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? "eye-off" : "eye"}
            size={30}
            color={darkLight}
          />
        </RightIcon>
      </TouchableOpacity>
    </View>
  );
};

export default PasswordInput;
