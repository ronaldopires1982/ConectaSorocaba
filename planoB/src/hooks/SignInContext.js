import React, { createContext, useState } from "react";

export const SignInContext = createContext({});

function SignInProvider({ children }) {
  const [user, setUser] = useState({
    idMunicipe: "",
    nome: "",
    sobrenome: "",
    cpf: "",
    email: "",
    dataNascimento: "",
    celular: "",
    telcom: "",
    telres: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    referencia: "",
    isLoggedIn: false,
  });

  const logIn = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
      isLoggedIn: true,
    }));
  };

  const logContextOut = () => {
    setUser({
      idMunicipe: "",
      nome: "",
      sobrenome: "",
      cpf: "",
      email: "",
      dataNascimento: "",
      celular: "",
      telcom: "",
      telres: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      referencia: "",
      isLoggedIn: false,
    });
  };

  const updateUserData = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
      isLoggedIn: true,
    }));
  };

  return (
    <SignInContext.Provider
      value={{ user, logIn, logContextOut, updateUserData }}
    >
      {children}
    </SignInContext.Provider>
  );
}

export default SignInProvider;
