import AsyncStorage from "@react-native-async-storage/async-storage";

const useStorage = () => {
  // Buscar os itens salvos
  const getItem = async (key) => {
    try {
      const savedValue = await AsyncStorage.getItem(key);
      // console.log("Valor resgatado do AsyncStorage com sucesso!");
      return JSON.parse(savedValue);
    } catch (error) {
      console.log("[useStorage.js] - Erro ao buscar o valor salvo", error);
      return [];
    }
  };

  // Salvar um item no storage
  const saveItem = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      // console.log("Valor capturado pelo AsyncStorage com sucesso!");
    } catch (error) {
      console.log("[useStorage.js] - Erro ao salvar o valor", error);
      return [];
    }
  };

  // Remover um item do storage
  const clearItem = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      // console.log("Valor removido do AsyncStorage com sucesso!");
      return true;
    } catch (error) {
      console.log("[useStorage.js] - Erro ao remover o valor", error);
      return false;
    }
  };

  return {
    getItem,
    saveItem,
    clearItem,
  };
};

export default useStorage;
