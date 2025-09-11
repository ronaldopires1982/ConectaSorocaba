//imports nativos
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useContext, useState } from "react";

//imports de terceiros
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

//imports locais
import {
  ButtonText,
  Colors,
  StatusBarHeight,
  StyledButton,
} from "../../components/estilos";
import MyTextInput from "../../components/MyTextInput";
import { ModalLoading, ModalSucesso } from "../../components/Modal";
import { buscaCEP } from "../../api/ComDataService";
import { formatCEP } from "../../utils/ValidarFormatar";
import { SignInContext } from "../../hooks/SignInContext";

const { primary, darkLight } = Colors;

export const FormSolicitacao = ({ route }) => {
  const { user } = useContext(SignInContext);
  const { nomeGrupoServEscolhido } = route.params;
  const { nomeTipoServEscolhido } = route.params;
  const { nomeAssuntoEscolhido } = route.params;
  const { idAssuntoEscolhido } = route.params;
  const idMunicipe = user.idMunicipe;
  const [isLoading, setIsLoading] = useState(false);
  const [modalLoadingVisible, setModalLoadingVisible] = useState(false);
  const [showModalSucesso, setShowModalSucesso] = useState(false);

  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      descAssunto: "",
    },
  });

  const preencherViaCEP = (cep) => {
    setModalLoadingVisible(true);
    setIsLoading(true);

    buscaCEP(cep)
      .then((res) => {
        if (res.length === 0) {
          alert("CEP não encontrado.");
          setValue("endereco", "");
          setValue("bairro", "");
          setValue("numero", "");
          setValue("complemento", "");
          setValue("referencia", "");
          setValue("uf", "");
          setValue("cidade", "");
          setIsLoading(false);
        } else {
          const cepData = res[0];
          setValue(
            "endereco",
            `${cepData.tipoLogradouro} ${cepData.logradouro}`
          );
          setValue("bairro", cepData.bairro);
          setValue("uf", cepData.ufSigla);
          setValue("cidade", cepData.localidade);
        }
        setIsLoading(false);
        setModalLoadingVisible(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar cep", error);
        alert("Erro ao buscar o CEP. Verifique sua conexão e tente novamente.");
        setIsLoading(false);
        setModalLoadingVisible(false);
      });
  };

  const cadastroSol = async (data) => {
    setModalLoadingVisible(true);
    setIsLoading(true);

    try {
      // Criando objeto de dados da solicitação
      const solicitacaoData = {
        id_municipe: idMunicipe,
        id_assunto_sol: idAssuntoEscolhido,
        assunto_sol: nomeAssuntoEscolhido,
        cep_sol: data.cep,
        endereco_sol: data.endereco,
        numero_sol: data.numero,
        bairro_sol: data.bairro,
        descricao_sol: data.descAssunto,
        complemento_sol: data.complemento,
        cidade_sol: data.cidade || "Sorocaba",
        uf_sol: data.uf || "SP",
        latitude_sol: "-23,410877",
        longitude_sol: "-47,3896963",
        referencia_sol: "",
      };

      console.log("[FormSolicitacao] Dados da solicitação:", solicitacaoData);

      setModalLoadingVisible(false);
      setIsLoading(false);

      // Navega para tela AnexarArquivos passando os dados da solicitação como parametro
      navigation.navigate("AnexarArquivos", { solicitacaoData });
    } catch (error) {
      console.error("Erro ao preparar dados da solicitação:", error);
      setModalLoadingVisible(false);
      setIsLoading(false);
      Alert.alert(
        "Erro",
        "Falha ao preparar dados da solicitação. Tente novamente mais tarde."
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: primary }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: primary }}>
        <View style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              justifyContent: "center",
              paddingHorizontal: 45,
              paddingBottom: 25,
            }}
          >
            <View style={{ flex: 1, justifyContent: "flex-start" }}>
              {/* Conteiner para agrupar grupo de serviço, tipo de serviço e assunto */}
              <View style={{ marginTop: 20, marginBottom: 10, gap: 6 }}>
                {/* Conteiner para exibição do Grupo de Serviço */}
                <View
                  style={{
                    width: "90%",
                    flex: 1,
                    backgroundColor: "transparent",
                    flexDirection: "row",
                    justifyContent: "left",
                  }}
                >
                  <Text style={{ fontSize: 18 }}>Grupo de Serviço: </Text>
                  <Text style={{ fontSize: 18, fontWeight: "600" }}>
                    {nomeGrupoServEscolhido.value.value}
                  </Text>
                </View>

                {/* Conteiner para exibição do Tipo de Serviço */}
                <View
                  style={{
                    width: "90%",
                    flex: 1,
                    backgroundColor: "transparent",
                    flexDirection: "row",
                    justifyContent: "left",
                  }}
                >
                  <Text style={{ fontSize: 18 }}>Tipo de Serviço: </Text>
                  <Text style={{ fontSize: 18, fontWeight: "600" }}>
                    {nomeTipoServEscolhido.value}
                  </Text>
                </View>

                {/* conteiner para exibição de Assunto */}
                <View
                  style={{
                    width: "90%",
                    flex: 1,
                    backgroundColor: "transparent",
                    flexDirection: "row",
                    justifyContent: "left",
                  }}
                >
                  <Text style={{ fontSize: 18 }}>Assunto: </Text>
                  <Text style={{ fontSize: 18, fontWeight: "600" }}>
                    {nomeAssuntoEscolhido.toLowerCase()}
                  </Text>
                </View>
              </View>

              {/* conteiner para exibição do formulário */}
              <View>
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
                      minLength: {
                        value: 9,
                        message: "CEP deve ter 8 números (formato: 00000-000).",
                      },
                      validate: (value) => {
                        const CEPLimpo = value.replace(/\D/g, "");
                        if (CEPLimpo.length !== 8) {
                          return "O CEP deve conter exatamente 8 números.";
                        }
                        return true;
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <View style={{ flex: 0.55 }}>
                        <MyTextInput
                          label="CEP:"
                          icon="location"
                          iconFamily="entypo"
                          placeholder="Insira o CEP aqui."
                          placeholderTextColor={darkLight}
                          onChangeText={(inputValue) => {
                            const formattedCEP = formatCEP(inputValue);
                            onChange(formattedCEP);
                            if (formattedCEP.length === 9) {
                              preencherViaCEP(formattedCEP);
                            }
                          }}
                          value={value}
                          keyboardType="numeric"
                          border={!!errors.cep} //dupla exclamação converte em booleano
                          borderColor={errors.cep ? "red" : "transparent"}
                          maxLength={9}
                          disabled={isSubmitting || isLoading}
                        />
                        {errors.cep && (
                          <Text style={styles.errorText}>
                            {errors.cep.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name="numero"
                    rules={{
                      required:
                        "Número é obrigatório. Preencha 0, caso o endereço não possua número.",
                      validate: (value) => {
                        if (!value || value.trim() === "") {
                          return "Número é obrigatório.";
                        }
                        return true;
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <View style={{ flex: 0.42 }}>
                        <MyTextInput
                          label="Número:"
                          placeholder="Nº"
                          placeholderTextColor={darkLight}
                          onChangeText={onChange}
                          value={value}
                          keyboardType="numeric"
                          style={{ paddingLeft: 15 }}
                          maxLength={5}
                          border={!!errors.numero}
                          borderColor={errors.numero ? "red" : "transparent"}
                          disabled={isSubmitting || isLoading}
                        />
                        {errors.numero && (
                          <Text style={styles.errorText}>
                            {errors.numero.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>

                <Controller
                  control={control}
                  name="endereco"
                  rules={{
                    required: "Preenchimento obrigatório.",
                    minLength: {
                      value: 5,
                      message: "Endereço deve ter pelo menos 5 caracteres.",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <View>
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
                        maxLength={255}
                        multiline={true}
                        disabled={isSubmitting || isLoading}
                      />
                      {errors.endereco && (
                        <Text style={styles.errorText}>
                          {errors.endereco.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

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
                          disabled={isSubmitting || isLoading}
                          autoCapitalize="sentences"
                        />
                      </View>
                    )}
                  />
                </View>

                <Controller
                  control={control}
                  name="bairro"
                  rules={{
                    required: "O preenchimento do bairro é obrigatório.",
                    minLength: {
                      value: 2,
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <View>
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
                        border={!!errors.bairro}
                        borderColor={errors.bairro ? "red" : "transparent"}
                        disabled={isSubmitting || isLoading}
                      />
                      {errors.bairro && (
                        <Text style={styles.errorText}>
                          {errors.bairro.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="descAssunto"
                  rules={{
                    required: "Preenchimento da descrição é obrigatória.",
                    minLength: {
                      value: 20,
                      message: "A descrição deve ter pelo menos 20 caracteres.",
                    },
                    maxLength: {
                      value: 255,
                      message: "A descrição deve ter no máximo 255 caracteres.",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <MyTextInput
                        label="Descrição:"
                        icon="description"
                        iconFamily="MaterialIcons"
                        placeholder="Descreva sua solicitação."
                        placeholderTextColor={darkLight}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="default"
                        style={{ height: 180 }}
                        multiline={true}
                        iconContainerStyle={{ position: "relative", top: 60 }}
                        maxLength={255}
                        border={!!errors.descAssunto} //dupla exclamação converte em booleano
                        borderColor={errors.descAssunto ? "red" : "transparent"}
                        disabled={isSubmitting || isLoading}
                        autoCapitalize="sentences"
                      />
                      {errors.descAssunto && (
                        <Text style={styles.errorText}>
                          {errors.descAssunto.message}
                        </Text>
                      )}
                      <Text style={styles.characterCount}>
                        {value ? value.length : 0}/255 caracteres
                      </Text>
                    </View>
                  )}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View
          style={{
            flex: 0.15,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            width: "90%",
          }}
        >
          <View
            style={{
              padding: 0,
              width: "90%",
            }}
          >
            <View style={{ justifyContent: "center" }}>
              <StyledButton
                onPress={handleSubmit(cadastroSol)}
                style={{ height: 60 }}
                disabled={isSubmitting || isLoading}
              >
                <ButtonText>
                  {isSubmitting || isLoading ? "Carregando..." : "Continuar"}
                </ButtonText>
              </StyledButton>
            </View>
            <View
              style={{
                flex: 0.5,
                justifyContent: "center",
              }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>

      <ModalLoading
        isVisible={modalLoadingVisible}
        onClose={() => setModalLoadingVisible(false)}
      />

      <ModalSucesso
        isVisible={showModalSucesso}
        onClose={() => {
          setShowModalSucesso(false);
          navigation.navigate("Welcome");
        }}
        title="Solicitação enviada!"
        message1="Em alguns instantes você poderá acompanhar sua nova solicitação em Minhas Solicitações"
        buttonText="Ir para o início"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
  },
  characterCount: {
    fontSize: 12,
    color: darkLight,
    textAlign: "right",
    marginTop: 5,
    marginRight: 10,
  },
  CEP: {
    marginTop: 30,
    paddingLeft: 20,
  },
  container: {
    marginTop: StatusBarHeight,
    flex: 1,
  },
  label: {
    marginLeft: 5,
    marginBottom: 2,
  },
  logradouroContainer: {
    flex: 3,
    marginRight: 5,
  },
  numeroContainer: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  textInput: {
    fontSize: 20,
    fontWeight: "600",
    height: 40,
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
  },
  viewCampo: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
