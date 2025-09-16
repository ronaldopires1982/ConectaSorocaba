// src/components/CartaoCidadao.js
import React, { useContext } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SignInContext } from "../hooks/SignInContext";

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
      <Image
        source={require("../../assets/img/cartao_cidadao.png")}
        resizeMode="cover"
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
    aspectRatio: 1.6, // Mantém a proporção do cartão (largura:altura)
    alignSelf: "center", // alinha o cartão horizontalmente
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15, //mantendo a consistência do arredondamento com o container
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  userInfoContainer: {
    paddingLeft: 20,
    paddingBottom: 20,
    paddingRight: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userCPF: {
    fontSize: 14,
    color: "#333333",
    fontFamily: "monospace", // Tipo de fonte adequada para números
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default CartaoCidadaoComponent;
