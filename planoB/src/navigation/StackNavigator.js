// imports nativos
import React from "react";
import { View } from "react-native";

// imports de terceiros
import { Feather } from "@expo/vector-icons";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import { DrawerActions, useNavigationState } from "@react-navigation/native";

// imports das Views
import Home from "../screens/Central156/Home";
import { LoginSuiteCRM } from "../screens/Central156/Login/LoginSuiteCRM";
import { Welcome } from "../screens/Central156/Login/BemVindo";
import { AbrirSolicitacao1 } from "../screens/Central156/NovaSolicitacao/AbrirSolicitacao1";
import { AbrirSolicitacao2 } from "../screens/Central156/NovaSolicitacao/AbrirSolicitacao2";
import { AbrirSolicitacao3 } from "../screens/Central156/NovaSolicitacao/AbrirSolicitacao3";
import { EscolhaAssunto } from "../screens/Central156/NovaSolicitacao/EscolhaAssunto";
import { FormSolicitacao } from "../screens/Central156/NovaSolicitacao/FormSolicitacao";
import { AnexarArquivos } from "../screens/Central156/NovaSolicitacao/AnexarArquivos";
import { MinhasSolicitacoes } from "../screens/Central156/MinhasSolicitacoes/MinhasSolicitacoes";

//imports para novo cadastro de munícipe
import SignUp from "../screens/ConectaSorocaba/NovoCadastro/DadosPessoais";
import SignUpContacts from "../screens/ConectaSorocaba/NovoCadastro/DadosContato";
import SignUpAddress from "../screens/ConectaSorocaba/NovoCadastro/Endereco";
import SignUpSelfie from "../screens/ConectaSorocaba/NovoCadastro/Selfie";
import SignUpTerms from "../screens/ConectaSorocaba/NovoCadastro/TermosUso";
import SignUpPassword from "../screens/ConectaSorocaba/NovoCadastro/Senha";
import ConsultaProtocolo from "../screens/Central156/ConsultaProtocolo/ConsultaProtocolo";
import MenuGrupoServ from "../screens/Central156/CartaServicos/MenuGrupoServ";
import ListarAssuntos from "../screens/Central156/CartaServicos/ListaAssuntos";
import ExibirArtigo from "../screens/Central156/CartaServicos/ExibeArtigo";
import Profile from "../screens/Central156/AtualizaMunicipe/DadosPerfil";
import EditProfile from "../screens/Central156/AtualizaMunicipe/EditaPerfil";
import NotificationsScreen from "../screens/Central156/MinhasNotificacoes/NotificationScreen";
import AdditionalInfoNotification from "../screens/Central156/MinhasNotificacoes/AdditionalInfoNotification";
import NotificationDemo from "../components/notifications/NotificationDemo";

// imports dos componentes e hooks
import { Colors } from "../components/estilos";

const { brand, primary } = Colors;

