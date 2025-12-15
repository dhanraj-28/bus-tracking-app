import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MenuScreen from './Components/Passenger/Menu/MenuScreen';
import ChangeLanguageScreen from './Components/Passenger/Menu/ChangeLanguageScreen';
import LogoutScreen from './Components/Passenger/Menu/LogoutScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Menu"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen
          name="ChangeLanguageScreen"
          component={ChangeLanguageScreen}
        />
        <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
