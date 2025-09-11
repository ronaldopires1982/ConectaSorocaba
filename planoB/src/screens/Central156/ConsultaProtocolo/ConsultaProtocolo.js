//imports nativos
import {
  Keyboard,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";

//imports de terceiros
import { StatusBar } from "expo-status-bar";
import { Controller, useForm } from "react-hook-form";
import { FontAwesome } from "@expo/vector-icons";

//imports locais
import {
  ButtonText,
  Colors,
  Line,
  StyledFormArea,
  StyledButton,
  StatusBarHeight,
} from "../../../components/estilos";
import MyTextInput from "../../../components/MyTextInput";
import { consultarPorProtocolo } from "../../../api/SolicitacoesService";
import {
  ModalLoading,
  ModalSolicitacao,
  ModalSucesso,
} from "../../../components/Modal";

const { brand, darkLight, primary } = Colors;

const ConsultaProtocolo = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalLoadingVisible, setModalLoadingVisible] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setModalLoadingVisible(true);
    console.log("[ConsultaProtocolo] - Dados do formulário:", data);

    try {
      const result = await consultarPorProtocolo(data.protocolo);

      if (result && result.status === 404) {
        setModalLoadingVisible(false);
        setModalSuccess(true);
        return;
      }

      if (result) {
        setSearchResult(result);
        console.log(
          "[ConsultaProtocolo] - Resultado da consulta:",
          result.tasks[0].name
        );
        setModalLoadingVisible(false);
        setModalVisible(true);
      } else {
        setModalLoadingVisible(false);
        setModalSuccess(true);
      }
    } catch (error) {
      console.error(
        "[ConsultaProtocolo] - Erro ao consultar protocolo:",
        error
      );
      setModalLoadingVisible(false);
      setModalSuccess(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSearchResult(null);
  };

  const handleCloseSuccessModal = () => {
    setModalSuccess(false);
  };

  return (
    <TouchableWithoutFeedback
      style={{ flex: 1 }}
      onPress={() => Keyboard.dismiss()}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: primary,
          paddingTop: StatusBarHeight,
        }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            backgroundColor: "transparent",
            flex: 5,
            width: "90%",
            alignSelf: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <View style={{ flex: 0.85 }}>
              <Controller
                control={control}
                name="protocolo"
                rules={{
                  required:
                    "O preenchimento do número do protocolo é obrigatório.",
                }}
                render={({ field: { onChange, value } }) => (
                  <MyTextInput
                    value={value}
                    onChangeText={onChange}
                    style={{
                      paddingLeft: 20,
                      width: "95%",
                      alignSelf: "center",
                    }}
                    keyboardType="default"
                    placeholder="Digite aqui o número do protocolo"
                    placeholderTextColor={darkLight}
                    showLabel={false}
                    disabled={isSubmitting}
                    border={!!errors.protocolo} //dupla exclamação converte em booleano
                    borderColor={errors.protocolo ? "red" : "transparent"}
                    multiline={true}
                  ></MyTextInput>
                )}
              />
            </View>
            <View
              style={{
                flex: 0.12,
                height: 60,
              }}
            >
              <TouchableOpacity
                style={{
                  height: 60,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={handleSubmit(onSubmit)}
              >
                <FontAwesome name="search" size={36} color={brand} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Conteiner para a visualização dos dados */}
          <View></View>
        </View>

        <View
          style={{
            backgroundColor: "transparent",
            flex: 1,
            padding: 20,
            alignItems: "center",
            justifyContent: "flex-end",
            bottom: 30,
          }}
        >
          <StyledFormArea>
            <Line />
            <StyledButton
              style={{ height: 60, backgroundColor: brand }}
              onPress={handleSubmit(onSubmit)}
            >
              <ButtonText>Pesquisar</ButtonText>
            </StyledButton>
          </StyledFormArea>
        </View>

        <Modal visible={modalVisible} animationType="fade" transparent={true}>
          {searchResult && (
            <ModalSolicitacao
              handleClose={handleCloseModal}
              protocolo={searchResult.protocolo}
              situacao={searchResult.statusSol}
              dia={searchResult.dia}
              assunto={searchResult.tasks[0].name}
              descAssunto={searchResult.descAssunto}
              cep={searchResult.cep}
              logradouro={searchResult.logradouro}
              numero={searchResult.numero}
              complemento={searchResult.complemento}
              bairro={searchResult.bairro}
              // Propriedades que não serão usadas na visualização pública
              anexos={[]} // Não mostrar qualquer anexo
              hasUnreadNotifications={false} // Não mostrar notificações
              loadingAnexos={false}
              isPublicView={true} // Flag para indicar que é uma visualização pública
              onNavigateToComuniqueSeRelacionados={null} // Desabilita navegação
            />
          )}
        </Modal>

        <Modal
          visible={modalLoadingVisible}
          animationType="fade"
          transparent={true}
        >
          <ModalLoading />
        </Modal>

        <Modal visible={modalSuccess} animationType="fade" transparent={true}>
          <ModalSucesso
            success={false}
            title="Protocolo não encontrado."
            onClose={handleCloseSuccessModal}
            buttonText="Fechar"
            message1="Verifique se o protocolo digitado está correto e tente novamente."
          />
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ConsultaProtocolo;
