//imports nativos
import React, { useContext, useState } from "react";
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  Text,
  Alert,
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
import CustomStepper from "../../../components/CustomStepper";
import TermsOfUseContent from "../../../components/TermsOfUseContent";
import CheckboxComponent from "../../../components/CheckboxComponent";

const { primary, darkLight, currentStep, otherSteps, customRed } = Colors;

const SignUpTerms = ({ navigation }) => {
  const { formData, updateFormData } = useContext(SignUpContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      acceptTerms: formData.acceptTerms || false,
    },
  });

  const onSubmit = (data) => {
    if (!data.acceptTerms) {
      Alert.alert(
        "Termos de Uso",
        "Para continuar com o cadastro, é necessário aceitar os termos de uso e consentimento para tratamento de dados pessoais."
      );
      return;
    }

    setIsSubmitting(true);
    updateFormData({
      acceptTerms: data.acceptTerms,
      termsAcceptedAt: new Date().toISOString(),
    });
    setIsSubmitting(false);
    navigation.navigate("SignUpPassword");
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: primary }}>
      <StatusBar style="dark" />
      <StyledContainerNew>
        <View style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 25,
              marginTop: 25,
              paddingBottom: 25,
            }}
            showsVerticalScrollIndicator={true}
          >
            {/* Header */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#333",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                Termos de Uso
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                  textAlign: "center",
                  marginBottom: 15,
                }}
              >
                Para continuar, leia e aceite os termos abaixo:
              </Text>
            </View>

            {/* Terms Content Component */}
            <TermsOfUseContent />

            {/* Checkbox for acceptance */}
            <View style={{ marginTop: 30, marginBottom: 20 }}>
              <Controller
                control={control}
                name="acceptTerms"
                rules={{
                  required: "Você deve aceitar os termos para continuar.",
                }}
                render={({ field: { onChange, value } }) => (
                  <CheckboxComponent
                    label="Li e aceito os termos de consentimento para tratamento de dados pessoais"
                    value={value}
                    onValueChange={onChange}
                    hasError={!!errors.acceptTerms}
                  />
                )}
              />

              {errors.acceptTerms && (
                <Text
                  style={{
                    color: customRed,
                    fontSize: 12,
                    marginTop: 5,
                    marginLeft: 40,
                  }}
                >
                  {errors.acceptTerms.message}
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </StyledContainerNew>

      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
                style={{
                  height: 50,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                disabled={isSubmitting}
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
                step3Color={otherSteps}
                step4Color={currentStep}
              />
            </View>
            <View style={{ flex: 0.4, justifyContent: "center" }}>
              <StyledButtonVoltar onPress={handleBackPress}>
                <ButtonText>Voltar</ButtonText>
              </StyledButtonVoltar>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default SignUpTerms;
