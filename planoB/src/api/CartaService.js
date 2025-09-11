export const chamarGruposServ = async () => {
  const respGruposServ = await fetch(
    `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-knowledgebaseApp.php`
  ).catch((error) =>
    console.log("Erro ao recuperar Grupos de Serviços.", error)
  );

  const dataGruposServ = await respGruposServ.json();
  // console.log(dataGruposServ);
  return dataGruposServ;
};

export const filtrarAssuntos = async (idGrupoEscolhido) => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-knowledgebaseApp.php?consultarArtigos_idGrupoServ=${idGrupoEscolhido}`
    );

    const jsonData = await response.json();
    // console.log(jsonData.assuntos);

    return jsonData.assuntos;
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
    throw error;
  }
};

export const chamarArtigo = async (idAssuntoEscolhido) => {
  // console.log("Valor chegando em chamarArtigo: ", idAssuntoEscolhido);
  const respArtigo = await fetch(
    `${process.env.EXPO_PUBLIC_API_HOST}/custom/api/app/api-knowledgebaseApp.php?consultarArtigo=${idAssuntoEscolhido}`
  ).catch((error) => console.log("Erro ao recuperar artigo.", error));

  const dataArtigo = await respArtigo.json();
  //
  //   console.log("idAssuntoEscolhido é:", idAssuntoEscolhido);
  //   console.log("dataArtigo é:", dataArtigo);

  artigoFormatado = `
    <html xmlns:msxsl="urn:schemas-microsoft-com:xslt">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <base target="_blank">
        <style>
          body {
            margin: 0;
            padding: 16px;
            font-family: system-ui, -apple-system, sans-serif;
            width: 100%;
            box-sizing: border-box;
          }
          table {
            width: 100% !important;
            border-collapse: collapse;
            table-layout: fixed;
          }
          td {
            padding: 8px;
            word-wrap: break-word;
            max-width: 100%;
          }
          /* Force all paragraphs to fit screen */
          p {
            width: 100% !important;
            max-width: 100% !important;
            word-wrap: break-word;
            margin: 8px 0 !important;
          }
          /* Reset font size and line height for better mobile display */
          font[size="2"], font[size="3"] {
            font-size: 16px !important;
            line-height: 1.5 !important;
          }
          /* Ensure specific styles are applied */
          td[style*="font-size:16pt"] {
            font-size: 24px !important;
            font-weight: bold;
            line-height: 1.2 !important;
          }
          td[style*="color:#666666"] {
            color: #666666 !important;
            font-size: 14px !important;
          }
          td[style*="color:#000066"] {
            color: #000066 !important;
            font-size: 16px !important;
            font-weight: bold !important;
            border-bottom: 1px solid #999999 !important;
            padding-bottom: 8px !important;
          }
          /* Reset western styles that might affect width */
          .western {
            width: 100% !important;
            max-width: 100% !important;
            margin: 8px 0 !important;
          }
        </style>
      </head>
      <body>${dataArtigo.artigo}</body>
    </html>`;
  // console.log("Retorno da chamada em chamarArtigo:", artigoFormatado);
  return artigoFormatado;
};
