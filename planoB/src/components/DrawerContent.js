// imports nativos
import React, { useContext, useState } from "react";
import { Alert, Linking, View, StyleSheet } from "react-native";

// imports de terceiros
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// imports locais
import { SignInContext } from "../hooks/SignInContext";
import { PageLogo } from "../components/estilos";
import { LogOut } from "../api/UserService";
import useStorage from "../hooks/useStorage";

const DrawerLayout = ({ icon, label, navigateTo, isExternalLink }) => {
  const navigation = useNavigation();

  const handlePress = async () => {
    if (isExternalLink) {
      try {
        setTimeout(async () => {
          navigation.dispatch(DrawerActions.closeDrawer());
        }, 200);
        setTimeout(async () => {
          const supported = await Linking.canOpenURL(navigateTo);
          if (supported) {
            await Linking.openURL(navigateTo);
          } else {
            console.log("Não foi possível navegar para: " + navigateTo);
          }
        }, 800);
      } catch (error) {
        console.error("Erro ao navegar para: " + navigateTo, error);
      }
    } else {
      navigation.navigate(navigateTo);
    }
  };

  return (
    <DrawerItem
      icon={({ color, size }) => <Icon name={icon} color={color} size={size} />}
      label={label}
      onPress={handlePress}
    />
  );
};

const DrawerItems = ({ isLoggedIn }) => {
  const drawerList = !isLoggedIn
    ? [
        {
          icon: "login",
          label: "Acessar Central156",
          navigateTo: "LoginSuiteCRM",
          isExternalLink: false,
        },
        {
          icon: "account-plus-outline",
          label: "Criar novo cadastro",
          navigateTo: "SignUp",
          isExternalLink: false,
        },
        {
          icon: "file-search-outline",
          label: "Consulta por Protocolo",
          navigateTo: "ConsultaProtocolo",
          isExternalLink: false,
        },
        {
          icon: "script-text-outline",
          label: "Carta de Serviços",
          navigateTo: "MenuGrupoServ",
          isExternalLink: false,
        },
      ]
    : [
        {
          icon: "account-circle-outline",
          label: "Meu cadastro",
          navigateTo: "Profile",
          isExternalLink: false,
        },
        {
          icon: "plus-circle-outline",
          label: "Nova solicitação",
          navigateTo: "AbrirSolicitacao1",
          isExternalLink: false,
        },
        {
          icon: "folder-text-outline",
          label: "Minhas solicitações",
          navigateTo: "MinhasSolicitacoes",
          isExternalLink: false,
        },
        {
          icon: "bell-outline",
          label: "Comunique-se",
          navigateTo: "NotificationsScreen",
          isExternalLink: false,
        },
        {
          icon: "file-search-outline",
          label: "Consulta por Protocolo",
          navigateTo: "ConsultaProtocolo",
          isExternalLink: false,
        },
        {
          icon: "script-text-outline",
          label: "Carta de Serviços",
          navigateTo: "MenuGrupoServ",
          isExternalLink: false,
        },
      ];

  return drawerList.map((el, i) => {
    return (
      <DrawerLayout
        key={i}
        icon={el.icon}
        label={el.label}
        navigateTo={el.navigateTo}
        isExternalLink={el.isExternalLink}
      />
    );
  });
};

function DrawerContent(props) {
  const navigation = useNavigation();
  const { user, logContextOut } = useContext(SignInContext);
  const { getItem, clearItem } = useStorage();

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: async () => {
            navigation.dispatch(DrawerActions.closeDrawer());

            setTimeout(async () => {
              try {
                const token = await getItem("@access_token");
                const client_id = process.env.EXPO_PUBLIC_DJANGO_CLIENT_ID;
                const client_secret =
                  process.env.EXPO_PUBLIC_DJANGO_CLIENT_SECRET;

                result = await LogOut(token, client_id, client_secret);
                console.log("DrawerContent.js: Logout iniciado...");

                if (result.status == "sucesso") {
                  console.log("DrawerContent.js:", result.message);
                } else {
                  console.log("DrawerContent.js: Logout falhou!");
                }
              } catch (error) {
                console.error("DrawerContent.js: Erro ao fazer logout:", error);
              } finally {
                logContextOut(); // sinaliza ao SignInContext que o usuário deseja sair
                console.log(
                  "DrawerContent.js: Logout realizado no SignInContext..."
                );

                console.log(
                  "DrawerContent.js: Limpando tokens no AsyncStorage..."
                );
                await clearItem("@access_token"); // Limpa o token de acesso do AsyncStorage
                await clearItem("@refresh_token"); // Limpa o token de refresh do AsyncStorage

                console.log(
                  "DrawerContent.js: access_token após login:",
                  await getItem("@access_token")
                );
                console.log(
                  "DrawerContent.js: refresh_token após login:",
                  await getItem("@refresh_token")
                );

                console.log(
                  "DrawerContent.js: Navegando para tela de login..."
                );
                // Navigate to the login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Home" }],
                });
              }
            }, 300);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <TouchableOpacity activeOpacity={0.8}>
            <View style={styles.userInfoSection}>
              <View style={{ flexDirection: "row", marginTop: 15 }}>
                <PageLogo
                  style={{
                    width: 280,
                    height: 100,
                    alignSelf: "left",
                  }}
                  resizeMode="contain"
                  source={require("../assets/img/Central156_com_brasao.png")}
                />
                <View
                  style={{
                    marginLeft: 10,
                    flexDirection: "column",
                  }}
                ></View>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.drawerSection}>
            <DrawerItems isLoggedIn={user.isLoggedIn} />
          </View>
        </View>
      </DrawerContentScrollView>
      {user.isLoggedIn && (
        <View style={styles.bottomDrawerSection}>
          <DrawerItem
            icon={({ color, size }) => (
              <Icon name="exit-to-app" color={color} size={size} />
            )}
            label="Sair"
            onPress={handleLogout}
          />
        </View>
      )}
    </View>
  );
}
export default DrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 13,
    lineHeight: 14,
    // color: '#6e6e6e',
    width: "100%",
  },
  row: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
  },
  paragraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
    borderBottomWidth: 0,
    borderBottomColor: "#dedede",
    borderBottomWidth: 1,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: "#dedede",
    borderTopWidth: 1,
    borderBottomColor: "#dedede",
    borderBottomWidth: 1,
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
