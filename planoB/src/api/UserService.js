import { Alert } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { chamarAPIs } from "../model/AbrirSolicitacao";
import { updateTokenWithUserId } from "./NotificationService";
import useStorage from "../hooks/useStorage";

// Define chaves para o AsyncStorage (para token e informações do dispositivo)
const EXPO_PUSH_TOKEN_KEY = "expo_push_token";
const DEVICE_INFO_KEY = "device_info";

export const CadastrarNovoMunicipe = async (data) => {
  const urlAPI = `${process.env.EXPO_PUBLIC_API_DJANGO}/api/municipes/criar/`;

  console.log("[UserService.js] - JSON saída para cadastro de munícipe:", data);

  try {
    const response = await axios.post(urlAPI, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    let resposta;
    try {
      // Check if response.data is already parsed
      resposta =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      throw new Error("Invalid response format from server");
    }

    return {
      status: 200,
      data: resposta,
    };
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return {
      status: error.response?.status || 500,
      message:
        "Erro de conexão com API:" + (error.response?.data || error.message),
    };
  }
};

export const RecuperarSenha = async (cpfLimpo) => {
  if (cpfLimpo.length !== 11) {
    console.log("Entrou no if");
    Alert.alert(
      "Atenção",
      "Para recuperar seu acesso, preencha o campo CPF corretamente."
    );
    return "erro";
  } else {
    const urlAPI = `${process.env.EXPO_PUBLIC_API_HOST}/recuperasenha`;

    console.log("CPF capturado e:", cpfLimpo);
    console.log("Qtde dígitos CPF:", cpfLimpo.length);

    try {
      const response = await axios.post(urlAPI, {
        cpf_logon: cpfLimpo,
        senha_logon:
          "a88311f8472f2a9be88d5f75ce149b0cb796cde99bedb0310126ea96425f4edd",
      });

      const data = response.data;

      if (response.status === 200 && data) {
        const maskEmail = (email) => {
          const [username, domain] = email.split("@");
          const maskedUsername =
            username.slice(0, 3) + "*".repeat(username.length - 3);
          return `${maskedUsername}@${domain}`;
        };
        // console.log("Success response:", data);
        console.log("Endereço do email:", maskEmail(data.result));
        return maskEmail(data.result);
      }
      Alert.alert(
        "Erro na recuperação de senha",
        "O CPF não está cadastrado ou foi digitado incorretamente."
      );
      console.log("Erro de recuperação de senha.");
      return "erro";
    } catch (error) {
      console.log("Erro detalhado:", error);
      Alert.alert(
        "Erro de conexão",
        "Não foi possível conectar ao servidor. Tente novamente mais tarde."
      );
      return "erro";
    }
  }
};

/**
 * Realiza o login com CPF e senha na API Django.
 * @param {string} grant_type - O tipo de token a ser solicitado.
 * @param {object} credentials - Os dados para login.
 * @param {string} django_client_id - O ID do cliente na API Django.
 * @param {string} django_client_secret - O segredo do cliente na API Django.
 * @returns {Promise<Object>} - O objeto com o status e os tokens de acesso.
 */
export const Login = async (
  grant_type,
  credentials,
  django_client_id,
  django_client_secret
) => {
  const { saveItem } = useStorage();
  const url = `${process.env.EXPO_PUBLIC_API_DJANGO}/api/access_token/`;

  console.log("UserService.js: URL de login:", url);

  const formData = new URLSearchParams();
  formData.append("grant_type", grant_type);
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);
  formData.append("client_id", django_client_id);
  formData.append("client_secret", django_client_secret);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log("UserService.js: Resposta da chamada Login no Django:", data);

    if (data.error) {
      Alert.alert(
        "Erro de login",
        data.message ||
          "O CPF não está cadastrado ou foi digitado incorretamente, ou sua senha está incorreta."
      );
      console.log("UserService.js: Erro de login:", data.message);
      return { status: "erro", message: data.message };
    }

    if (data.access_token) {
      try {
        const dadosMunicipe = await ConsultarMunicipe(
          data.access_token,
          credentials.username
        );
        console.log("UserService.js: Dados do munícipe:", dadosMunicipe);

        if (dadosMunicipe) {
          try {
            await Promise.all([
              chamarAPIs().then((res) => {
                saveItem("@GrupoServicos", res[0]);
                saveItem("@TipoServicos", res[1]);
                saveItem("@Assuntos", res[2]);
              }),
            ]);

            console.log("Retorno da API Django acessar token:", data);
            return {
              status: "sucesso",
              tokens: data,
              dadosMunicipe: dadosMunicipe,
            };
          } catch (error) {
            console.error(
              "UserService.js: Erro ao buscar grupos de serviço, tipos de serviço e assuntos:",
              error
            );
            Alert.alert(
              "Erro",
              "Erro ao buscar grupos de serviço, tipos de serviço e assuntos. Tente novamente mais tarde."
            );
          }
        }
        return {
          status: "sucesso",
          tokens: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          },
          dadosMunicipe: dadosMunicipe,
        };
      } catch (error) {
        console.error("[UserService.js] - Erro ao consultar munícipe:", error);
        Alert.alert(
          "Erro",
          "Erro ao consultar munícipe. Tente novamente mais tarde."
        );
        return { status: "erro", message: error.message };
      }
    }
  } catch (error) {
    console.error("UserService.js: Erro de autenticação:", error);
    Alert.alert("Erro de conexão", "Erro ao conectar com o servidor");
    return "erro";
  }
};

