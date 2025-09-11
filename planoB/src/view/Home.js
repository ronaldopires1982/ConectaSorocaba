// imports nativos
import { View } from "react-native";
import React, { useEffect } from "react";

// imports de terceiros
import { StatusBar } from "expo-status-bar";

// imports locais
import { ButtonText, Colors, StyledButton } from "../components/estilos";
import LogoHeader from "../components/LogoHeader";

const { brand, primary } = Colors;

/**
 * Tela Home da aplicação
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.navigation - Objeto de navegação
 */
const Home = ({ navigation }) => {
  return (
    // View conteiner
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* View do conteúdo */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          width: "80%",
        }}
      >
        <StatusBar style="dark" backgroundColor="white" />
        {/* View do LogoHeader */}
        <View
          style={{
            flex: 1 / 3,
            justifyContent: "center",
            marginTop: 80,
          }}
        >
          <LogoHeader />
        </View>

        {/* View dos botões */}
        <View
          style={{
            gap: 20,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            flex: 2 / 3,
            paddingHorizontal: 10,
            paddingBottom: 80,
          }}
        >
          <StyledButton
            onPress={() => navigation.navigate("LoginSuiteCRM")}
            style={{
              backgroundColor: brand,
              height: 100,
              width: "90%",
            }}
          >
            <ButtonText style={{ fontSize: 20 }}>Acessar Central156</ButtonText>
          </StyledButton>
        </View>
      </View>
    </View>
  );
};

export default Home;
