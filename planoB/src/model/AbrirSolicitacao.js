import { saveSol } from "../api/SolicitacoesService";

class GrupoServicos {
  constructor(idGrupoServ, nomeGrupoServ) {
    this.idGrupoServ = idGrupoServ;
    this.nomeGrupoServ = nomeGrupoServ;
  }
}

class TipoServicos {
  constructor(
    idTipoServ,
    nomeTipoServ,
    idGrupoServEscolhido,
    nomeGrupoServEscolhido
  ) {
    this.idTipoServ = idTipoServ;
    this.nomeTipoServ = nomeTipoServ;
    this.idGrupoServEscolhido = idGrupoServEscolhido;
    this.nomeGrupoServEscolhido = nomeGrupoServEscolhido;
  }
}

class Assuntos {
  constructor(
    idAssunto,
    nomeAssunto,
    idTipoServ,
    nomeTipoServEscolhido,
    idGrupoServ,
    nomeGrupoServEscolhido
  ) {
    this.idAssunto = idAssunto;
    this.nomeAssunto = nomeAssunto;
    this.idTipoServ = idTipoServ;
    this.nomeTipoServEscolhido = nomeTipoServEscolhido;
    this.idGrupoServ = idGrupoServ;
    this.nomeGrupoServEscolhido = nomeGrupoServEscolhido;
  }
}

export const chamarAPIs = async () => {
  const respGrupoServ = await fetch(
    `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-servicosNovaApp.php?consultarGrupoServ=0`
  ).catch((error) =>
    console.log("Erro ao recuperar Grupo de Serviços.", error)
  );
  const dataGrupoServ = await respGrupoServ.json();
  const jsonGrupoServ = JSON.parse(dataGrupoServ);

  const respTipoServ = await fetch(
    `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-servicosNovaApp.php?consultarTipoServ`
  ).catch((error) =>
    console.log("Erro ao recuperar Tipos de Serviços.", error)
  );
  const dataTipoServ = await respTipoServ.json();
  const jsonTipoServ = JSON.parse(dataTipoServ);

  const respAssuntos = await fetch(
    `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-servicosNovaApp.php?consultarAssunto`
  ).catch((error) => console.log("Erro ao recuperar Assuntos.", error));
  const dataAssuntos = await respAssuntos.json();
  const jsonAssuntos = JSON.parse(dataAssuntos);

  let grupoServicos = [];
  for (let i = 0; i < jsonGrupoServ.entry_list.length; i++) {
    grupoServicos.push(
      new GrupoServicos(
        jsonGrupoServ.entry_list[i].name_value_list.id.value,
        jsonGrupoServ.entry_list[i].name_value_list.name.value
      )
    );
  }

  const resAPI = [grupoServicos, jsonTipoServ, jsonAssuntos];

  return resAPI;
};

export const receberTipoServicos = (
  idGrupoServEscolhido,
  nomeGrupoServEscolhido,
  filteredTipoServ
) => {
  let tipoServicos = [];
  for (let i = 0; i < filteredTipoServ.length; i++) {
    tipoServicos.push(
      new TipoServicos(
        filteredTipoServ[i].id,
        filteredTipoServ[i].name_value_list.name.value,
        filteredTipoServ[i].name_value_list.a01_grupo_servico_id_c.value,
        { value: nomeGrupoServEscolhido }
      )
    );
  }
  // const allTipos = ["Todos os serviços"];
  // for (let i = 0; i < jsonTipoServ.entry_list.length; i++) {
  //   allTipos.push(jsonTipoServ.entry_list[i].name_value_list.name.value);
  // }
  // console.log(allTipos);

  const tipoServicosFiltrados = tipoServicos.filter(
    (obj) => obj.idGrupoServEscolhido === idGrupoServEscolhido
  );
  return tipoServicosFiltrados;
};