/**
 * Consulta um munícipe cadastrado na API Django.
 * @param {string} bearerToken - O token de acesso ao servidor.
 * @param {string} cpf - O CPF do munícipe.
 * @returns {Promise<Object>} - O munícipe encontrado.
 * @throws {Error} - Se ocorrer um erro na requisição.
 */
export const ConsultarMunicipe = async (bearerToken, cpf) => {
  cpfLimpo = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos

  const url = `${process.env.EXPO_PUBLIC_API_DJANGO}/api/municipes/${cpfLimpo}/`;
  console.log("UserService.js: entrou no ConsultarMunicipe. URL é:", url);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Erro HTTP! status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("erro ao consultar munícipe:", error);
    Alert.alert(
      "Erro",
      "Erro ao consultar munícipe. Tente novamente mais tarde."
    );
    throw error;
  }
};
/**
 * Realiza o logout na API Django.
 * @param {string} token - Token de acesso do usuário
 * @param {string} client_id - ID do cliente Django
 * @param {string} client_secret - Secret do cliente Django
 * @returns {Promise<Object>} - O objeto com o status e o status HTTP.
 */
export const LogOut = async (token, client_id, client_secret) => {
  const url = `${process.env.EXPO_PUBLIC_API_DJANGO}/api/revoke_token/`;

  const formData = new URLSearchParams();
  formData.append("client_id", client_id);
  formData.append("client_secret", client_secret);
  formData.append("token", token);

  console.log("[UserService.js] - JSON de saída:", formData);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const httpResponse = response.status;
    console.log(
      "UserService.js: Status http da chamada LogOut no Django:",
      httpResponse
    );
    return {
      status: "sucesso",
      message: "Usuário deslogado com sucesso.",
      httpStatus: httpResponse,
    };
  } catch (error) {
    console.log("UserService.js: Erro ao deslogar do Django:", error);
    return { status: "erro", message: error.message };
  }
};

/**
 * Atualiza dados do cadastro de munícipe via Django
 * @param {string} token - O token de acesso do munícipe ao servidor
 * @param {string} client_id - ID do cliente (App156) no Django
 * @param {string} client_secret - Secret do cliente (App156) no Django
 * @param {string} cpf - CPF do munícipe
 * @param {object} data - Dados do cadastro do munícipe
 * @returns {Promise<Object>} - O objeto com o status e o status HTTP
 * @throws {Error} - Se ocorrer um erro na requisição
 */
export const AtualizarMunicipe = async (
  token,
  client_id,
  client_secret,
  cpf,
  data
) => {
  const url = `${process.env.EXPO_PUBLIC_API_DJANGO}/api/municipes/${cpf}/editar/`;

  const formData = new URLSearchParams(data);
  formData.append("client_id", client_id);
  formData.append("client_secret", client_secret);
  // formData.append("token", token);

  console.log(
    "[UserService.js] - JSON de saída para editar cadastro de municipe:",
    formData
  );

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: formData.toString(),
    });

    const httpResponse = response.status;
    console.log(
      "[UserService.js] - Status http da chamada AtualizarMunicipe no Django:",
      httpResponse
    );
    return {
      status: "sucesso",
      message: "Usuário atualizado com sucesso.",
      httpStatus: httpResponse,
    };
  } catch (error) {
    console.log(
      "[UserService.js] - Erro ao atualizar municipe no Django:",
      error
    );
    return { status: "erro", message: error.message };
  }
};
