// src/components/CartaoCidadao.js
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SignInContext } from "../hooks/SignInContext";
import { SelfieManager } from "../utils/SelfieManager";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CartaoCidadaoComponent = ({ isFullScreen = false }) => {
  const { user } = useContext(SignInContext);
  const navigation = useNavigation();
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

  const handleCardPress = () => {
    if (!isFullScreen) {
      navigation.navigate("CartaoFullScreen");
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (user?.cpf) {
      loadUserSelfie();
    } else {
      setIsLoadingSelfie(false);
    }
  }, [user?.cpf]);

  // Estilos dinâmicos para o modo full screen
  const containerStyle = [
    isFullScreen ? styles.containerFullScreen : styles.container,
  ];

  const cardImageStyle = [
    isFullScreen ? styles.cardImageFullScreen : styles.cardImage,
  ];

  const userInfoContainerStyle = [
    isFullScreen
      ? styles.userInfoContainerFullScreen
      : styles.userInfoContainer,
  ];

  const selfieContainerStyle = [
    isFullScreen ? styles.selfieContainerFullScreen : styles.selfieContainer,
  ];

  const selfieImageStyle = [
    isFullScreen ? styles.selfieImageFullScreen : styles.selfieImage,
  ];

  const placeholderAvatarStyle = [
    isFullScreen
      ? styles.placeholderAvatarFullScreen
      : styles.placeholderAvatar,
  ];

  const placeholderTextStyle = [
    isFullScreen ? styles.placeholderTextFullScreen : styles.placeholderText,
  ];

  const userNameStyle = [
    isFullScreen ? styles.userNameFullScreen : styles.userName,
  ];

  const userCPFStyle = [
    isFullScreen ? styles.userCPFFullScreen : styles.userCPF,
  ];

  const CardWrapper = isFullScreen ? View : TouchableOpacity;

  return (
    <CardWrapper
      style={containerStyle}
      onPress={handleCardPress}
      activeOpacity={!isFullScreen ? 0.8 : 1}
    >
      {/* Imagem do cartão em background */}
      <Image
        source={require("../../assets/img/cartao_cidadao.png")}
        resizeMode="cover"
        style={cardImageStyle}
      />

      {/* Informações do munícipes sobrepostas ao cartão */}
      <View style={styles.overlay}>
        <View style={userInfoContainerStyle}>
          {/* Selfie do munícipe */}
          <View style={selfieContainerStyle}>
            {selfieUri ? (
              <Image
                source={{ uri: selfieUri }}
                style={selfieImageStyle}
                resizeMode="cover"
              />
            ) : (
              <View style={placeholderAvatarStyle}>
                {/* Busca as iniciais do nome para exibir como placeholder do avatar */}
                <Text style={placeholderTextStyle}>
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
            <Text style={userNameStyle}>{getFullName()}</Text>
            <Text style={userCPFStyle}>
              CPF: {formatCPFForDisplay(user?.cpf) || "000.000.000-00"}
            </Text>
          </View>
        </View>
      </View>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  // Estilos para exibição normal
  container: {
    position: "relative",
    width: "100%",
    aspectRatio: 1.6,
    alignSelf: "center",
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
    borderRadius: 15,
  },
  userInfoContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: 20,
    paddingBottom: 20,
    paddingRight: 20,
  },
  selfieContainer: {
    marginBottom: 10,
  },
  selfieImage: {
    width: 75,
    height: 75,
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
    fontFamily: "monospace",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Estilos para exibição em tela cheia
  containerFullScreen: {
    position: "relative",
    width: SCREEN_HEIGHT * 0.65,
    height: (SCREEN_HEIGHT * 0.65) / 1.6,
    alignSelf: "center",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
    transform: [{ rotate: "90deg" }],
  },
  cardImageFullScreen: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  userInfoContainerFullScreen: {
    flexDirection: "column",
    alignItems: "center",
    paddingLeft: 40,
    paddingBottom: 30,
    paddingRight: 40,
    alignItems: "flex-start",
  },
  selfieContainerFullScreen: {
    marginRight: 30,
    marginBottom: 15,
  },
  selfieImageFullScreen: {
    width: 120,
    height: 120,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  placeholderAvatarFullScreen: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  placeholderTextFullScreen: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
  },
  userNameFullScreen: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
    textShadowColor: "rgba(255, 255, 255, 0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  userCPFFullScreen: {
    fontSize: 22,
    color: "#333333",
    fontFamily: "monospace",
    textShadowColor: "rgba(255, 255, 255, 0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Estilos compartilhados
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  textInfoContainer: {
    alignItems: "flex-start",
  },
});

export default CartaoCidadaoComponent;
