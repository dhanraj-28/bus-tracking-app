import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


import MenuScreen from "./MenuScreen";
import ChangeLanguageScreen from "./ChangeLanguageScreen";
import LogoutScreen from "./LogoutScreen";
import { LanguageProvider } from "../../../context/LanguageContext";


const Stack = createNativeStackNavigator();


export default function App1() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="ChangeLanguageScreen" component={ChangeLanguageScreen} />
          <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}