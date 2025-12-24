import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PaymentScreen from './Components/Passenger/PaymentScreen';
import Trackbus from './Components/Passenger/Trackbus';
import BuyBusPassScreen from './Components/Passenger/BuyBusPassScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Trackbus">
        <Stack.Screen name="BusPass" component={BuyBusPassScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Trackbus" component={Trackbus} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}