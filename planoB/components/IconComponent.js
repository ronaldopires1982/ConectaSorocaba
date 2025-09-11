import {
  Octicons,
  Entypo,
  Feather,
  Ionicons,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Foundation,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Colors } from "../src/Componentes/estilos";
import React from "react";

const { brand } = Colors;

const IconFamilies = {
  octicons: Octicons,
  entypo: Entypo,
  feather: Feather,
  ionicons: Ionicons,
  fontawesome: FontAwesome,
  fontawesome5: FontAwesome5,
  fontawesome6: FontAwesome6,
  foundation: Foundation,
  materialicons: MaterialIcons,
  materialcommunityicons: MaterialCommunityIcons,
};

const IconComponent = ({
  name,
  size = 24,
  color = brand,
  iconFamily,
  style = {},
}) => {
  const IconComponent = IconFamilies[iconFamily.toLowerCase()];

  return (
    <IconComponent
      name={name}
      iconFamily={iconFamily}
      size={size}
      color={color}
      style={style}
    />
  );
};

export default IconComponent;
