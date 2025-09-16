import Styled from "styled-components";
import { View, TextInput, TouchableOpacity } from "react-native";
import Constants from "expo-constants";

export const StatusBarHeight = Constants.statusBarHeight;

export const Colors = {
  primary: "#ffffff",
  secondary: "#f0f2f7",
  tertiary: "#1f2937",
  darkLight: "#9Ca3af",
  brand: "#004db3d9",
  customGreen: "#10b981",
  customRed: "#ef4444",
  lightGrey: "lightgrey",
  returnButton: "#a1a1a1ff",
  currentStep: "#a1a1a1ff",
  otherSteps: "#a1a1a162",
};

const {
  primary,
  secondary,
  tertiary,
  darkLight,
  brand,
  customGreen,
  customRed,
  lightGrey,
  returnButton,
  currentStep,
  otherSteps,
} = Colors;

export const Avatar = Styled.Image`
  width: 100px;
  height: 100px;
  margin-horizontal: auto;
  margin-top: 20px;
  border-radius: 50px;
  border-width: 2px;
  border-color: ${secondary};
`;

export const ButtonText = Styled.Text`
  color: ${(props) => props.color || primary};
  font-size: 18px;
`;

export const StyledCartaoCidadao = Styled.Image`
  width: 80%
`;

export const ExtraText = Styled.Text`
  justify-content: center;
  align-content: center;
  color: ${tertiary};
  font-size: ${(props) => props.fontSize || 18}px;
`;

export const ExtraView = Styled.View`
  justify-content: center;
  flex-direction: ${(props) => props.column || "column"};
  align-items: center;
  padding: 10px;
`;

export const InnerContainer = Styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
`;

export const LeftIcon = Styled.View`
  left: 15px;
  top: 44px;
  position: absolute;
  z-index: 1;
`;

export const Line = Styled.View`
  height: 1px;
  width: 100%;
  background-color: ${darkLight};
  margin-vertical: 10px;
`;

export const MsgBox = Styled.Text`
  text-align: center;
  font-size: ${(props) => props.fontSize || 13}px;
  margin-bottom: ${(props) => props.marginBottom || 0}px;
  align-self: center;
  width: ${(props) => props.width};
  color: ${(props) => props.color};
  `;

export const PageLogo = Styled.Image`
  width: 250px;
  height: 100px;
  margin-top: 20px;
  margin-bottom: 0px;
  margin-horizontal: auto;
`;

export const PageTitle = Styled.Text`
  font-size: 30px;
  text-align: center;
  font-weight: bold;
  color: ${brand};
  margin-bottom: 20px;

  ${(props) =>
    props.welcome &&
    `
    font-size: 30px;
    `}
`;

export const RightIcon = Styled.TouchableOpacity`
  right: 12px;
  top: 42px;
  position: absolute;
  z-index: 1;
`;

export const SignupTimeline = Styled.View`
height: 3px;
background-color: ${darkLight};
width: 80%;
`;

export const SubTitle = Styled.Text`
  font-size: 18px;
  margin-bottom: 20px;
  letter-spacing: 1px;
  font-weight: bold;
  color: ${tertiary};

  ${(props) =>
    props.welcome &&
    `
    margin-bottom: 5px;
    font-weight: normal;
  `}
`;

export const StyledButton = Styled.TouchableOpacity`
  padding: 0px;
  background-color: ${brand};
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  margin-vertical: 5px;
  height: ${(props) => (props.height ? `height: ${props.height}px;` : 100)}px;
`;

export const StyledButtonLogin = Styled.TouchableOpacity`
  padding: 15px;
  background-color: ${customGreen};
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  margin-vertical: 5px;
  height: 60px;
`;

export const StyledButtonLogout = Styled.TouchableOpacity`
  padding: 15px;
  background-color: ${customRed};
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  margin-vertical: 5px;
  height: 60px;
`;

export const StyledButtonVoltar = Styled.TouchableOpacity`
  padding: 0px;
  background-color: ${returnButton};
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  margin-vertical: 0px;
  height: ${(props) => (props.height ? `height: ${props.height}px;` : 50)}px;
`;

export const StyledContainer = Styled.View`
  flex: 1;
  padding: 25px;
  padding-top: ${StatusBarHeight}px;
  background-color: ${primary};
`;

export const StyledContainerNew = Styled.View`
  flex: 1;
  padding-top: ${StatusBarHeight + 20}px;
  background-color: ${primary};
`;

export const TextLink = Styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`;

export const StyledFormArea = Styled.View`
  width: 90%;
`;

export const StyledInputLabel = Styled.Text`
  color: ${tertiary};
  font-size: 18px;
  text-align: left;
`;

export const StyledSelectDropdownButton = Styled.View`
  margin-vertical: 3px;
  height: 60px;
  background-color: ${secondary};
  border-radius: 8px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding-horizontal: 12px;
`;

export const StyledSelectDropdownButtonText = Styled.Text`
  flex: 1;
  font-size: 16px;
  color: ${tertiary};
`;

export const StyledSelectDropdownItem = Styled.TouchableOpacity`
`;

export const StyledSelectDropdownMenu = {
  backgroundColor: primary,
  borderRadius: 8,
  width: 250,
  height: 300,
};

export const StyledTextInput = Styled.TextInput`
  background-color: ${secondary};
  padding-left: 55px;
  padding-right: 20px;
  border-radius: 12px;
  font-size: 16px;
  height: 60px;
  margin-vertical: 3px;
  margin-bottom: 10px;
  color: ${tertiary};
  border-width: ${(props) => (props.border ? 3 : 0)}px;
  border-color: ${(props) => (props.borderColor ? props.borderColor : "red")};
`;

export const TextLinkContent = Styled.Text`
  color: ${brand};
  font-size: ${(props) => props.fontSize || 18}px;
  padding-horizontal: 5px;
`;

export const WelcomeContainer = Styled(InnerContainer)`
  padding: 25px;
  padding-top: 10px;
  justify-content: center;
`;

export const WelcomeImage = Styled.Image`
  height: 30%;
  min-width: 50%;
`;
