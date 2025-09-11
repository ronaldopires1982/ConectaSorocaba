//imports nativos
import { React, useContext, useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

//imports de terceiros
import { StatusBar } from "expo-status-bar";
import { Controller, useForm } from "react-hook-form";

//imports locais
import {
  ButtonText,
  Colors,
  StyledButton,
  StyledButtonVoltar,
  StyledContainerNew,
} from "../../../components/estilos";
import MyTextInput from "../../../components/MyTextInput";
import CustomStepper from "../../../components/CustomStepper";
import { SignUpContext } from "../../../hooks/SignUpContext";
import {
  formatCPF,
  validateCPF,
  formatDate,
  validateDate,
} from "../../../utils/ValidarFormatar";
// import { ChecarMunicipeCadastrado } from "../../api/UserService";
import { ModalLoading } from "../../../components/Modal";

const { currentStep, darkLight, otherSteps, primary } = Colors;

const SignUp = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { formData, resetFormData, updateFormData } = useContext(SignUpContext);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      prinome: formData.prinome || "",
      sobrenome: formData.sobrenome || "",
      cpf: formData.cpf || "",
      datanasc: formData.datanasc || "",
    },
  });

  const onSubmit = (data) => {
    updateFormData({
      prinome: data.prinome,
      sobrenome: data.sobrenome,
      cpf: data.cpf.replace(/\D/g, ""), //remove todos os caracteres não numéricos
      datanasc: data.datanasc.replace(/\D/g, ""),
    });
    //     setModalVisible(true);
    //
    //     ChecarMunicipeCadastrado(data.cpf.replace(/\D/g, ""))
    //       .then((result) => {
    //         console.log("Checking municipe result:", result);
    //         if (result.exists) {
    //           setModalVisible(false);
    //           Alert.alert(
    //             "Erro de cadastro",
    //             "O CPF informado já possui cadastro. Verifique se não há erros de digitação ou cadastre-se com outro CPF."
    //           );
    //           return;
    //         } else {
    //           setModalVisible(false);
    //           navigation.navigate("SignUpContacts");
    //         }
    //       })
    //       .catch((error) => {
    //         console.error("Error checking municipe:", error);
    //       });
    navigation.navigate("SignUpContacts");
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
            <Controller
              control={control}
              name="prinome"
              rules={{
                required:
                  "O preenchimento do campo Primeiro Nome é obrigatório.",
              }}
              render={({ field: { onChange, value } }) => (
                <MyTextInput
                  label="Primeiro nome:"
                  icon="person"
                  iconFamily="octicons"
                  placeholder="Insira seu primeiro nome aqui"
                  placeholderTextColor={darkLight}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="default"
                  border={!!errors.prinome} //dupla exclamação converte em booleano
                  borderColor={errors.prinome ? "red" : "transparent"}
                  maxLength={255}
                />
              )}
            />

            <Controller
              control={control}
              name="sobrenome"
              rules={{
                required: "O preenchimento do campo Sobrenome é obrigatório.",
              }}
              render={({ field: { onChange, value } }) => (
                <MyTextInput
                  label="Sobrenome:"
                  icon="family-tree"
                  iconFamily="MaterialCommunityIcons"
                  placeholder="Insira seu sobrenome completo aqui"
                  placeholderTextColor={darkLight}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="default"
                  border={!!errors.sobrenome} //dupla exclamação converte em booleano
                  borderColor={errors.sobrenome ? "red" : "transparent"}
                  maxLength={255}
                />
              )}
            />

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
                    // console.log("inside validation hook form", value);
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
                  }}
                  value={value}
                  keyboardType="number-pad"
                  maxLength={14}
                  border={!!errors.cpf} //dupla exclamação converte em booleano
                  borderColor={errors.cpf ? "red" : "transparent"}
                ></MyTextInput>
              )}
            ></Controller>

            <Controller
              control={control}
              name="datanasc"
              rules={{
                required:
                  "O preenchimento do campo data de nascimento é obrigatório.",
                minLength: {
                  value: 10,
                  message:
                    "A data de nascimento deverá possuir 10 dígitos (dd/mm/aaaa).",
                },
                validate: (value) => {
                  if (value.replace(/\D/g, "").length === 8) {
                    return validateDate(value);
                  }
                  return "A data de nascimento deve conter 8 dígitos.";
                },
              }}
              render={({ field: { onChange, value } }) => (
                <MyTextInput
                  label="Data de nascimento:"
                  icon="calendar" //ou baby
                  iconFamily="fontawesome" //ou fontawesome5
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor={darkLight}
                  onChangeText={(text) => onChange(formatDate(text))}
                  value={value}
                  keyboardType="number-pad"
                  maxLength={10}
                  border={!!errors.datanasc} //dupla exclamação converte em booleano
                  borderColor={errors.datanasc ? "red" : "transparent"}
                ></MyTextInput>
              )}
            ></Controller>
          </ScrollView>
        </View>
      </StyledContainerNew>
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <ModalLoading
          handleClose={() => {
            setModalVisible(false);
          }}
        ></ModalLoading>
      </Modal>

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
                step1Color={currentStep}
                step2Color={otherSteps}
                step3Color={otherSteps}
                step4Color={otherSteps}
                step5Color={otherSteps}
              />
            </View>
            <View style={{ flex: 0.4, justifyContent: "center" }}>
              <StyledButtonVoltar
                onPress={() => {
                  navigation.goBack();
                  resetFormData();
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
export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(24, 24, 24, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
});
