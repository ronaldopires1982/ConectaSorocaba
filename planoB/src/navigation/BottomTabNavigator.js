// src/navigation/BottomTabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";

// Importa os ícones personalizados
import PrefeituraIconPadrao from "../components/icons/PrefeituraIconPadrao";
import PrefeituraIconPreenchido from "../components/icons/PrefeituraIconPreenchido";
import ServicosIconPadrao from "../components/icons/ServicosIconPadrao";
import ServicosIconPreenchido from "../components/icons/ServicosIconPreenchido";
import CartaoIconPadrao from "../components/icons/CartaoIconPadrao";
import CartaoIconPreenchido from "../components/icons/CartaoIconPreenchido";
import SinoIconPadrao from "../components/icons/SinoIconPadrao";
import SinoIconPreenchido from "../components/icons/SinoIconPreenchido";
import EngrenagemIconPadrao from "../components/icons/EngrenagemIconPadrao";
import EngrenagemIconPreenchido from "../components/icons/EngrenagemIconPreenchido";

// Importação de navegadores Stack
import InicioStackNavigator from "./InicioStackNavigator";
import ServicesStackNavigator from "./ServicesStackNavigator";
import DocumentsStackNavigator from "./DocumentsStackNavigator";
import NotificationsStackNavigator from "./NotificationsStackNavigator";
import SettingsStackNavigator from "./SettingsStackNavigator";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#004db3d9", // Sorocaba brand color
        tabBarInactiveTintColor: "#9Ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="InicioTab"
        component={InicioStackNavigator}
        options={{
          tabBarLabel: "Início",
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {focused ? (
                <PrefeituraIconPreenchido
                  width={24}
                  height={24}
                  color={color}
                />
              ) : (
                <PrefeituraIconPadrao width={24} height={24} color={color} />
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ServicosTab"
        component={ServicesStackNavigator}
        options={{
          tabBarLabel: "Serviços",
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {focused ? (
                <ServicosIconPreenchido width={24} height={24} color={color} />
              ) : (
                <ServicosIconPadrao width={24} height={24} color={color} />
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="DocumentosTab"
        component={DocumentsStackNavigator}
        options={{
          tabBarLabel: "Documentos",
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {focused ? (
                <CartaoIconPreenchido width={24} height={24} color={color} />
              ) : (
                <CartaoIconPadrao width={24} height={24} color={color} />
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="NotificacoesTab"
        component={NotificationsStackNavigator}
        options={{
          tabBarLabel: "Notificações",
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {focused ? (
                <SinoIconPreenchido width={24} height={24} color={color} />
              ) : (
                <SinoIconPadrao width={24} height={24} color={color} />
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ConfiguracoesTab"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: "Configurações",
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {focused ? (
                <EngrenagemIconPreenchido
                  width={24}
                  height={24}
                  color={color}
                />
              ) : (
                <EngrenagemIconPadrao width={24} height={24} color={color} />
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
