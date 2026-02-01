import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DriverDashboard from "./Components/Driver/DriverDashboard";
import DashBoard from "./Components/LandingPage/Dashboard";
import RegisterForm from "./Components/Driver/RegisterForm";
import RewardProgressPage from "./Components/Driver/Reward";
import Landing from "./Components/LandingPage/Landing";
import BusPassForm from "./Components/Passenger/Buspass/BusPassForm";
import FeedbackScreen from "./Components/Passenger/feedback/FeedbackSreen";
import IdentityVerification from "./Components/Passenger/IdentityVerification/IdentityVerification";
import ChangeLanguageScreen from "./Components/Passenger/Menu/ChangeLanguageScreen";
import MenuScreen from "./Components/Passenger/Menu/MenuScreen";
import LogoutScreen from "./Components/Passenger/Menu/LogoutScreen";
import App1 from "./Components/Passenger/Menu/App1";
import BusDetailsScreen from "./Components/Driver/qrscanner/BusDetailsScreen";
import QRScanner from "./Components/Driver/qrscanner/QRScanner";
import TrackBusScreen from "./Components/Passenger/TrackBusScreen";
import App2 from "./Components/Driver/qrscanner/App2";
import BuyBusPassScreen from "./Components/Passenger/BuyBusPassScreen";
import NotificationsPage from "./Components/Passenger/Notification";
import PaymentScreen from "./Components/Passenger/PaymentScreen";
import Route from "./Components/Passenger/Route";
import SOSScreen from "./Components/Passenger/SOSScreen";
import HomeScreen from "./Components/Passenger/Trackbus";
import LiveMapPage from "./Components/Passenger/Tracking";
import App3 from "./Components/Passenger/App3";

import Feedbackroute from "./Components/Passenger/feedback/feedbackroute";
import PasstoPayment from "./Components/Passenger/passtopayment";
import BusStopsNearMe from "./Components/Passenger/BusStopsNearMe";
const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <SafeAreaProvider>
       <NavigationContainer>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {/* <App3/> */}
        {/* <LiveMapPage/> */}
       
        {/* <SOSScreen /> */}
        {/* <Route />  */}
       
        {/* <NotificationsPage /> */}
      {/* <BusPassForm/> */}
        {/* <PasstoPayment/> */}
        
        {/* <App2/> */}
       
        {/* <App1 />  */}
        {/* <IdentityVerification />   */}
      {/* <Feedbackroute/> */}
        {/* <Landing /> */}
      {/* <RewardProgressPage/> */}
        {/* <DriverDashboard /> */}
        {/* <DashBoard /> */}
    {/* <RegisterForm/> */}
     <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen
          name="BusStopsNearMe"
          component={BusStopsNearMe}
        /> */}
          <Stack.Screen name="Landing" component={Landing} />
  <Stack.Screen name="Dashboard" component={DashBoard} />

        {/* add other screens later */}
      </Stack.Navigator>
      </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
