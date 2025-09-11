import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import Routes from "./src/navigation/index";
import SignUpProvider from "./src/hooks/SignUpContext";
import SignInProvider from "./src/hooks/SignInContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { setupNotifications } from "./src/utils/NotificationSetup";
import { navigationRef } from "./src/utils/NavigationService";

// Configura como as notificações devem aparecer no app em segundo plano
setupNotifications();

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <SignInProvider>
        <SignUpProvider>
          <NotificationProvider>
            <Routes />
          </NotificationProvider>
        </SignUpProvider>
      </SignInProvider>
    </NavigationContainer>
  );
}
