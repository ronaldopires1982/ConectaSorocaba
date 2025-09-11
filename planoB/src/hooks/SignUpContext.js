import React, { createContext, useState } from "react";

export const SignUpContext = createContext({});

function SignUpProvider({ children }) {
  const [formData, setFormData] = useState({
    titulo: "",
    prinome: "",
    sobrenome: "",
    cpf: "",
    datanasc: "",
    email: "",
    celular: "",
    telcom: "",
    telres: "",
    formacontato: "email",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    referencia: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    termsAcceptedAt: null,
  });

  const updateFormData = (newData) => {
    setFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const resetFormData = () => {
    setFormData({
      prinome: "",
      sobrenome: "",
      cpf: "",
      datanasc: "",
      email: "",
      celular: "",
      telcom: "",
      telres: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      referencia: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <SignUpContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </SignUpContext.Provider>
  );
}

export default SignUpProvider;
