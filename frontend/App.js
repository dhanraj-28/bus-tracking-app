import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QRScanner from "./Components/Passenger/QRScanner";
import Dashboard from "./Components/LandingPage/Dashboard.jsx"
import Route from "./Components/Passenger/Route.jsx";

import BusDetailsScreen from "./Components/Passenger/BusDetailsScreen.jsx";



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="QRScanner">
        {/* <Stack.Screen name="Dashboard" component={Dashboard} /> */}
        <Stack.Screen name="QRScanner" component={QRScanner} />
             <Stack.Screen name="BusDetailsScreen" component={BusDetailsScreen} />
        {/* <Stack.Screen name="Route" component={Route} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