//função que retorna os assuntos de acordo com o grupo e tipo de serviço escolhidos
export const receberAssuntos = (
  idGrupoServEscolhido,
  nomeGrupoServEscolhido,
  idTipoServEscolhido,
  nomeTipoServEscolhido,
  jsonAssuntos
) => {
  let assuntos = [];
  for (let i = 0; i < jsonAssuntos.entry_list.length; i++) {
    assuntos.push(
      new Assuntos(
        jsonAssuntos.entry_list[i].id,
        jsonAssuntos.entry_list[i].name_value_list.name.value,
        jsonAssuntos.entry_list[i].name_value_list.a01_tipo_servico_id_c.value,
        { value: nomeTipoServEscolhido },
        { value: idGrupoServEscolhido },
        { value: nomeGrupoServEscolhido }
      )
    );
  }

  const assuntosFiltrados = assuntos.filter(
    (obj) => obj.idTipoServ === idTipoServEscolhido
  );

  assuntosFiltrados.sort((a, b) =>
    a.nomeAssunto.localeCompare(b.nomeAssunto, "pt-BR")
  );

  return assuntosFiltrados;
};
class Registro {
  constructor(
    id_municipe,
    latitude_sol,
    longitude_sol,
    id_assunto_sol,
    assunto_sol,
    cep_sol,
    endereco_sol,
    numero_sol,
    bairro_sol,
    cidade_sol,
    descricao_sol,
    complemento_sol,
    uf_sol,
    referencia_sol
  ) {
    this.id_municipe = id_municipe;
    this.latitude_sol = latitude_sol;
    this.longitude_sol = longitude_sol;
    this.id_assunto_sol = id_assunto_sol;
    this.assunto_sol = assunto_sol;
    this.cep_sol = cep_sol;
    this.endereco_sol = endereco_sol;
    this.numero_sol = numero_sol;
    this.bairro_sol = bairro_sol;
    this.cidade_sol = cidade_sol;
    this.descricao_sol = descricao_sol;
    this.complemento_sol = complemento_sol;
    this.uf_sol = uf_sol;
    this.referencia_sol = referencia_sol;
  }
}
export const registrarSolicitacao = async (
  idMunicipe,
  idAssuntoEscolhido,
  nomeAssuntoEscolhido,
  cep,
  logradouro,
  numero,
  bairro,
  descricao,
  complemento
) => {
  let postSolicitacao = new Registro(
    idMunicipe,
    "-23,410877",
    "-47,3896963",
    idAssuntoEscolhido,
    nomeAssuntoEscolhido,
    cep,
    logradouro,
    numero,
    bairro,
    "Sorocaba",
    descricao,
    complemento,
    "SP",
    ""
  );

  // Chama a nova função, passando o objeto sem anexos
  const result = await registrarSolicitacaoComAnexos(postSolicitacao);
  console.log("[AbrirSolicitacao.js] Resultado da solicitação: ", result);

  return result;
  // saveSol(postSolicitacao);
  // console.log("chamou saveSol");
  // return saveSol(postSolicitacao);
};

export const registrarSolicitacaoComAnexos = async (dadosSolicitacao) => {
  try {
    console.log(
      "[AbrirSolicitacao.js] Registrando solicitação com anexos: ",
      dadosSolicitacao
    );

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-inc-cases-newApp.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosSolicitacao),
      }
    );

    // Check if response is ok before trying to parse
    if (!response.ok) {
      // If server returned an error status code
      const errorText = await response.text();
      console.error("Server returned error:", response.status, errorText);
      return {
        status: "error",
        message: `Erro do servidor: ${response.status}`,
        details: errorText,
      };
    }

    // Clone the response before reading it
    const responseClone = response.clone();

    // Tenta processar a resposta como JSON
    try {
      const responseData = await response.json();
      console.log(
        "[AbrirSolicitacao.js] Resposta da solicitação com anexos: ",
        responseData
      );
      return responseData;
    } catch (error) {
      console.error("Erro ao processar a resposta JSON: ", error);
      // Retorna a resposta bruta se não for JSON
      const textResponse = await responseClone.text();
      return {
        status: "error",
        message: "Erro ao processar resposta do servidor",
        rawResponse: textResponse,
      };
    }
  } catch (error) {
    console.error("Erro ao registrar solicitação com anexos: ", error);
    return {
      status: "error",
      message: error.message || "Erro ao registrar solicitação com anexos",
    };
  }
};
