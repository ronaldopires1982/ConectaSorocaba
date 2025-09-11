// LogoHeader.js
import React from "react";
import { View } from "react-native";
import { Avatar, PageLogo } from "./estilos";

const LogoHeader = () => {
  return (
    <View>
      <Avatar
        resizeMode="cover"
        source={require("../assets/img/logopms.jpg")}
      />
      <PageLogo
        resizeMode="contain"
        source={require("../assets/img/central156.png")}
      />
    </View>
  );
};

export default LogoHeader;
