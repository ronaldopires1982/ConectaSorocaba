import { View } from "react-native";
import { Colors } from "./estilos";
const { primary } = Colors;

const CustomStepper = ({
  gap = 18,
  size = 6,
  distanceToBottom = 30,
  step1Color = Colors.otherSteps,
  step2Color = Colors.otherSteps,
  step3Color = Colors.otherSteps,
  step4Color = Colors.otherSteps,
  step5Color = Colors.otherSteps,
}) => {
  const renderStep = (color) => (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 2,
      }}
    />
  );

  return (
    <View
      style={{
        flexDirection: "row",
        height: 20,
        // position: "relative",
        // bottom: distanceToBottom,
        // left: 0,
        // right: 0,
        justifyContent: "center",
        alignItems: "center",
        // alignSelf: "center",

        gap: gap,
        // backgroundColor: "#ffee0362",
      }}
    >
      {renderStep(step1Color)}
      {renderStep(step2Color)}
      {renderStep(step3Color)}
      {renderStep(step4Color)}
      {renderStep(step5Color)}
    </View>
  );
};

export default CustomStepper;
