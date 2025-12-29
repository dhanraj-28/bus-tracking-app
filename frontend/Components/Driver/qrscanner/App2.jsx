import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QRScanner from "./QRScanner.jsx";
import BusDetailsScreen from "./BusDetailsScreen.jsx";

const Stack = createNativeStackNavigator();

export default function App2() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="QRScanner">
        <Stack.Screen name="QRScanner" component={QRScanner} />
          <Stack.Screen name="BusDetailsScreen" component={BusDetailsScreen} />
           {/* <Stack.Screen name="Dashboard" component={DashBoard} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}