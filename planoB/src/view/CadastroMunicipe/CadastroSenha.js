//imports nativos
import React, { useContext, useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";

//imports de terceiros
import { StatusBar } from "expo-status-bar";
import { Controller, useForm } from "react-hook-form";

//imports locais
import { SignUpContext } from "../../hooks/SignUpContext";
import {
  ButtonText,
  Colors,
  StyledButton,
  StyledButtonVoltar,
  StyledContainerNew,
} from "../../components/estilos";
import PasswordInput from "../../components/PasswordInput2";
import PasswordValidation from "../../components/PasswordValidation";
import CustomStepper from "../../components/CustomStepper";
import { CadastrarNovoMunicipe } from "../../api/UserService";
import { ModalLoading, ModalSucesso } from "../../components/Modal";
import { convertDateToApiFormat } from "../../utils/ValidarFormatar";

const { primary, darkLight, currentStep, otherSteps } = Colors;

const SignUpPassword = ({ navigation }) => {
  const { resetFormData, formData, updateFormData } = useContext(SignUpContext);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(true);
  const [showModalSucesso, setShowModalSucesso] = useState(false);
  const [modalLoadingVisible, setModalLoadingVisible] = useState(false);
  const [userDetails, setUserDetails] = useState({
    idMunicipe: "",
    nomeMunicipe: "",
    sobrenomeMunicipe: "",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const CadastroMunicipe = async () => {
    console.log("formData:", formData);
    setModalLoadingVisible(true);
    setIsLoading(true);
    const dadosMunicipe = {
      description: "Cadastro via App156",
      tratamento: "",
      nome: formData.prinome,
      sobrenome: formData.sobrenome,
      cpf: formData.cpf,
      data_nascimento: convertDateToApiFormat(formData.datanasc),
      email: formData.email,
      tel_residencial: formData.telres,
      tel_comercial: formData.telcom,
      celular: formData.celular,
      forma_contato: formData.formaContato,
      cep: formData.cep,
      rua: formData.endereco,
      numero: formData.numero,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.uf,
      complemento: formData.complemento,
      referencia: "",
      nome_social: "",
      password: formData.password,
      password2: formData.confirmPassword,
      terms_accepted: formData.acceptTerms,
      terms_accepted_at: formData.termsAcceptedAt,
    };

    CadastrarNovoMunicipe(dadosMunicipe).then((res) => {
      console.log("CadastroSenha.js - resposta da chamada API:", res);

      if (res.status == 200 || res.status == 201) {
        setUserDetails({
          idMunicipe: res.data.crm_data.id,
          nomeMunicipe: formData.prinome,
          sobrenomeMunicipe: formData.sobrenome,
        });
        setModalLoadingVisible(false);
        setShowModalSucesso(true);
        resetFormData();
      } else {
        setModalLoadingVisible(false);
        setError(res.message);
      }
      setModalLoadingVisible(false);
      setIsLoading(false);
    });
  };

  const checkPasswordMatch = (passwd1, passwd2) => {
    console.log("password:", passwd1, "confirmPassword:", passwd2);
    passwd1 === passwd2 ? setPasswordMatch(true) : setPasswordMatch(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: primary }}>
      <StatusBar style="dark" />
      <StyledContainerNew>
        <View style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ justifyContent: "center", padding: 45 }}
          >
            <View style={{ flex: 1, justifyContent: "flex-start" }}>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Preencha sua senha",
                  minLength: {
                    value: 8,
                    message: "Sua senha deve ter pelo menos 8 caracteres",
                  },
                  validate: {
                    hasSpecialChar: (value) =>
                      /[!@#$%&*(),.?":{}|<>]/.test(value) ||
                      "A senha deve conter pelo menos um caractere especial",
                    hasNumbers: (value) =>
                      /(?:.*\d){2}/.test(value) ||
                      "A senha deve conter pelo menos 2 números",
                    hasLowerCase: (value) =>
                      /[a-z]/.test(value) ||
                      "A senha deve conter pelo menos uma letra minúscula",
                    hasUpperCase: (value) =>
                      /[A-Z]/.test(value) ||
                      "A senha deve conter pelo menos uma letra maiúscula",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <PasswordInput
                      label="Cadastre sua senha:"
                      icon="lock"
                      placeholder="Insira sua senha"
                      placeholderTextColor={darkLight}
                      onChangeText={(text) => {
                        onChange(text);
                        updateFormData({ password: text });
                        checkPasswordMatch(text, getValues("confirmPassword"));
                      }}
                      value={value}
                      border={!!errors.password}
                      disabled={isSubmitting || isLoading}
                      maxLength={255}
                    />
                    <PasswordValidation password={value} />
                  </View>
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: "Confirme sua senha",
                  minLenght: {
                    value: 8,
                    message: "Sua senha deve ter pelo menos 8 caracteres",
                  },
                  validate: {
                    equalToPassword: (value) =>
                      value === getValues("password") ||
                      "As senhas devem ser iguais",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <PasswordInput
                    label="Confirme sua senha:"
                    icon={passwordMatch ? "lock" : "unlock"}
                    placeholder="Insira novamente sua senha"
                    placeholderTextColor={darkLight}
                    onChangeText={(text) => {
                      onChange(text);
                      updateFormData({ confirmPassword: text });
                      checkPasswordMatch(formData.password, text);
                      // console.log(passwordMatch);
                    }}
                    value={value}
                    border={!passwordMatch}
                    disabled={isSubmitting || isLoading}
                    maxLength={255}
                  />
                )}
              />
            </View>
          </ScrollView>
        </View>

        <Modal
          visible={modalLoadingVisible}
          animationType="fade"
          transparent={true}
        >
          <ModalLoading />
        </Modal>

        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          {/* <MsgBox>Caixa de mensagem</MsgBox> */}
          {/* {error && (
            <Text>
              Não foi possível concluir seu cadastro. Por favor, tente novamente
              mais tarde.
            </Text>
          )} */}
          <View
            style={{
              flex: 0.15,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "90%",
                flexDirection: "row-reverse",
              }}
            >
              <View style={{ flex: 0.4, justifyContent: "center" }}>
                <StyledButton
                  onPress={handleSubmit(CadastroMunicipe)}
                  style={{ height: 50 }}
                >
                  <ButtonText>Cadastrar</ButtonText>
                </StyledButton>
              </View>
              <View
                style={{
                  flex: 0.5,
                  justifyContent: "center",
                }}
              >
                <CustomStepper
                  step1Color={otherSteps}
                  step2Color={otherSteps}
                  step3Color={otherSteps}
                  step4Color={otherSteps}
                  step5Color={currentStep}
                />
              </View>
              <View style={{ flex: 0.4, justifyContent: "center" }}>
                <StyledButtonVoltar
                  onPress={() => navigation.goBack()}
                  disabled={isSubmitting || isLoading}
                >
                  <ButtonText>Retornar</ButtonText>
                </StyledButtonVoltar>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>

        <ModalSucesso
          isVisible={showModalSucesso}
          onClose={() => {
            setShowModalSucesso(false);
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "LoginSuiteCRM",
                  params: userDetails,
                },
              ],
            });
          }}
          title="Cadastro concluído!"
          message1="Agora você já pode:"
          message2="1. Fazer novas solicitações"
          message3="2. Consultar andamento de solicitações"
          message4="3. Conhecer todos os serviços que a prefeitura oferece"
          buttonText="Ir para o início"
        />
      </StyledContainerNew>
    </View>
  );
};
export default SignUpPassword;
