import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { chamarGruposServ } from "../../../api/CartaService";
import { useState, useEffect } from "react";

import { Colors } from "../../../components/estilos";

const { primary } = Colors;

export default function MenuGrupoServ({ navigation }) {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const data = await chamarGruposServ();
        setGrupos(data);
      } catch (error) {
        console.error("Error fetching grupos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrupos();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.buttonConteiner}>
          {grupos.map((grupo) => (
            <TouchableOpacity
              key={grupo.id}
              style={styles.button}
              onPress={() => {
                try {
                  const idGrupoEscolhido = grupo.id;
                  console.log(
                    `Grupo selecionado: ${grupo.name}, id: ${idGrupoEscolhido}`
                  );
                  // Handle the filtered assuntos here
                  // For example, you might want to navigate to ListaAssuntos with the data:
                  navigation.navigate("ListaAssuntos", { idGrupoEscolhido });
                } catch (error) {
                  console.error("Error filtering assuntos:", error);
                  // Handle the error appropriately, maybe show an alert to the user
                }
              }}
            >
              <Text style={styles.text}>{grupo.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 5,
    // elevation: 2,
    backgroundColor: "#004db3d9",
    width: 110,
    height: 110,
  },
  buttonConteiner: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
    alignContent: "center",
    minHeight: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  text: {
    textAlign: "center",
    color: primary,
  },
});
