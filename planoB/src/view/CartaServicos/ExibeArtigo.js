//import nativo
import { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";

//import de terceiros
import { WebView } from "react-native-webview";
import Constants from "expo-constants";

//import locais
import { chamarArtigo } from "../../api/CartaService";

const ExibirArtigo = function ({ route }) {
  const { idAssuntoEscolhido } = route.params;
  // console.log(
  //   "idAssuntoEscolhido chegando em ExibeArtigo:",
  //   idAssuntoEscolhido
  // );
  const [conteudoHTML, setConteudoHTML] = useState(null);
  const [error, setError] = useState(null);

  // console.log("Valor chegando em ExibirArtigo: ", idAssuntoEscolhido);

  useEffect(() => {
    const buscarArtigo = async () => {
      try {
        const source = await chamarArtigo(idAssuntoEscolhido);
        // Regex para substituir os caracteres &lt e &gt, se necessário
        const decodedSource = source
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"');
        setConteudoHTML(decodedSource);
        // console.log("Conteúdo atual HTML:", decodedSource);
      } catch (err) {
        console.error("Erro ao carregar o artigo:", err);
        setError("Falha ao carregar o artigo.");
      }
    };

    buscarArtigo();
  }, [idAssuntoEscolhido]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!conteudoHTML) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <WebView
      style={styles.container}
      originWhitelist={["*"]}
      source={{ html: conteudoHTML }}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn("WebView error:", nativeEvent);
      }}
      onNavigationStateChange={(url) => {}}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    paddinTop: Constants.statusBarHeight,
  },
  error: {
    color: "red",
    textAlign: "center",
    margin: 20,
  },
});

export default ExibirArtigo;
