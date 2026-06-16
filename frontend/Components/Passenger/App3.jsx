import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PaymentScreen from './PaymentScreen';
import TrackBus from './Trackbus';
import BuyBusPassScreen from './BuyBusPassScreen';
import { BusDetailScreen } from './Trackbus';

const Stack = createNativeStackNavigator();

export default function App3() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TrackBus">
        <Stack.Screen name="TrackBus" component={TrackBus} />
       
        <Stack.Screen name="BusDetailScreen" component={BusDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
