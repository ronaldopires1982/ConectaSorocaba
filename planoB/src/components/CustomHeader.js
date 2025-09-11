import { Pressable, Text, View } from "react-native";

import { Feather } from "@expo/vector-icons";
import { Colors, StatusBarHeight } from "../components/estilos";

const { brand } = Colors;
const headerHeight = 90;
export const CustomHeader = ({ navigation, isLoggedIn, title }) => {
  const headerTitle = title;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        height: headerHeight,
        backgroundColor: "white",
        marginTop: StatusBarHeight,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          backgroundColor: "transparent",
        }}
      >
        {upperLeftButton ? (
          <Pressable
            onPress={handleBackPress}
            style={{ marginRight: 0, backgroundColor: "transparent" }}
          >
            <Feather name="chevron-left" size={30} color="#000" />
          </Pressable>
        ) : isLoggedIn ? (
          <Feather name="user" size={30} color={"black"} />
        ) : (
          // <Image
          //   source={require("../assets/img/156.png")}
          //   style={{
          //     height: 40,
          //     width: 40,
          //     resizeMode: "contain",
          //   }}
          // />
          <View style={{ width: 40 }} />
        )}

        <Text
          style={{
            fontSize: 26,
            fontWeight: "bold",
            color: brand,
            backgroundColor: "transparent",
            flex: 1,
            textAlign: "center",
          }}
        >
          {headerTitle}
        </Text>
      </View>

      <Pressable
        onPress={navigation.toggleDrawer}
        style={{ marginRight: 12, backgroundColor: "transparent" }}
      >
        <Feather name="menu" size={30} color="#000" />
      </Pressable>
    </View>
  );
};
