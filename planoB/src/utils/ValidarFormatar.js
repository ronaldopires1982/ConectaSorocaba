export const validateCPF = (cpf) => {
  const currentCPF = cpf;
  let sum = 0;
  let strCPF = currentCPF.replace(/\D/g, "");
  if (strCPF.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  let allSameDigit = true;
  const firstDigit = parseInt(strCPF[0]);
  for (let i = 1; i < 11; i++) {
    if (parseInt(strCPF[i]) !== firstDigit) {
      allSameDigit = false;
      // console.log("passagem allsamedigit FALSE");
      break;
    }
  }
  if (allSameDigit) {
    // console.log("passagem allsamedigit TRUE");
    return false;
  }

  //Calcula a soma para o primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  }
  // console.log(sum, "1º digito");
  if (
    (sum % 11 < 2 && strCPF.substring(9, 10) == "0") ||
    (sum % 11 >= 2 && strCPF.substring(9, 10) == 11 - (sum % 11))
  ) {
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }
    // console.log(sum);
    if (
      (sum % 11 < 2 && strCPF.substring(10, 11) == "0") ||
      (sum % 11 >= 2 && strCPF.substring(10, 11) == 11 - (sum % 11))
    ) {
      return true;
    }
    return false;
  }
  return false;
};

export const formatCPF = (cpf) => {
  const strCPF = cpf.replace(/\D/g, "");

  if (strCPF.length <= 3) {
    return `${strCPF}`;
  } else if (strCPF.length < 7) {
    return `${strCPF.substring(0, 3)}.${strCPF.substring(3, 6)}`;
  } else if (strCPF.length < 10) {
    return `${strCPF.substring(0, 3)}.${strCPF.substring(
      3,
      6
    )}.${strCPF.substring(6, 9)}`;
  } else if (strCPF.length >= 10) {
    return `${strCPF.substring(0, 3)}.${strCPF.substring(
      3,
      6
    )}.${strCPF.substring(6, 9)}-${strCPF.substring(9, 12)}`;
  }
};

export const validateDate = (date) => {
  // console.log("entrou no validateDate");
  const currentDate = date;
  let strDate = currentDate.replace(/\D/g, "");
  console.log("dia:", strDate.substring(0, 2));
  console.log("mês:", strDate.substring(2, 4));
  console.log("ano:", strDate.substring(4, 8));
  if (
    currentDate.length < 10 ||
    parseInt(strDate.substring(4, 8)) < new Date().getFullYear() - 122 ||
    parseInt(strDate.substring(4, 8)) > new Date().getFullYear() - 16 ||
    parseInt(strDate.substring(0, 2)) < 1 ||
    parseInt(strDate.substring(0, 2)) > 31 ||
    parseInt(strDate.substring(2, 4)) < 1 ||
    parseInt(strDate.substring(2, 4)) > 12
  ) {
    console.log("data inválida");
    return false;
  }

  switch (strDate.substring(2, 4)) {
    case "01":
    case "03":
    case "05":
    case "07":
    case "08":
    case "10":
    case "12":
      if (parseInt(strDate.substring(0, 2)) > 31) {
        return false;
      }
      break;
    case "04":
    case "06":
    case "09":
    case "11":
      if (parseInt(strDate.substring(0, 2)) > 30) {
        return false;
      }
      break;
    case "02":
      if (parseInt(strDate.substring(4, 8)) % 4 === 0) {
        if (
          strDate.substring(6, 8) === "00" &&
          parseInt(strDate.substring(4, 8)) % 400 === 0
        ) {
          if (parseInt(strDate.substring(0, 2)) > 29) {
            return false;
          }
          break;
        }
        if (parseInt(strDate.substring(0, 2)) > 29) {
          return false;
        }
        break;
      }
      if (parseInt(strDate.substring(0, 2)) > 28) {
        return false;
      }
      break;
  }
  return true;
};

export const formatDate = (date) => {
  const strDate = date.replace(/\D/g, "");

  if (strDate.length < 3) {
    return `${strDate}`;
  } else if (strDate.length < 5) {
    return `${strDate.substring(0, 2)}/${strDate.substring(2, 4)}`;
  } else {
    return `${strDate.substring(0, 2)}/${strDate.substring(
      2,
      4
    )}/${strDate.substring(4, 8)}`;
  }
};

// Converte dd/mm/aaaa para yyyy-mm-dd
export const convertDateToApiFormat = (date) => {
  console.log("ValidarFormatar.js - convertDateToApiFormat:", date);
  const parts = date.split("/");
  console.log("ValidarFormatar.js - parts:", parts);

  const dia = parts[0].substring(0, 2);
  const mes = parts[0].substring(2, 4);
  const ano = parts[0].substring(4, 8);

  console.log("ValidarFormatar.js - data reformatada:", `${ano}-${mes}-${dia}`);

  return `${ano}-${mes}-${dia}`;
};

export const validatePhoneNumber = (phoneNumber, fieldType) => {
  const numbers = phoneNumber.replace(/\D/g, "");

  if (numbers[0] === "0" || numbers[1] === "0") {
    return {
      isValid: false,
      error: "Nenhum dos primeiros dígitos não podem ser 0",
    };
  }

  if (fieldType === "celular") {
    if (numbers.length !== 11) {
      return { isValid: false, error: "Número de celular deve ter 11 dígitos" };
    }
    if (parseInt(numbers[2]) < 7) {
      return {
        isValid: false,
        error: "Celular deve começar com 7, 8 ou 9.",
      };
    }
  } else {
    if (numbers.length !== 10) {
      return {
        isValid: false,
        error: "Número de telefone fixo deve ter 10 dígitos",
      };
    }
    if (parseInt(numbers[2]) > 6 || parseInt(numbers[2]) <= 1) {
      return {
        isValid: false,
        error: "Telefone fixo não pode começar com 1, 7, 8 ou 9.",
      };
    }
  }

  return { isValid: true, error: null };
};

// Formata o número de telefone enquanto é digitado
export const formatPhoneNumber = (value, fieldType) => {
  if (!value) return "";

  const numbers = value.replace(/\D/g, "");

  // If first digit is 0, return empty string
  if (numbers.length > 0 && numbers[0] === "0") {
    return "";
  }

  if (fieldType === "celular") {
    // Formato: (00) 00000-0000
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  } else {
    // Formato: (00) 0000-0000
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6,
        10
      )}`;
    }
  }
};

export const formatCEP = (cep) => {
  const numbers = cep.replace(/\D/g, "");
  if (numbers.length <= 5) {
    return `${numbers.substring(0, 5)}`;
  } else {
    return `${numbers.substring(0, 5)}-${numbers.substring(5, 9)}`;
  }
};
