// imports nativos
import { useContext, useState } from "react";
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";

// imports de terceiros
import { StatusBar } from "expo-status-bar";
import { Controller, useForm } from "react-hook-form";

// imports locais
import {
  ButtonText,
  Colors,
  StyledButtonLogin,
} from "../../components/estilos";
import MyTextInput from "../../components/MyTextInput";
import {
  formatCEP,
  formatCPF,
  formatPhoneNumber,
  validatePhoneNumber,
} from "../../utils/ValidarFormatar";
import { buscaCEP } from "../../api/ComDataService";
import { SignInContext } from "../../hooks/SignInContext";
import { AtualizarMunicipe } from "../../api/UserService";
import { ModalLoading } from "../../components/Modal";

// imports de hooks
import useStorage from "../../hooks/useStorage";

const { primary, darkLight } = Colors;

const EditProfile = ({ navigation }) => {
  const { user, updateUserData } = useContext(SignInContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getItem } = useStorage();
  const [modalLoadingVisible, setModalLoadingVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm({
    defaultValues: {
      cpf: formatCPF(user?.cpf) || "",
      email: user?.email || "",
      celular: formatPhoneNumber(user?.celular, "celular") || "",
      telcom: formatPhoneNumber(user?.telcom) || "",
      telres: formatPhoneNumber(user?.telres) || "",
      cep: formatCEP(user?.cep) || "",
      logradouro: user?.logradouro || "",
      numero: user?.numero || "",
      complemento: user?.complemento || "",
      bairro: user?.bairro || "",
      cidade: user?.cidade || "",
      uf: user?.uf || "",
      referencia: user?.referencia || "",
    },
  });

  const preencherViaCEP = (cep) => {
    setIsSubmitting(true);
    setModalLoadingVisible(true);

    buscaCEP(cep)
      .then((res) => {
        if (res.length === 0) {
          Alert.alert("Erro", "CEP não encontrado.");
          setValue("logradouro", "");
          setValue("bairro", "");
          setValue("numero", "");
          setValue("complemento", "");
          setValue("referencia", "");
          setValue("uf", "");
          setValue("cidade", "");
        } else {
          const cepData = res[0];
          setValue(
            "logradouro",
            `${cepData.tipoLogradouro} ${cepData.logradouro}`
          );
          clearErrors("logradouro");
          setValue("bairro", cepData.bairro);
          setValue("uf", cepData.ufSigla);
          setValue("cidade", cepData.localidade);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar CEP:", error);
        Alert.alert("Erro", "Não foi possível buscar o CEP. Tente novamente.");
      })
      .finally(() => {
        setIsSubmitting(false);
        setModalLoadingVisible(false);
      });
  };

  const onSubmit = async (data) => {
    const bearerToken = await getItem("@access_token");

    console.log("[EditaPerfil.js] - Bearer Token:", bearerToken);

    Alert.alert(
      "Sair",
      "Deseja confirmar as alterações no seu perfil?",
      [
        {
          text: "Não",
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: async () => {
            try {
              setIsSubmitting(true);
              setModalLoadingVisible(true);

              // Monta objeto com propriedades conforme JSON esperado pela API
              const apiData = {
                cpf: data.cpf ? data.cpf.replace(/\D/g, "") : user.cpf,
                email: data.email || user.email,

                // Remove caracteres que não são dígitos
                celular: data.celular
                  ? data.celular.replace(/\D/g, "")
                  : user.celular,
                tel_comercial: data.telcom
                  ? data.telcom.replace(/\D/g, "")
                  : user.telcom,
                telres: data.telres
                  ? data.telres.replace(/\D/g, "")
                  : user.telres,
                cep: data.cep ? data.cep.replace(/\D/g, "") : user.cep,
                logradouro: data.logradouro || user.logradouro,
                numero: data.numero || user.numero,
                complemento: data.complemento || user.complemento,
                bairro: data.bairro || user.bairro,
                cidade: data.cidade || user.cidade,
                uf: data.uf || user.uf,
                referencia: data.referencia || user.referencia,
              };

              console.log(
                "[EditaPerfil.js] - Dados preparados para envio à API:",
                apiData
              );

              const result = await AtualizarMunicipe(
                bearerToken,
                process.env.EXPO_PUBLIC_DJANGO_CLIENT_ID,
                process.env.EXPO_PUBLIC_DJANGO_CLIENT_SECRET,
                apiData.cpf,
                apiData
              );

              if (result.status === "sucesso") {
                // Atualizar dados locais do usuário no contexto local (SignInContext)
                await updateUserData({
                  ...user,
                  email: data.email,
                  celular: data.celular
                    ? data.celular.replace(/\D/g, "")
                    : user.celular,
                  telcom: data.telcom
                    ? data.telcom.replace(/\D/g, "")
                    : user.telcom,
                  telres: data.telres
                    ? data.telres.replace(/\D/g, "")
                    : user.telres,
                  cep: data.cep ? data.cep.replace(/\D/g, "") : user.cep,
                  logradouro: data.logradouro || user.logradouro,
                  numero: data.numero || user.numero,
                  complemento: data.complemento || user.complemento,
                  bairro: data.bairro || user.bairro,
                  cidade: data.cidade || user.cidade,
                  uf: data.uf || user.uf,
                  referencia: data.referencia || user.referencia,
                });

                console.log(
                  "[EditaPerfil.js] - Dados atualizados no contexto:",
                  data
                );

                Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
                  {
                    text: "OK",
                    onPress: () =>
                      navigation.reset({
                        index: 0,
                        routes: [{ name: "Welcome" }],
                      }),
                  },
                ]);
              } else {
                throw new Error(result.message || "Erro ao atualizar dados");
              }
            } catch (error) {
              console.error("Error updating profile:", error);
              Alert.alert(
                "Erro",
                "Não foi possível atualizar seus dados. Tente novamente."
              );
            } finally {
              setIsSubmitting(false);
              setModalLoadingVisible(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: primary, paddingTop: 20 }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            justifyContent: "center",
            paddingHorizontal: 45,
            paddingBottom: 25,
          }}
        >
          <Controller
            control={control}
            name="cpf"
            render={({ field: { value } }) => (
              <MyTextInput
                label="CPF:"
                icon="id-card"
                iconFamily="fontawesome"
                value={value}
                editable={false}
                disabled={true}
              />
            )}
          />

          {/* Seção de contatos */}
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email é obrigatório",
              pattern: {
                value: /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i,
                message: "Email inválido",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <MyTextInput
                label="Email:"
                icon="mail"
                iconFamily="octicons"
                placeholder="Insira seu email aqui"
                placeholderTextColor={darkLight}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                border={!!errors.email}
                borderColor={errors.email ? "red" : "transparent"}
                disabled={isSubmitting}
              />
            )}
          />

          <Controller
            control={control}
            name="celular"
            rules={{
              required: "Preenchimento obrigatório.",
              validate: (value) => {
                if (!value) return true;
                const validation = validatePhoneNumber(value, "celular");
                return validation.isValid || validation.error;
              },
            }}
            render={({ field: { onChange, value } }) => (
              <MyTextInput
                label="Telefone celular:"
                icon="device-mobile"
                iconFamily="octicons"
                placeholder="Insira seu telefone celular aqui"
                placeholderTextColor={darkLight}
                onChangeText={(text) =>
                  onChange(formatPhoneNumber(text, "celular"))
                }
                value={value}
                keyboardType="phone-pad"
                border={!!errors.celular}
                borderColor={errors.celular ? "red" : "transparent"}
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
                placeholder="Insira seu telefone comercial aqui"
                placeholderTextColor={darkLight}
                onChangeText={(text) =>
                  onChange(formatPhoneNumber(text, "telcom"))
                }
                value={value}
                keyboardType="phone-pad"
                border={!!errors.telcom}
                borderColor={errors.telcom ? "red" : "transparent"}
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
                placeholder="Insira seu telefone residencial aqui"
                placeholderTextColor={darkLight}
                onChangeText={(text) =>
                  onChange(formatPhoneNumber(text, "telres"))
                }
                value={value}
                keyboardType="phone-pad"
                border={!!errors.telres}
                borderColor={errors.telres ? "red" : "transparent"}
                disabled={isSubmitting}
              />
            )}
          />

          {/* Seção endereço */}
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
              }}
              render={({ field: { onChange, value } }) => (
                <View style={{ flex: 0.5 }}>
                  <MyTextInput
                    label="CEP residencial:"
                    icon="location"
                    iconFamily="entypo"
                    placeholder="Insira seu CEP aqui"
                    placeholderTextColor={darkLight}
                    onChangeText={(text) => {
                      const formattedCEP = formatCEP(text);
                      onChange(formattedCEP);
                      if (formattedCEP.length === 9) {
                        preencherViaCEP(formattedCEP);
                      }
                    }}
                    value={value}
                    keyboardType="numeric"
                    border={!!errors.cep}
                    borderColor={errors.cep ? "red" : "transparent"}
                    maxLength={9}
                    disabled={isSubmitting}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="numero"
              render={({ field: { onChange, value } }) => (
                <View style={{ flex: 0.47 }}>
                  <MyTextInput
                    label="Número:"
                    placeholder="Nº"
                    placeholderTextColor={darkLight}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="numeric"
                    style={{ paddingLeft: 15 }}
                    maxLength={5}
                    disabled={isSubmitting}
                  />
                </View>
              )}
            />
          </View>
          <Controller
            control={control}
            name="logradouro"
            rules={{ required: "Preenchimento obrigatório." }}
            render={({ field: { onChange, value } }) => (
              <MyTextInput
                label="Endereço residencial:"
                icon="address"
                iconFamily="entypo"
                placeholder="Insira seu endereço aqui"
                placeholderTextColor={darkLight}
                onChangeText={onChange}
                value={value}
                border={!!errors.logradouro}
                borderColor={errors.logradouro ? "red" : "transparent"}
                multiline={true}
                disabled={isSubmitting}
              />
            )}
          />

          <Controller
            control={control}
            name="complemento"
            render={({ field: { onChange, value } }) => (
              <MyTextInput
                label="Complemento:"
                icon="sign-direction-plus"
                iconFamily="MaterialCommunityIcons"
                placeholder="Fundos, Ap, casa, etc."
                placeholderTextColor={darkLight}
                onChangeText={onChange}
                value={value}
                maxLength={255}
                disabled={isSubmitting}
              />
            )}
          />

          <Controller
            control={control}
            name="bairro"
            render={({ field: { onChange, value } }) => (
              <MyTextInput
                label="Bairro:"
                icon="home-group"
                iconFamily="MaterialCommunityIcons"
                placeholder="Insira o nome de seu bairro aqui"
                placeholderTextColor={darkLight}
                onChangeText={onChange}
                value={value}
                maxLength={255}
                disabled={isSubmitting}
              />
            )}
          />

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
                    placeholder="UF"
                    placeholderTextColor={darkLight}
                    onChangeText={onChange}
                    value={value}
                    maxLength={2}
                    style={{ paddingLeft: 15 }}
                    disabled={true}
                  />
                </View>
              )}
            />

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
                    maxLength={255}
                    disabled={true}
                  />
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="referencia"
            render={({ field: { onChange, value } }) => (
              <MyTextInput
                label="Ponto de referência:"
                icon="hand-pointing-right"
                iconFamily="MaterialCommunityIcons"
                placeholder="Descreva um ponto de referência"
                placeholderTextColor={darkLight}
                onChangeText={onChange}
                value={value}
                style={{ height: 100 }}
                multiline={true}
                iconContainerStyle={{ position: "relative", top: 20 }}
                maxLength={255}
                disabled={isSubmitting}
              />
            )}
          />
        </ScrollView>
      </View>

      <ModalLoading isVisible={modalLoadingVisible} />

      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View
          style={{
            flex: 0.15,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ justifyContent: "center", width: "80%" }}>
            <StyledButtonLogin
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <ButtonText>Salvar</ButtonText>
            </StyledButtonLogin>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default EditProfile;
