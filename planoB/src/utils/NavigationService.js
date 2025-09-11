import { createRef } from "react";

// Cria a referência de navegação
export const navigationRef = createRef();

// Função para navegação que pode ser chamada de qualquer lugar
export function navigate(name, params) {
  if (navigationRef.current) {
    // Verifica se o método existe antes de chamar
    if (navigationRef.current.navigate) {
      navigationRef.current.navigate(name, params);
    } else {
      console.warn(
        "A referência de navegação existe porém o método de navegação não está disponível."
      );
    }
  } else {
    console.warn("A referência de navegação não está disponível.");
  }
}

// Método somente para debug
// export function debugNavigationRef() {
//   console.log("NavigationService.js: status da referência de navegação:", {
//     exists: !!navigationRef.current,
//     methods: navigationRef.current ? Object.keys(navigationRef.current) : "N/A",
//   });
// }
