import axios from "axios";

export const buscaCEP = async (cep) => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_COMDATA_URL}/pesquisarporcep?cep=${cep}`
  ).catch((error) => console.log("Erro ao fazer a busca por CEP.", error));
  const data = await response.json();

  return await data;
};

export const buscaUF = async () => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_COMDATA_URL}/listarufs`
  ).catch((error) => console.log("Erro ao fazer a busca de UF.", error));
  const data = await response.json();

  const updatedData = data.map((item) => ({
    id: item.ufSigla,
    text: item.ufNome,
  }));

  // console.log(updatedData);

  return await updatedData;
};

export const buscaCidadesPorUF = async (uf) => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_COMDATA_URL}/listarlocalidadescombo?uf=${uf}`
  ).catch((error) =>
    console.log("Erro ao fazer a busca de cidades por UF.", error)
  );
  const data = await response.json();

  const updatedData = data.map((item) => ({
    text: item.text,
  }));

  // console.log(updatedData);

  return await updatedData;
};
