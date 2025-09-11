//imports nativos
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// imports de terceiros
import { StatusBar } from "expo-status-bar";

//imports locais
import { filtrarAssuntos } from "../../api/CartaService";
import MyTextInput from "../../components/MyTextInput";

const getItemLayout = (_, index) => ({
  length: 61,
  offset: 61 * index,
  index,
});

const ListItem = memo(({ data, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.listItem}>
      <Text style={styles.itemText}>{data.name}</Text>
    </View>
  </TouchableOpacity>
));

export default function ListarAssuntos({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [assuntos, setAssuntos] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredAssuntos, setFilteredAssuntos] = useState([]);
  const { idGrupoEscolhido } = route.params;
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchAssuntos = async () => {
      try {
        const data = await filtrarAssuntos(idGrupoEscolhido);
        setAssuntos(data);
        setFilteredAssuntos(data);
      } catch (error) {
        console.error("Error fetching grupos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssuntos();
  }, [idGrupoEscolhido]);

  useEffect(() => {
    if (searchText.length >= 3) {
      const filtered = assuntos.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredAssuntos(filtered);
    } else if (searchText.length === 0) {
      setFilteredAssuntos(assuntos);
    }
  }, [searchText, assuntos]);

  // Add debouncing to improve performance
  const handleTextChange = useCallback((text) => {
    setSearchText(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set focus back after small delay (only when needed)
    if (inputRef.current) {
      searchTimeoutRef.current = setTimeout(() => {
        inputRef.current.focus();
      }, 50);
    }
  }, []);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const renderItem = useCallback(
    ({ item }) => (
      <ListItem
        data={item}
        onPress={() => {
          try {
            const idAssuntoEscolhido = item.id;
            console.log(
              `Assunto selecionado: ${item.name}, id: ${idAssuntoEscolhido}`
            );
            navigation.navigate("ExibeArtigo", { idAssuntoEscolhido });
          } catch (error) {
            console.error("Erro ao selecionar assunto:", error);
          }
        }}
      />
    ),
    [navigation]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (filteredAssuntos.length === 0) {
    return (
      <View style={styles.container}>
        <View>
          <MyTextInput
            ref={inputRef}
            placeholder="Pesquisar assunto"
            value={searchText}
            onChangeText={handleTextChange}
            showLabel={false}
            style={styles.searchInput}
            iconContainerStyle={styles.searchIconContainer}
          />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Nenhum assunto encontrado para o grupo selecionado.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <MyTextInput
        ref={inputRef}
        placeholder="Pesquisar assunto"
        value={searchText}
        onChangeText={handleTextChange}
        showLabel={false}
        style={styles.searchInput}
        iconContainerStyle={styles.searchIconContainer}
      />

      <FlatList
        style={{ marginTop: 10 }}
        contentContainerStyle={{ marginHorizontal: 20 }}
        data={filteredAssuntos}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        getItemLayout={getItemLayout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchInput: {
    marginHorizontal: 20,
    marginTop: 50,
    marginBottom: 10,
    paddingLeft: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  listItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "darkgrey",
    marginBottom: 10,
    backgroundColor: "#d3d3d38e",
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121212",
  },
});
