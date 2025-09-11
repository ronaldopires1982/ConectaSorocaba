//imports nativos
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";

//imports locais
import { receberAssuntos } from "../../model/AbrirSolicitacao";
import useStorage from "../../hooks/useStorage";
import MyTextInput from "../../components/MyTextInput";

// Pure component for list items to prevent unnecessary renders
const AssuntoItem = React.memo(({ data, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(data)}
    accessible={true}
    accessibilityLabel={`Assunto: ${data.nomeAssunto}`}
    accessibilityRole="button"
    style={styles.touchableItem}
  >
    <View style={styles.listItem}>
      <Text style={styles.itemText} numberOfLines={0}>
        {data.nomeAssunto}
      </Text>
    </View>
  </TouchableOpacity>
));

export const EscolhaAssunto = ({ route, navigation }) => {
  const {
    idGrupoServEscolhido,
    nomeGrupoServEscolhido,
    idTipoServEscolhido,
    nomeTipoServEscolhido,
  } = route.params;

  // State management
  const [allAssuntos, setAllAssuntos] = useState([]);
  const [filteredAssuntos, setFilteredAssuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const inputRef = useRef(null);
  const { getItem } = useStorage();

  // Load initial data
  useEffect(() => {
    const loadAssuntos = async () => {
      try {
        const jsonAssuntos = await getItem("@Assuntos");
        const processedAssuntos = receberAssuntos(
          idGrupoServEscolhido,
          nomeGrupoServEscolhido,
          idTipoServEscolhido,
          nomeTipoServEscolhido,
          jsonAssuntos
        );

        setAllAssuntos(processedAssuntos);
        setFilteredAssuntos(processedAssuntos);
      } catch (error) {
        console.error("Error loading assuntos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAssuntos();
  }, []);

  // Filter effect - similar to ListaAssuntos approach
  useEffect(() => {
    if (searchText.length >= 3) {
      const filtered = allAssuntos.filter((item) =>
        item.nomeAssunto.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredAssuntos(filtered);
    } else if (searchText.length === 0) {
      setFilteredAssuntos(allAssuntos);
    }
  }, [searchText, allAssuntos]);

  // Handle text change with debounce
  const handleTextChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  // Navigation handler
  const handleNavigation = useCallback(
    (item) => {
      navigation.navigate("FormSolicitacao", {
        idGrupoServEscolhido: item.idGrupoServ.value,
        nomeGrupoServEscolhido: item.nomeGrupoServEscolhido,
        idTipoServEscolhido: item.idTipoServ,
        nomeTipoServEscolhido: item.nomeTipoServEscolhido,
        idAssuntoEscolhido: item.idAssunto,
        nomeAssuntoEscolhido: item.nomeAssunto,
      });
    },
    [navigation]
  );

  // Optimized key extractor
  const keyExtractor = useCallback((item) => item.idAssunto.toString(), []);

  // Empty component
  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.loadingContainer}>
        <Text>Nenhum assunto encontrado.</Text>
      </View>
    ),
    []
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <MyTextInput
          ref={inputRef}
          placeholder="Pesquisar assunto"
          value={searchText}
          onChangeText={handleTextChange}
          showLabel={false}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredAssuntos}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <AssuntoItem data={item} onPress={handleNavigation} />
        )}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchInput: {
    marginBottom: 10,
    paddingLeft: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  touchableItem: {
    width: "100%",
    marginBottom: 10,
  },
  listItem: {
    padding: 20,
    borderWidth: 1,
    borderColor: "darkgrey",
    backgroundColor: "#d3d3d38e",
    borderRadius: 8,
    minHeight: 70,
    width: "100%",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121212",
    flexShrink: 1,
  },
  listContainer: {
    padding: 20,
    width: "100%",
    flexGrow: 1,
  },
});
