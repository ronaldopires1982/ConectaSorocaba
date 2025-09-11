//imports nativos
import { React, useContext } from "react";
import { Alert, View } from "react-native";

// imports de terceiros
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";

// imports locais
import {
  ButtonText,
  Colors,
  Line,
  StyledFormArea,
  StyledButton,
  StyledButtonLogout,
} from "../../components/estilos";
import { SignInContext } from "../../hooks/SignInContext";
import LogoHeader from "../../components/LogoHeader";
import { LogOut } from "../../api/UserService";

// imports de hooks
import useStorage from "../../hooks/useStorage";
import { set } from "react-hook-form";

const { brand, primary } = Colors;

export const Welcome = ({ navigation }) => {
  const { clearItem, getItem } = useStorage();
  const { logContextOut } = useContext(SignInContext);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: primary,
      }}
    >
      <StatusBar style="dark" />

      {/* Header com ícone de menu hamburguer apenas */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          width: "100%",
          paddingHorizontal: 20,
          paddingTop: 40,
          marginTop: 10,
        }}
      >
        <Feather
          name="menu"
          size={30}
          color="#000000"
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
      </View>

      {/* View do conteúdo */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          width: "80%",
          backgroundColor: "transparent",
        }}
      >
        {/* View do LogoHeader */}
        <View
          style={{
            width: "100%",
            flex: 1 / 4,
            justifyContent: "center",
            padding: 20,
            marginTop: 80,
          }}
        >
          <LogoHeader />
        </View>

        {/* View dos botões */}
        <View
          style={{
            width: "100%",
            padding: 10,
            flex: 3 / 4,
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <StyledButton
            onPress={() => navigation.navigate("AbrirSolicitacao1")}
            style={{
              backgroundColor: brand,
              width: "90%",
              height: 100,
            }}
          >
            <ButtonText style={{ fontSize: 20 }}>Nova solicitação</ButtonText>
          </StyledButton>
          <StyledButton
            onPress={() => navigation.navigate("MinhasSolicitacoes")}
            style={{
              backgroundColor: "transparent",
              borderWidth: 2,
              borderColor: brand,
              width: "90%",
              height: 100,
            }}
          >
            <ButtonText style={{ fontSize: 20, color: brand }}>
              Minhas solicitações
            </ButtonText>
          </StyledButton>
        </View>
      </View>
    </View>
  );
};
