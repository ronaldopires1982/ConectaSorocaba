//imports nativos
import { Dimensions, StyleSheet, SafeAreaView, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";

//imports de terceiros
import useStorage from "../../../hooks/useStorage";

// imports locais
import { ButtonText, StyledButton } from "../../../components/estilos";

export const AbrirSolicitacao1 = ({ navigation }) => {
  const [dataFlatlist, setDataFlatlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getItem, saveItem } = useStorage();

  // calcula a largura dos botões dinamicamente, baseado na largura do dispositivo
  const screenWidth = Dimensions.get("window").width;
  const padding = 40;
  const gap = 20;
  const buttonsPerRow = 2;
  const buttonWidth =
    (screenWidth - padding * 2 - gap * (buttonsPerRow - 1)) / buttonsPerRow;

  // faz a busca dos dados no storage, com tratamento de erro
  const retrieveData = useCallback(async () => {
    try {
      // busca os dados no storage em paralelo, para melhorar performance
      const [grupoServicos, tipoServicos, assuntos] = await Promise.all([
        getItem("@GrupoServicos"),
        getItem("@TipoServicos"),
        getItem("@Assuntos"),
      ]);

      // cria um set (collection) com os ids dos tipos de serviços exclusivos no json assuntos
      const validTipoServIds = new Set(
        assuntos.entry_list.map(
          (item) => item.name_value_list.a01_tipo_servico_id_c.value
        )
      );

      // filtra o json tipoServicos para manter apenas os valores correspondente aos ids dos assuntos
      const filteredTipoServico = tipoServicos.entry_list.filter((item) =>
        validTipoServIds.has(item.id)
      );

      // armazena os dados filtrados no storage
      await saveItem("@filteredTipoServico", filteredTipoServico);

      // cria um set (collection) com os ids dos grupos de serviços exclusivos no json filteredTipoServico
      const validGrupoServicoIds = new Set(
        filteredTipoServico.map(
          (item) => item.name_value_list.a01_grupo_servico_id_c.value
        )
      );

      // filtra o json grupoServicos para manter apenas os valores correspondente aos ids dos filteredTipoServico
      const filteredGrupoServico = grupoServicos.filter((item) =>
        validGrupoServicoIds.has(item.idGrupoServ)
      );

      setDataFlatlist(filteredGrupoServico);
    } catch (error) {
      console.error(
        "[AbrirSolicitacao1.js] - Erro ao recuperar os dados",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, [getItem, saveItem]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await retrieveData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [retrieveData]);

  const renderButtonRow = (rowData, isLastRow) => {
    const rowStyles = [
      styles.buttonRow,
      isLastRow && rowData.length < buttonsPerRow && styles.lastRowCenter,
    ];

    return (
      <View style={rowStyles}>
        {rowData.map((item) => (
          <StyledButton
            key={item.idGrupoServ}
            accessible={true}
            accessibilityLabel={`Grupo de serviço: ${item.nomeGrupoServ}`}
            accessibilityRole="button"
            style={[styles.button, { width: buttonWidth }]}
            onPress={() => {
              navigation.navigate("AbrirSolicitacao2", {
                idGrupoServEscolhido: item.idGrupoServ,
                nomeGrupoServEscolhido: item.nomeGrupoServ,
              });
            }}
          >
            <ButtonText>{item.nomeGrupoServ}</ButtonText>
          </StyledButton>
        ))}
      </View>
    );
  };

  // Group the data into rows
  const rows = dataFlatlist.reduce((acc, item, index) => {
    const rowIndex = Math.floor(index / buttonsPerRow);
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex].push(item);
    return acc;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {rows.map((rowData, index) => (
          <View key={index}>
            {renderButtonRow(rowData, index === rows.length - 1)}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    padding: 40,
    paddingTop: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 20,
    gap: 20,
  },
  lastRowCenter: {
    justifyContent: "center",
  },
  button: {
    height: 100,
  },
});
