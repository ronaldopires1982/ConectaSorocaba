// imports nativos
import { View } from "react-native";
import React, { forwardRef } from "react";

// imports de terceiros
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

// imports locais
import {
  Colors,
  LeftIcon,
  RightIcon,
  StyledInputLabel,
  StyledTextInput,
} from "./estilos";

const { brand, tertiary } = Colors;

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

const MyTextInput = forwardRef(
  (
    {
      border,
      borderColor,
      disabled,
      icon,
      iconContainerStyle,
      iconFamily = "octicons",
      label,
      maxHeight,
      rightIcon,
      rightIconColor,
      rightIconSize,
      showLabel = true,
      style,
      ...props
    },
    ref
  ) => {
    const IconComponent = IconFamilies[iconFamily.toLowerCase()];

    return (
      <View>
        <View style={iconContainerStyle}>
          <LeftIcon>
            {IconComponent && (
              <IconComponent name={icon} size={26} color={brand} />
            )}
          </LeftIcon>
          <RightIcon>
            {IconComponent && (
              <IconComponent
                name={rightIcon}
                size={rightIconSize}
                color={rightIconColor || tertiary}
              />
            )}
          </RightIcon>
        </View>
        {showLabel && <StyledInputLabel>{label}</StyledInputLabel>}
        <StyledTextInput
          ref={ref}
          border={border}
          borderColor={borderColor}
          maxHeight={maxHeight}
          editable={!disabled}
          style={[style, disabled && { opacity: 0.75 }]}
          {...props}
        />
      </View>
    );
  }
);

MyTextInput.displayName = "MyTextInput";

export default MyTextInput;
