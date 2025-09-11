// imports nativos
import { FlatList, View, SafeAreaView, Button } from "react-native";
import React, { useEffect, useState } from "react";

// imports locais
import { receberTipoServicos } from "../../../model/AbrirSolicitacao";
import useStorage from "../../../hooks/useStorage";

export const AbrirSolicitacao2 = ({ route, navigation }) => {
  const { getItem } = useStorage();
  const { idGrupoServEscolhido } = route.params;
  const { nomeGrupoServEscolhido } = route.params;
  const [tipoServicos, setTipoServicos] = useState({});

  useEffect(() => {
    (async () => {
      const jsonTipoServ = await getItem("@TipoServicos");
      const filteredTipoServ = await getItem("@filteredTipoServico");
      setTipoServicos(
        receberTipoServicos(
          idGrupoServEscolhido,
          nomeGrupoServEscolhido,
          filteredTipoServ
        )
      );
    })();
  }, []);

  return (
    <SafeAreaView paddingTop={100}>
      <FlatList
        alignItems={"center"}
        data={tipoServicos}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        contentContainerStyle={{ padding: 40 }}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate={"fast"}
        renderItem={({ item }) => (
          <View
            style={{
              marginHorizontal: 10,
              width: 250,
              backgroundColor: "lightgreen",
              borderRadius: 8,
              justifyContent: "flex-end",
            }}
          >
            <Button
              style={{ flex: 1, height: 100, width: 100 }}
              title={item.nomeTipoServ}
              onPress={() => {
                navigation.navigate("EscolhaAssunto", {
                  idGrupoServEscolhido: item.idGrupoServEscolhido,
                  nomeGrupoServEscolhido: item.nomeGrupoServEscolhido,
                  idTipoServEscolhido: item.idTipoServ,
                  nomeTipoServEscolhido: item.nomeTipoServ,
                });
              }}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};
