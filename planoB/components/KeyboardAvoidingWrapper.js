import React from "react";

import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  View,
  abc,
} from "react-native";
import { Colors } from "./estilos";

const { primary } = Colors;

const KeyboardAvoidingWrapper = ({ children }) => {
  return (
    <View style={{ flex: 1, backgroundColor: primary }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>{children}</View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </View>
  );
};
export default KeyboardAvoidingWrapper;