export const StackNav = ({ navigation }) => {
  const Stack = createStackNavigator();

  // função para capturar o nome da tela em exibição
  const useCurrentNestedScreen = () => {
    const state = useNavigationState((state) => state);

    const getActiveRouteName = (state) => {
      const route = state.routes[state.index];

      if (route.state) {
        return getActiveRouteName(route.state);
      }

      return route.name;
    };

    return getActiveRouteName(state);
  };

  // console.log("NewRootStack.js: tela atual:", useCurrentNestedScreen());

  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: 26,
          color: brand,
          fontWeight: "bold",
        },
      }}
      initialRouteName="Home"
    >
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { elevation: 0 },
          headerLeft: () => {
            return (
              <View style={{ marginLeft: 20 }}>
                <Feather
                  name="menu"
                  icon="menu"
                  onPress={() =>
                    navigation.dispatch(DrawerActions.openDrawer())
                  }
                  size={30}
                  color="#000000"
                />
              </View>
            );
          },
        }}
      />

      {/* view para fazer login/recuperar senha e acessar novo cadastro */}
      <Stack.Screen
        name="LoginSuiteCRM"
        component={LoginSuiteCRM}
        options={{
          headerShown: true,
          headerTitle: "",

          headerStyle: {
            elevation: 0,
          },
          headerTintColor: "#000",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 300 },
            },
            close: {
              animation: "timing",
              config: { duration: 300 },
            },
          },
        }}
      />

      {/* view temporária para visualização de dados relacionados ao push notifications */}
      <Stack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{
          headerShown: true,
          headerTitle: "Minhas Notificações",
          headerTitleStyle: {
            fontSize: 20,
            color: brand,
            fontWeight: "bold",
          },
        }}
      />

      <Stack.Screen
        name="AdditionalInfoNotification"
        component={AdditionalInfoNotification}
        options={{
          headerTitle: "Informações Adicionais",
          presentation: "card",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 300 },
            },
            close: {
              animation: "timing",
              config: { duration: 300 },
            },
          },
        }}
      />

      <Stack.Screen
        name="NotificationDemo"
        component={NotificationDemo}
        options={{
          headerTitle: "Demonstração de Notificações",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      {/* view para consulta protocolo sem logar */}
      <Stack.Screen
        name="ConsultaProtocolo"
        component={ConsultaProtocolo}
        options={{ headerTitle: "Consulta por protocolo" }}
      />

      {/* views para carta de serviços */}
      <Stack.Screen
        name="MenuGrupoServ"
        component={MenuGrupoServ}
        options={{ headerTitle: "Grupo de serviços" }}
      />
      <Stack.Screen
        name="ListaAssuntos"
        component={ListarAssuntos}
        options={{ headerTitle: "Escolha o assunto" }}
      />

      <Stack.Screen
        name="ExibeArtigo"
        component={ExibirArtigo}
        options={{ headerTitle: "Detalhes do assunto" }}
      />

      {/* view pós-login, com acesso para abrir solicitação e consultar minhas solicitações */}
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{
          headerShown: false,
          headerTitle: "",
          headerLeft: () => {
            return (
              <View style={{ marginLeft: 20 }}>
                <Feather
                  name="menu"
                  icon="menu"
                  onPress={() =>
                    navigation.dispatch(DrawerActions.openDrawer())
                  }
                  size={30}
                  color="#000000"
                />
              </View>
            );
          },
        }}
      />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          headerTitle: "Dados pessoais",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 300 },
            },
            close: { animation: "timing", config: { duration: 300 } },
          },
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          headerShown: true,
          headerTitle: "Atualize seus dados",
          presentation: "modal",
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 300 },
            },
            close: { animation: "timing", config: { duration: 300 } },
          },
        }}
      />

      {/* views para nova solicitação */}
      <Stack.Screen
        name="AbrirSolicitacao1"
        component={AbrirSolicitacao1}
        options={{ headerTitle: "Escolha o Grupo de Serviço" }}
      />
      <Stack.Screen
        name="AbrirSolicitacao2"
        component={AbrirSolicitacao2}
        options={{ headerTitle: "Escolha o Tipo de Serviço" }}
      />
      <Stack.Screen
        name="AbrirSolicitacao3"
        component={AbrirSolicitacao3}
        options={{ headerTitle: "Escolha o Assunto" }}
      />
      <Stack.Screen
        name="EscolhaAssunto"
        component={EscolhaAssunto}
        options={{ headerTitle: "Escolha o Assunto" }}
      />
      <Stack.Screen
        name="FormSolicitacao"
        component={FormSolicitacao}
        options={{
          // headerLeft: () => null,
          headerTitle: "Preencha o formulário",
        }}
      />
      <Stack.Screen
        name="AnexarArquivos"
        component={AnexarArquivos}
        options={{
          // headerLeft: () => null,
          headerTitle: "Incluir anexos",
        }}
      />

      {/* view para minhas solicitações */}
      <Stack.Screen
        name="MinhasSolicitacoes"
        component={MinhasSolicitacoes}
        options={{
          headerShown: true,
          headerTitle: "Minhas Solicitações",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 20,
            color: brand,
            fontWeight: "bold",
          },
          headerStyle: {
            backgroundColor: primary,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
          },
          headerTintColor: "#000",
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 300 },
            },
            close: {
              animation: "timing",
              config: { duration: 300 },
            },
          },
        }}
      />

      {/* view para cadastro de novo munícipe */}
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerTitle: "Dados pessoais", headerLeft: () => null }}
      />
      <Stack.Screen
        name="SignUpContacts"
        component={SignUpContacts}
        options={{
          headerTitle: "Dados para contato",
          headerLeft: () => null,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 600 },
            },
            close: {
              animation: "timing",
              config: { duration: 600 },
            },
          },
        }}
      />
      <Stack.Screen
        name="SignUpAddress"
        component={SignUpAddress}
        options={{
          headerTitle: "Endereço Residencial",
          headerLeft: () => null,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 600 },
            },
            close: {
              animation: "timing",
              config: { duration: 600 },
            },
          },
        }}
      />

      <Stack.Screen
        name="SignUpSelfie"
        component={SignUpSelfie}
        options={{
          headerTitle: "Capture sua selfie",
          headerLeft: () => null,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 600 },
            },
            close: {
              animation: "timing",
              config: { duration: 600 },
            },
          },
        }}
      />

      <Stack.Screen
        name="SignUpTerms"
        component={SignUpTerms}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SignUpPassword"
        component={SignUpPassword}
        options={{
          headerTitle: "Cadastre sua senha",
          headerLeft: () => null,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 600 },
            },
            close: {
              animation: "timing",
              config: { duration: 600 },
            },
          },
        }}
      />
    </Stack.Navigator>
  );
};
