// src/components/CartaoCidadao.js
import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SignInContext } from "../hooks/SignInContext";
import { SelfieManager } from "../utils/SelfieManager";

const CartaoCidadaoComponent = () => {
  const { user } = useContext(SignInContext);
  const [selfieUri, setSelfieUri] = useState(null);
  const [isLoadingSelfie, setIsLoadingSelfie] = useState(true);

  // Formata CPF para exibição, caso esteja limpo (XXX.XXX.XXX-XX)
  const formatCPFForDisplay = (cpf) => {
    if (!cpf) return "";
    const cleanCPF = cpf.replace(/\D/g, ""); // Remove qualquer caractere não numérico
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Busca o nome completo do munícipe através do contexto (SignInContext)
  const getFullName = () => {
    const firstName = user?.nome || "";
    const lastName = user?.sobrenome || "";
    return `${firstName} ${lastName}`.trim() || "Nome do Cidadão";
  };

  // Busca a selfie do usuário ao montar o componente
  const loadUserSelfie = async () => {
    try {
      setIsLoadingSelfie(true);
      const userCPF = user?.cpf?.replace(/\D/g, ""); // Remove qualquer caractere não numérico

      if (userCPF) {
        console.log("[CartaoCidadao] - Carregando selfie para CPF:", userCPF);
        const storedSelfieUri = await SelfieManager.getSelfie(userCPF);

        if (storedSelfieUri) {
          console.log("[CartaoCidadao] - Selfie encontrada:", storedSelfieUri);
          setSelfieUri(storedSelfieUri);
        } else {
          console.log(
            "[CartaoCidadao] - Nenhuma selfie encontrada para este CPF."
          );
          setSelfieUri(null);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar selfie do usuário:", error);
      setSelfieUri(null);
    } finally {
      setIsLoadingSelfie(false);
    }
  };

  useEffect(() => {
    if (user?.cpf) {
      loadUserSelfie();
    } else {
      setIsLoadingSelfie(false);
    }
  }, [user?.cpf]);

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
          {/* Selfie do munícipe */}
          <View style={styles.selfieContainer}>
            {selfieUri ? (
              <Image
                source={{ uri: selfieUri }}
                style={styles.selfieImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderAvatar}>
                {/* Busca as iniciais do nome para exibir como placeholder do avatar */}
                <Text style={styles.placeholderText}>
                  {getFullName()
                    .split(" ")
                    .map((name) => name.charAt(0))
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          {/* Nome e CPF do munícipe */}
          <View style={styles.textInfoContainer}>
            <Text style={styles.userName}>{getFullName()}</Text>
            <Text style={styles.userCPF}>
              CPF: {formatCPFForDisplay(user?.cpf) || "000.000.000-00"}
            </Text>
          </View>
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
    flexDirection: "column",
    alignItems: "flex-start",
    // backgroundColor: "rgba(255, 255, 255, 0.8)", // Fundo branco semi-transparente para melhor legibilidade
    paddingLeft: 20,
    paddingBottom: 20,
    paddingRight: 20,
  },
  selfieContainer: {
    marginBottom: 10,
  },
  selfieImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  placeholderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  textInfoContainer: {
    alignItems: "flex-start",
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
