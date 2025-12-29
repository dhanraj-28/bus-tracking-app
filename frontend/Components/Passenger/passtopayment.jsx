import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PaymentScreen from './PaymentScreen';

import BuyBusPassScreen from './BuyBusPassScreen';


const Stack = createNativeStackNavigator();

export default function PasstoPayment() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="BusPass">
       
        <Stack.Screen name="BusPass" component={BuyBusPassScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}