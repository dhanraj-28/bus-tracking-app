import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PaymentScreen from './PaymentScreen';
import Trackbus from './Trackbus';
import BuyBusPassScreen from './BuyBusPassScreen';
import { BusDetailScreen } from './Trackbus';

const Stack = createNativeStackNavigator();

export default function App3() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Trackbus">
        <Stack.Screen name="Trackbus" component={Trackbus} />
       
        <Stack.Screen name="BusDetailScreen" component={BusDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
