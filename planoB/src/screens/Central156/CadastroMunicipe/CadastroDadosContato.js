//imports nativos
import React, { useContext, useEffect, useState } from "react";
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";

//imports de terceiros
import { StatusBar } from "expo-status-bar";
import { Controller, useForm } from "react-hook-form";

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
import {
  formatPhoneNumber,
  validatePhoneNumber,
} from "../../../utils/ValidarFormatar";

const { primary, darkLight, currentStep, otherSteps } = Colors;

const SignUpContacts = ({ navigation }) => {
  const { formData, updateFormData } = useContext(SignUpContext);
  const [isSubmitting, isSetSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: formData.email || "",
      celular: formData.celular || "",
      telcom: formData.telcom || "",
      telres: formData.telres || "",
    },
  });

  useEffect(() => {
    console.log(
      "CadastroDadosContato.js - Erros de preenchimento: ",
      errors.email
    );
  }, [errors.email]);

  const onSubmit = (data) => {
    isSetSubmitting(true);
    updateFormData({
      email: data.email,
      celular: data.celular,
      telcom: data.telcom,
      telres: data.telres,
    });
    isSetSubmitting(false);
    navigation.navigate("SignUpAddress");
    return Promise.resolve(); // This will signal React Hook Form that submission is complete
  };

  return (
    <View style={{ flex: 1, backgroundColor: primary }}>
      <StatusBar style="dark" />
      <StyledContainerNew>
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
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Preencha todos os campos obrigatórios.",
                  pattern: {
                    value: /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i,
                  },
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <MyTextInput
                    label="Email:"
                    icon="mail"
                    iconFamily="octicons"
                    placeholder="Insira seu email aqui"
                    placeholderTextColor={darkLight}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    border={!!errors.email} //dupla exclamação converte em booleano
                    borderColor={errors.email ? "red" : "transparent"}
                    maxLength={255}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Controller
                control={control}
                name="celular"
                rules={{
                  required: "Preencha todos os campos obrigatórios.",
                  minLength: 15,
                  validate: (value) => {
                    const validation = validatePhoneNumber(value, "celular");
                    return validation.isValid || validation.error;
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <MyTextInput
                    label="Telefone celular:"
                    icon="device-mobile"
                    iconFamily="octicons"
                    placeholder="Insira o número de seu celular aqui"
                    placeholderTextColor={darkLight}
                    onChangeText={(text) =>
                      onChange(formatPhoneNumber(text, "celular"))
                    }
                    value={value}
                    keyboardType="number-pad"
                    border={!!errors.celular} //dupla exclamação converte em booleano
                    borderColor={errors.celular ? "red" : "transparent"}
                    maxLength={15}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Controller
                control={control}
                name="telcom"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const validation = validatePhoneNumber(value, "telcom");
                    return validation.isValid || validation.error;
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <MyTextInput
                    label="Telefone comercial:"
                    icon="telephone"
                    iconFamily="foundation"
                    placeholder="Digite o nº de seu telefone comercial"
                    placeholderTextColor={darkLight}
                    onChangeText={(text) =>
                      onChange(formatPhoneNumber(text, "telcom"))
                    }
                    value={value}
                    keyboardType="number-pad"
                    border={!!errors.telcom} //dupla exclamação converte em booleano
                    borderColor={errors.telcom ? "red" : "transparent"}
                    maxLength={14}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                control={control}
                name="telres"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const validation = validatePhoneNumber(value, "telres");
                    return validation.isValid || validation.error;
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <MyTextInput
                    label="Telefone residencial:"
                    icon="telephone"
                    iconFamily="foundation"
                    placeholder="Digite o nº de seu telefone residencial"
                    placeholderTextColor={darkLight}
                    onChangeText={(text) =>
                      onChange(formatPhoneNumber(text, "telres"))
                    }
                    value={value}
                    keyboardType="number-pad"
                    border={!!errors.telres} //dupla exclamação converte em booleano
                    borderColor={errors.telres ? "red" : "transparent"}
                    maxLength={14}
                    disabled={isSubmitting}
                  />
                )}
              />
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
          {/* <MsgBox
            fontSize={16}
            marginBottom={10}
            color={customRed}
            width={"80%"}
          >
            {Object.keys(errors).length > 0
              ? "Preencha corretamente os todos os campos destacados em vermelho."
              : ""}
          </MsgBox> */}
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
                step2Color={currentStep}
                step3Color={otherSteps}
                step4Color={otherSteps}
                step5Color={otherSteps}
              />
            </View>
            <View style={{ flex: 0.4, justifyContent: "center" }}>
              <StyledButtonVoltar
                onPress={() => {
                  updateFormData({
                    email: getValues("email"),
                    celular: getValues("celular"),
                    telcom: getValues("telcom"),
                    telres: getValues("telres"),
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
    </View>
  );
};
export default SignUpContacts;
