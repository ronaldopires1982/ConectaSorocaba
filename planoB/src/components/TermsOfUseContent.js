// src/components/TermsOfUseContent.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "./estilos";

const { darkLight, primary } = Colors;

const TermsOfUseContent = () => {
  return (
    <View style={styles.container}>
      <View style={styles.termsContainer}>
        <Text style={styles.title}>
          Termo de Consentimento para Tratamento de Dados pessoais
        </Text>

        <Text style={styles.paragraph}>
          Venho por meio deste aceite, autorizar que a Prefeitura municipal de
          Sorocaba, inscrita no CNPJ sob nº 46.634.044/0001-74, em razão de
          cadastro para prestação de serviços ao munícipe, disponha dos meus
          dados pessoais e dados pessoais sensíveis, de acordo com os artigos 7º
          e 11º da lei nº 13.709/2018, conforme disposto neste termo:
        </Text>

        <Text style={styles.sectionTitle}>Dados Pessoais Tratados</Text>

        <View style={styles.listContainer}>
          <Text style={styles.listItem}>• Nome completo;</Text>
          <Text style={styles.listItem}>• Nome social;</Text>
          <Text style={styles.listItem}>• Data de Nascimento;</Text>
          <Text style={styles.listItem}>• Endereço completo;</Text>
          <Text style={styles.listItem}>
            • Números de telefone, WhatsApp e endereço de email.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Responsabilidade pela Segurança de Dados
        </Text>

        <Text style={styles.paragraph}>
          A Prefeitura Municipal de Sorocaba se responsabiliza por manter
          medidas de segurança, técnicas e administrativas suficientes para
          proteger os dados pessoais do munícipe, comunicando tanto ao munícipe
          quanto à Autoridade Nacional de Proteção de Dados (ANPD), caso ocorra
          algum incidente de segurança que possa acarretar riscos relevantes,
          conforme previsto no artigo 48 da Lei 13.709/2018.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  termsContainer: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 20,
  },
  paragraph: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    textAlign: "justify",
    marginBottom: 8,
  },
  listContainer: {
    marginLeft: 8,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default TermsOfUseContent;
