// src/components/CartaoCidadao.js
import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SignInContext } from "../hooks/SignInContext";
import { StyledCartaoCidadao } from "./estilos";

const CartaoCidadaoComponent = () => {
  const { user } = useContext(SignInContext);

  // Formata CPF para exibição, caso esteja limpo (XXX.XXX.XXX-XX)
  const formatCPFForDisplay = (cpf) => {
    if (!cpf) return "";
    const cleanCPF = cpf.replace(/\D/g, "");
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Busca o nome completo do munícipe através do contexto (SignInContext)
  const getFullName = () => {
    const firstName = user?.nome || "";
    const lastName = user?.sobrenome || "";
    return `${firstName} ${lastName}`.trim() || "Nome do Cidadão";
  };

  return (
    <View style={styles.container}>
      {/* Imagem do cartão em background */}
      <StyledCartaoCidadao
        source={require("../../assets/img/cartao_cidadao.png")}
        resizeMode="contain"
        style={styles.cardImage}
      />

      {/* Informações do munícipes sobrepostas ao cartão */}
      <View style={styles.overlay}>
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{getFullName()}</Text>
          <Text style={styles.userCPF}>
            CPF: {formatCPFForDisplay(user?.cpf) || "000.000.000-00"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: 200, // Adjust based on your card image dimensions
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  userInfoContainer: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  userCPF: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "monospace", // For better number readability
  },
});

export default CartaoCidadaoComponent;
