import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeedbackScreen from "./FeedbackSreen";



const Stack = createNativeStackNavigator();

export default function Feedbackroute() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Feedback"
          component={FeedbackScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}