//imports nativos
import { React, useContext, useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";

//imports de terceiros
import { StatusBar } from "expo-status-bar";

//imports locais
import { SignUpContext } from "../../../hooks/SignUpContext";
import {
  ButtonText,
  Colors,
  StyledContainerNew,
  StyledButton,
  StyledButtonVoltar,
} from "../../../components/estilos";
import MyTextInput from "../../../components/MyTextInput";
import CustomStepper from "../../../components/CustomStepper";
import { Controller, useForm } from "react-hook-form";
import { formatCEP } from "../../../utils/ValidarFormatar";
import { buscaCEP } from "../../../api/ComDataService";
import { ModalLoading } from "../../../components/Modal";

const { primary, darkLight, currentStep, otherSteps } = Colors;

const SignUpAddress = ({ navigation }) => {
  const { formData, updateFormData } = useContext(SignUpContext);
  const [isSubmitting, isSetSubmitting] = useState(false);
  const [modalLoadingVisible, setModalLoadingVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      cep: formData.cep || "",
      endereco: formData.endereco || "",
      numero: formData.numero || "",
      complemento: formData.complemento || "",
      bairro: formData.bairro || "",
      cidade: formData.cidade || "",
      uf: formData.uf || "",
      referencia: formData.referencia || "",
    },
  });
  const preencherViaCEP = (cep) => {
    console.log("CadastroEndereço.js - função preencherViaCEP ativada");
    setModalLoadingVisible(true);
    isSetSubmitting(true);

    buscaCEP(cep)
      .then((res) => {
        console.log("[CadastroEndereço.js] - Resposta da API:", res);
        if (res.length === 0) {
          alert("CEP não encontrado.");
          setValue("endereco", "");
          setValue("bairro", "");
          setValue("numero", "");
          setValue("complemento", "");
          setValue("referencia", "");
          setValue("uf", "");
          setValue("cidade", "");
          isSetSubmitting(false);
        } else {
          const cepData = res[0];
          setValue(
            "endereco",
            `${cepData.tipoLogradouro} ${cepData.logradouro}`
          );
          setValue("bairro", cepData.bairro);
          setValue("uf", cepData.ufSigla);
          setValue("cidade", cepData.localidade);
          setValue("numero", "");
          setValue("complemento", "");
          setValue("referencia", "");
        }
        isSetSubmitting(false);
        setModalLoadingVisible(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar cep", error);
        isSetSubmitting(false);
        setModalLoadingVisible(false);
      });
  };

  const onSubmit = (data) => {
    updateFormData({
      ...data,
    });
    console.log(data);
    console.log("Erro do campo cep:", errors.cep);
    navigation.navigate("SignUpTerms");
  };

  return (
    <View style={{ flex: 1, backgroundColor: primary }}>
      <StatusBar style="dark" />
      <StyledContainerNew style={{ backgroundColor: "transparent" }}>
        <View style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              justifyContent: "center",
              paddingHorizontal: 45,
              marginTop: 25,
              paddingBottom: 25,
            }}
          >
            <View style={{ flex: 1, justifyContent: "flex-start" }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Controller
                  control={control}
                  name="cep"
                  rules={{
                    required: "Preenchimento obrigatório.",
                    minLength: { value: 9, message: "CEP inválido." },
                    validate: (value) => {
                      if (value.replace(/\D/g, "").length === 8) {
                        return true;
                      }
                      console.log(errors.cep);
                      return "O CEP deverá conter 8 dígitos.";
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <View style={{ flex: 0.5 }}>
                      <MyTextInput
                        label="CEP:"
                        icon="location"
                        iconFamily="entypo"
                        placeholder="Insira seu CEP aqui."
                        placeholderTextColor={darkLight}
                        onChangeText={(value) => {
                          onChange(formatCEP(value));
                          value.length === 9 && preencherViaCEP(value);
                        }}
                        value={value}
                        keyboardType="numeric"
                        border={!!errors.cep} //dupla exclamação converte em booleano
                        borderColor={errors.cep ? "red" : "transparent"}
                        maxLength={9}
                        disabled={isSubmitting}
                      ></MyTextInput>
                    </View>
                  )}
                ></Controller>

                <Controller
                  control={control}
                  name="numero"
                  rules={{ required: "Preenchimento obrigatório." }}
                  render={({ field: { onChange, value } }) => (
                    <View style={{ flex: 0.47 }}>
                      <MyTextInput
                        label="Número:"
                        placeholder="Nº"
                        placeholderTextColor={darkLight}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="numeric"
                        border={!!errors.numero} //dupla exclamação converte em booleano
                        borderColor={errors.numero ? "red" : "transparent"}
                        style={{ paddingLeft: 15 }}
                        maxLength={5}
                        disabled={isSubmitting}
                      ></MyTextInput>
                    </View>
                  )}
                ></Controller>
              </View>

              <Controller
                control={control}
                name="endereco"
                rules={{ required: "Preenchimento obrigatório." }}
                render={({ field: { onChange, value } }) => (
                  <MyTextInput
                    label="Endereço:"
                    icon="address"
                    iconFamily="entypo"
                    placeholder="Insira seu endereço aqui."
                    placeholderTextColor={darkLight}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="default"
                    border={!!errors.endereco} //dupla exclamação converte em booleano
                    borderColor={errors.endereco ? "red" : "transparent"}
                    multiline={true}
                    disabled={isSubmitting}
                  ></MyTextInput>
                )}
              ></Controller>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Controller
                  control={control}
                  name="complemento"
                  render={({ field: { onChange, value } }) => (
                    <View style={{ flex: 1 }}>
                      <MyTextInput
                        label="Complemento:"
                        icon="sign-direction-plus"
                        iconFamily="MaterialCommunityIcons"
                        placeholder="Fundos, Ap, casa, etc."
                        placeholderTextColor={darkLight}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="default"
                        maxLength={255}
                        disabled={isSubmitting}
                      ></MyTextInput>
                    </View>
                  )}
                ></Controller>
              </View>

              <Controller
                control={control}
                name="bairro"
                render={({ field: { onChange, value } }) => (
                  <MyTextInput
                    label="Bairro:"
                    icon="home-group"
                    iconFamily="MaterialCommunityIcons"
                    placeholder="Insira o nome de seu bairro aqui."
                    placeholderTextColor={darkLight}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="default"
                    maxLength={255}
                    disabled={isSubmitting}
                  ></MyTextInput>
                )}
              ></Controller>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  height: 100,
                }}
              >
                <Controller
                  control={control}
                  name="uf"
                  render={({ field: { onChange, value } }) => (
                    <View style={{ flex: 0.22 }}>
                      <MyTextInput
                        label="UF:"
                        // icon="home-group"
                        // iconFamily="MaterialCommunityIcons"
                        placeholder="Nº."
                        placeholderTextColor={darkLight}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="numeric"
                        maxLength={2}
                        style={{ paddingLeft: 15 }}
                        disabled={true}
                      ></MyTextInput>
                    </View>
                  )}
                ></Controller>

                <Controller
                  control={control}
                  name="cidade"
                  render={({ field: { onChange, value } }) => (
                    <View style={{ flex: 0.75 }}>
                      <MyTextInput
                        label="Cidade:"
                        icon="city"
                        iconFamily="MaterialCommunityIcons"
                        placeholder="Cidade em que reside"
                        placeholderTextColor={darkLight}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="default"
                        maxLength={255}
                        disabled={true}
                      ></MyTextInput>
                    </View>
                  )}
                ></Controller>
              </View>

              <Controller
                control={control}
                name="referencia"
                render={({ field: { onChange, value } }) => (
                  <MyTextInput
                    label="Ponto de referência:"
                    icon="hand-pointing-right"
                    iconFamily="MaterialCommunityIcons"
                    placeholder="Descreva um ponto de referência."
                    placeholderTextColor={darkLight}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="default"
                    style={{ height: 100 }}
                    multiline={true}
                    iconContainerStyle={{ position: "relative", top: 20 }}
                    maxLength={255}
                    disabled={isSubmitting}
                  ></MyTextInput>
                )}
              ></Controller>
            </View>
          </ScrollView>
        </View>
      </StyledContainerNew>

      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        {/* <MsgBox>Caixa de mensagem</MsgBox> */}
        <View
          style={{
            flex: 0.15,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              padding: 0,
              width: "90%",
              flexDirection: "row-reverse",
            }}
          >
            <View style={{ flex: 0.4, justifyContent: "center" }}>
              <StyledButton
                onPress={handleSubmit(onSubmit)}
                style={{ height: 50 }}
              >
                <ButtonText>Avançar</ButtonText>
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
                step3Color={currentStep}
                step4Color={otherSteps}
                step5Color={otherSteps}
              />
            </View>
            <View style={{ flex: 0.4, justifyContent: "center" }}>
              <StyledButtonVoltar
                onPress={() => {
                  updateFormData({
                    cep: getValues("cep"),
                    numero: getValues("numero"),
                    endereco: getValues("endereco"),
                    complemento: getValues("complemento"),
                    bairro: getValues("bairro"),
                    cidade: getValues("cidade"),
                    uf: getValues("uf"),
                    referencia: getValues("referencia"),
                  });
                  navigation.goBack();
                }}
              >
                <ButtonText>Retornar</ButtonText>
              </StyledButtonVoltar>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={modalLoadingVisible}
        animationType="fade"
        transparent={true}
      >
        <ModalLoading />
      </Modal>
    </View>
  );
};
export default SignUpAddress;
