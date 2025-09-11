//imports nativos
import { useState, useContext } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  View,
} from "react-native";

// imports de terceiros
import { StatusBar } from "expo-status-bar";
import { Controller, useForm } from "react-hook-form";

// imports locais
import {
  ButtonText,
  Colors,
  ExtraText,
  ExtraView,
  Line,
  StyledButtonLogin,
  TextLink,
  TextLinkContent,
} from "../../components/estilos";
import { SignInContext } from "../../hooks/SignInContext";
import { SignUpContext } from "../../hooks/SignUpContext";
import {
  ChecarMunicipeCadastrado,
  Login,
  RecuperarSenha,
} from "../../api/UserService";
import MyTextInput from "../../components/MyTextInput";
import PasswordInput from "../../components/PasswordInput2";
import { ModalLoading, ModalSucesso } from "../../components/Modal";
import LogoHeader from "../../components/LogoHeader";
import { formatCPF, validateCPF } from "../../utils/ValidarFormatar";
import { updateUserIdForToken } from "../../utils/NotificationActions";

// imports de hooks
import useStorage from "../../hooks/useStorage";

const { primary, darkLight } = Colors;

export const LoginSuiteCRM = ({ navigation }) => {
  const { saveItem } = useStorage();
  const { formData, resetFormData, updateFormData } = useContext(SignUpContext);
  const { logIn } = useContext(SignInContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showModalSucesso, setShowModalSucesso] = useState(false);
  const [modalLoadingVisible, setModalLoadingVisible] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [erroRecuperaCPF, setErroRecuperaCPF] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      cpf: formData.cpf || "",
      password: "",
    },
  });

  const RecuperaSenha = async (cpfLimpo) => {
    console.log("cpfLimpo:", cpfLimpo);
    console.log("Variável de erro do CPF:", erroRecuperaCPF);
    console.log("erro do form:", errors.cpf);

    const isInvalidCPF = !validateCPF(cpfLimpo);
    console.log("Resultado da validação de CPF:", isInvalidCPF);

    if (isInvalidCPF) {
      setErroRecuperaCPF(true);
      Alert.alert(
        "Atenção",
        "Para recuperar seu acesso, preencha o campo CPF corretamente."
      );
      return;
    } else {
      console.log("Teve erro no CPF?", erroRecuperaCPF);
      setModalLoadingVisible(true);

      const municipeCadastrado = await ChecarMunicipeCadastrado(cpfLimpo);

      console.log(
        "Quantidade de munícipes cadastrados com este CPF:",
        municipeCadastrado.result
      );

      console.log("municipeCadastrado:", municipeCadastrado);
      if (municipeCadastrado.result > 0) {
        RecuperarSenha(cpfLimpo).then((res) => {
          if (res === "erro") {
            setModalLoadingVisible(false);
            return;
          }
          setMaskedEmail(res);
          setShowModalSucesso(true);
        });
      } else {
        setModalLoadingVisible(false);
        Alert.alert(
          "Atenção",
          "Nenhum municipe cadastrado com este CPF foi encontrado."
        );
      }
    }
  };

  /**
   * Handle login process using Django API.
   * @param {Object} formData - The form data containing CPF and password.
   */
  const handleDjangoLogin = async (formData) => {
    if (isLoading) return; // Previne envios multiplos e re-renderizações enquanto o login está em andamento
    try {
      setIsLoading(true);

      // Prepare login credentials
      const grant_type = "password";
      const credentials = {
        username: formData.cpf.replace(/\D/g, ""),
        password: formData.password,
      };

      // Call login function with necessary parameters
      const result = await Login(
        grant_type,
        credentials,
        process.env.EXPO_PUBLIC_DJANGO_CLIENT_ID,
        process.env.EXPO_PUBLIC_DJANGO_CLIENT_SECRET
      );

      if (result && result.status === "sucesso") {
        // Save access and refresh tokens to storage
        // First save tokens to storage
        await saveItem("@access_token", result.tokens.access_token);
        await saveItem("@refresh_token", result.tokens.refresh_token);

        // Update user context with retrieved data
        // Handle successful login by updating user context
        const municipeData = result.dadosMunicipe;
        logIn({
          idMunicipe: municipeData.sistema.crm_id,
          nome: municipeData.dados_pessoais.nome,
          sobrenome: municipeData.dados_pessoais.sobrenome,
          cpf: municipeData.dados_pessoais.cpf,
          email: municipeData.contato.email,
          dataNascimento: municipeData.dados_pessoais.data_nascimento,
          celular: municipeData.contato.celular,
          telcom: municipeData.contato.tel_comercial,
          telres: municipeData.contato.tel_residencial,
          cep: municipeData.endereco.cep,
          logradouro: municipeData.endereco.rua,
          numero: municipeData.endereco.numero,
          complemento: municipeData.endereco.complemento,
          bairro: municipeData.endereco.bairro,
          cidade: municipeData.endereco.cidade,
          uf: municipeData.endereco.estado,
          referencia: municipeData.endereco.referencia,
        });

        // Atualiza o token de notificações com o ID do usuário após login bem-sucedido
        await updateUserIdForToken(municipeData.sistema.crm_id);

        // Navega para a tela inicial após login, sem permitir voltar para a tela de login com o botão voltar nativo do SO
        navigation.reset({
          index: 0,
          routes: [{ name: "Welcome" }],
        });
      } else {
        // Display error alert if login fails
        Alert.alert(
          "Erro de login",
          result.message || "Erro ao realizar login"
        );
        console.log("LoginSuiteCRM: Login falhou!");
      }
    } catch (error) {
      // Log and alert the error
      console.error("Erro no handleDjangoLogin:", error);
      Alert.alert("Erro", "Ocorreu um erro durante o login. Tente novamente.");
    } finally {
      // Reseta o estado do carregamento
      setIsLoading(false);
    }
  };

  const handleNewUser = async () => {
    resetFormData();
    navigation.navigate("SignUp");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        justifyContent: "center",
      }}
    >
      <StatusBar style="dark" backgroundColor="white" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 45,
          paddingBottom: 100,
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <View style={{ backgroundColor: primary }}>
          {/* View do LogoHeader */}
          <View
            style={{
              flex: 1 / 4,
              justifyContent: "flex-start",
              marginTop: 58,
            }}
          >
            <LogoHeader />
          </View>

          <View
            style={{
              marginTop: 32,
              justifyContent: "center",
              flex: 3 / 4,
            }}
          >
            <View>
              <Controller
                control={control}
                name="cpf"
                rules={{
                  required: "O preenchimento do campo CPF é obrigatório.",
                  minLength: {
                    value: 14,
                    message: "O CPF deverá possuir 14 dígitos.",
                  },
                  validate: (value) => {
                    if (value.replace(/\D/g, "").length === 11) {
                      return validateCPF(value);
                    }
                    return "O CPF deve conter 11 dígitos.";
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <MyTextInput
                    label="CPF:"
                    icon="id-card" //ou id-badge
                    iconFamily="fontawesome" //ou octicons
                    placeholder="Insira seu CPF aqui"
                    placeholderTextColor={darkLight}
                    onChangeText={(text) => {
                      onChange(formatCPF(text));
                      if (text.replace(/\D/g, "").length === 11) {
                        setErroRecuperaCPF(!validateCPF(text));
                      }
                    }}
                    value={value}
                    keyboardType="number-pad"
                    maxLength={14}
                    border={!!errors.cpf || erroRecuperaCPF} //dupla exclamação converte em booleano
                    borderColor={
                      errors.cpf || erroRecuperaCPF ? "red" : "transparent"
                    }
                  ></MyTextInput>
                )}
              />
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Informe sua senha",
                }}
                render={({ field: { onChange, value } }) => (
                  <PasswordInput
                    label="Informe sua senha:"
                    icon="lock"
                    placeholder="Insira sua senha"
                    placeholderTextColor={darkLight}
                    onChangeText={(text) => {
                      onChange(text);
                      updateFormData({ confirmPassword: text });
                    }}
                    value={value}
                    border={!!errors.password}
                    disabled={isSubmitting || isLoading}
                    maxLength={255}
                  />
                )}
              />
            </View>

            <ExtraView
              style={{
                flexDirection: "row",
                backgroundColor: "transparent",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "transparent",
                  justifyContent: "center",
                }}
              >
                <ExtraText fontSize={16}>
                  Caso tenha esquecido sua senha,
                </ExtraText>
              </View>
              <View
                style={{
                  backgroundColor: "transparent",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TextLink
                  onPress={async () => {
                    // RecuperaSenha(getValues("cpf").replace(/\D/g, ""));
                    url =
                      "https://portal156-teste.sorocaba.sp.gov.br/portal156/accounts/password_reset/";
                    const supported = await Linking.canOpenURL(url);
                    if (supported) {
                      await Linking.openURL(url);
                    } else {
                      console.log("Não foi possível navegar para: " + url);
                    }
                  }}
                >
                  <TextLinkContent fontSize={16}>clique aqui.</TextLinkContent>
                </TextLink>
              </View>
            </ExtraView>

            <View style={{ marginTop: 20 }}>
              {!isSubmitting && !isLoading && (
                <StyledButtonLogin
                  onPress={handleSubmit((data) => {
                    handleDjangoLogin(data);
                  })}
                >
                  <ButtonText>Entrar</ButtonText>
                </StyledButtonLogin>
              )}

              {(isSubmitting || isLoading) && (
                <StyledButtonLogin disabled={true}>
                  <ActivityIndicator size="large" color={primary} />
                </StyledButtonLogin>
              )}
              <Line />
              <ExtraView
                style={{
                  flexDirection: "row",
                  backgroundColor: "transparent",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "transparent",
                    justifyContent: "center",
                  }}
                >
                  <ExtraText>Ainda não possui cadastro? </ExtraText>
                </View>
                <View
                  style={{
                    backgroundColor: "transparent",
                    justifyContent: "center", // This ensures vertical centering
                    alignItems: "center", // This ensures horizontal centering
                  }}
                >
                  <TextLink onPress={handleNewUser}>
                    <TextLinkContent>Clique aqui.</TextLinkContent>
                  </TextLink>
                </View>
              </ExtraView>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={modalLoadingVisible}
        animationType="fade"
        transparent={true}
      >
        <ModalLoading />
      </Modal>

      <ModalSucesso
        isVisible={showModalSucesso}
        onClose={() => {
          setModalLoadingVisible(false);
          setShowModalSucesso(false);
        }}
        title="Senha alterada com sucesso!"
        message1={`Sua nova senha foi enviada para o email ${maskedEmail}.`}
        buttonText="Fechar"
      />
    </View>
  );
};
