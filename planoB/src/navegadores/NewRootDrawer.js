import { createDrawerNavigator } from "@react-navigation/drawer";

import { StackNav } from "./NewRootStack";
import DrawerContent from "../components/DrawerContent";

export default function DrawerNav() {
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: "left",
        // swipeEnabled: isDrawerEnabled(route.name),
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen name="HomeDrawer" component={StackNav} />
    </Drawer.Navigator>
  );
}
