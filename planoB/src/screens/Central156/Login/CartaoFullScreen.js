import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CartaoCidadaoComponent from "../../../components/CartaoCidadao";

const CartaoFullScreen = ({ navigation }) => {
  // Função para fechar o cartão em tela cheia e voltar para a tela anterior
  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Área tocável para fechar e voltar (em qualquer lugar da tela) */}
      <TouchableOpacity
        style={styles.touchableArea}
        onPress={handleClose}
        activeOpacity={1}
      >
        <CartaoCidadaoComponent isFullScreen={true} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  touchableArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CartaoFullScreen;
