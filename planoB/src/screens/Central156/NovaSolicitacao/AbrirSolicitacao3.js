//imports nativos
import { FlatList, View, SafeAreaView, Button } from "react-native";
import React, { useEffect, useState } from "react";

//imports locais
import { receberAssuntos } from "../../../model/AbrirSolicitacao";
import useStorage from "../../../hooks/useStorage";

export const AbrirSolicitacao3 = ({ route, navigation }) => {
  const { idGrupoServEscolhido } = route.params;
  const { nomeGrupoServEscolhido } = route.params;
  const { idTipoServEscolhido } = route.params;
  const { nomeTipoServEscolhido } = route.params;
  const [assuntos, setAssuntos] = useState([]);
  const { getItem } = useStorage();

  useEffect(() => {
    (async () => {
      const jsonAssuntos = await getItem("@Assuntos");
      setAssuntos(
        receberAssuntos(
          idGrupoServEscolhido,
          nomeGrupoServEscolhido,
          idTipoServEscolhido,
          nomeTipoServEscolhido,
          jsonAssuntos
        )
      );
    })();
  }, []);

  return (
    <SafeAreaView paddingTop={100} paddingBottom={50}>
      <FlatList
        alignItems={"center"}
        data={assuntos}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        contentContainerStyle={{ padding: 40 }}
        renderItem={({ item }) => (
          <View>
            <Button
              title={item.nomeAssunto}
              onPress={() => {
                navigation.navigate("FormSolicitacao", {
                  idGrupoServEscolhido: item.idGrupoServ.value,
                  nomeGrupoServEscolhido: item.nomeGrupoServEscolhido,
                  idTipoServEscolhido: item.idTipoServ,
                  nomeTipoServEscolhido: item.nomeTipoServEscolhido,
                  idAssuntoEscolhido: item.idAssunto,
                  nomeAssuntoEscolhido: item.nomeAssunto,
                });
              }}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};
