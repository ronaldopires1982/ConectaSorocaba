// imports nativos
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from "react-native";

// imports de terceiros
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";

// imports locais
import { SignInContext } from "../../../hooks/SignInContext";
import { Colors, TextLink, TextLinkContent } from "../../../components/estilos";
import { formatCPF, formatPhoneNumber } from "../../../utils/ValidarFormatar";
import { ConsultarMunicipe } from "../../../api/UserService";
import { ModalLoading } from "../../../components/Modal";

// imports de hooks
import useStorage from "../../../hooks/useStorage";

const { brand, primary } = Colors;

const Profile = ({ navigation }) => {
  const { user, updateUserData } = useContext(SignInContext);
  const { getItem } = useStorage();
  const [dadosMunicipe, setDadosMunicipe] = useState({});
  const [modalLoadingVisible, setModalLoadingVisible] = useState(false);

  // função para formatar o endereço do usuário
  const formatAddress = (endereco) => {
    if (!endereco) return { firstLine: "", complementLine: "", secondLine: "" };

    let firstLine = "";
    let secondLine = "";

    // First line: street address and number
    if (endereco.rua) {
      firstLine = endereco.rua;

      if (endereco.numero) {
        firstLine += `, ${endereco.numero}`;
      }

      if (endereco.complemento) {
        firstLine += ` - ${endereco.complemento}`;
      }

      if (endereco.bairro) {
        firstLine += ` - ${endereco.bairro}`;
      }
    }

    // Second line: CEP, city and state
    const parts = [];
    if (endereco.cep) {
      parts.push(`CEP ${endereco.cep}`);
    }
    if (endereco.cidade) {
      parts.push(endereco.cidade);
    }
    if (endereco.estado) {
      // Replace the last separator with '/' before the UF
      secondLine = parts.join(" - ");
      if (parts.length > 0) {
        secondLine += ` / ${endereco.estado}`;
      } else {
        secondLine = endereco.estado;
      }
    } else {
      secondLine = parts.join(" - ");
    }

    return {
      firstLine: firstLine || "",
      complementLine: endereco.referencia || "",
      secondLine: secondLine || "",
    };
  };

  const ProfileField = ({ label, value, style }) => {
    // Handle address field specially
    if (typeof value === "object" && value !== null) {
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>
            {value.firstLine || "NÃO INFORMADO"}
            {(value.firstLine || value.complementLine) &&
              value.secondLine &&
              "\n"}
            {value.secondLine}
            {value.complementLine && "\n"}
            {value.complementLine}
          </Text>
          <View style={[styles.separator, style]} />
        </View>
      );
    }

    // Regular field rendering
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value || "NÃO INFORMADO"}</Text>
        <View style={[styles.separator, style]} />
      </View>
    );
  };

  useEffect(() => {
    const buscaDadosMunicipe = async () => {
      try {
        setModalLoadingVisible(true);
        const bearerToken = await getItem("@access_token");

        if (!bearerToken) {
          console.log(
            "[DadosPerfil.js] - Token de acesso (Bearer Token) não encontrado."
          );
          setModalLoadingVisible(false);
          return;
        }

        if (!user || !user.cpf) {
          console.log("[DadosPerfil.js] - CPF do usuário não encontrado.");
          setModalLoadingVisible(true);
          return;
        }
        const municipe = await ConsultarMunicipe(bearerToken, user.cpf);

        if (municipe) {
          setDadosMunicipe(municipe);

          console.log(
            "[DadosPerfil.js] - Resultado da chamada para buscar dados do munícipe:",
            municipe
          );

          // Atualizar os dados do usuário no contexto, se necessário
          if (
            municipe.dados_pessoais &&
            municipe.contato &&
            municipe.endereco
          ) {
            const updatedUserData = {
              ...user,
              nome: municipe.dados_pessoais.nome,
              sobrenome: municipe.dados_pessoais.sobrenome,
              cpf: municipe.dados_pessoais.cpf,
              email: municipe.contato.email,
              celular: municipe.contato.celular,
              telcom: municipe.contato.tel_comercial,
              telres: municipe.contato.tel_residencial,
              cep: municipe.endereco.cep,
              logradouro: municipe.endereco.rua,
              numero: municipe.endereco.numero,
              complemento: municipe.endereco.complemento,
              bairro: municipe.endereco.bairro,
              cidade: municipe.endereco.cidade,
              uf: municipe.endereco.estado,
              referencia: municipe.endereco.referencia,
            };
            updateUserData(updatedUserData);
          }
        }
      } catch (error) {
        console.error(
          "[DadosPerfil.js] - Erro ao buscar dados do munícipe:",
          error
        );
      } finally {
        setModalLoadingVisible(false);
      }
    };
    // Chama a função para buscar os dados do munícipe
    buscaDadosMunicipe();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ModalLoading isVisible={modalLoadingVisible} />

      {!dadosMunicipe ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brand} />
          <Text style={styles.loadingText}>
            Carregando dados do munícipe...
          </Text>
        </View>
      ) : (
        <>
          {/* Profile Avatar and Header Info */}
          <View style={styles.headerContainer}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Feather name="user" size={50} color={brand} />
              </View>
            </View>
            <Text style={styles.headerName}>
              {dadosMunicipe?.dados_pessoais?.nome_completo ||
                `${dadosMunicipe?.dados_pessoais?.nome || ""} ${dadosMunicipe?.dados_pessoais?.sobrenome || ""}`}
            </Text>
          </View>
        </>
      )}

      {/* Profile Information */}
      <ScrollView style={styles.infoContainer}>
        <ProfileField
          label="CPF:"
          value={
            dadosMunicipe?.dados_pessoais?.cpf
              ? formatCPF(dadosMunicipe.dados_pessoais.cpf)
              : ""
          }
        />
        <ProfileField label="E-mail:" value={dadosMunicipe?.contato?.email} />
        <ProfileField
          label="Celular:"
          value={formatPhoneNumber(dadosMunicipe?.contato?.celular, "celular")}
        />
        <ProfileField
          label="Telefone comercial:"
          value={formatPhoneNumber(dadosMunicipe?.contato?.tel_comercial)}
        />
        <ProfileField
          label="Telefone residencial:"
          value={formatPhoneNumber(dadosMunicipe?.contato?.tel_residencial)}
        />

        {dadosMunicipe?.dados_pessoais?.data_nascimento && (
          <ProfileField
            label="Data de nascimento:"
            value={new Date(
              dadosMunicipe.dados_pessoais.data_nascimento
            ).toLocaleDateString()}
          />
        )}

        <ProfileField
          label="Endereço completo:"
          value={formatAddress(dadosMunicipe?.endereco)}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
      <View style={styles.updateContainer}>
        <TextLink onPress={() => navigation.navigate("EditProfile")}>
          <TextLinkContent style={styles.updateText}>
            Deseja atualizar seu cadastro?
          </TextLinkContent>
        </TextLink>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: brand,
  },
  headerContainer: {
    backgroundColor: brand,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  headerName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    marginTop: 5,
    fontStyle: "italic",
  },
  infoContainer: {
    flex: 1,
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 5,
  },
  updateContainer: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
  },
  updateText: {
    color: "#4a90e2",
    fontSize: 16,
  },
});

export default Profile;
