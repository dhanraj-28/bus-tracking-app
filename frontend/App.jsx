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
import TrackBusScreen from "./Components/Passenger/LiveTrack";
import App2 from "./Components/Driver/qrscanner/App2";
import BuyBusPassScreen from "./Components/Passenger/BuyBusPassScreen";
import NotificationsPage from "./Components/Passenger/Notification";
import PaymentScreen from "./Components/Passenger/PaymentScreen";
import PaymentHistoryScreen from "./Components/Passenger/PaymentHistoryScreen";
import PaymentDetailScreen from "./Components/Passenger/PaymentDetailScreen";
import Route from "./Components/Passenger/Route";
import SOSScreen from "./Components/Passenger/SOSScreen";
import HomeScreen, { BusDetailScreen } from "./Components/Passenger/Trackbus";
import LiveMapPage from "./Components/Passenger/Tracking";
import App3 from "./Components/Passenger/App3";

import Feedbackroute from "./Components/Passenger/feedback/feedbackroute";
import PasstoPayment from "./Components/Passenger/passtopayment";
import BusStopsNearMe from "./Components/Passenger/BusStopsNearMe";
import TrackSearch from "./Components/Passenger/TrackSearch";
import LiveTrack from "./Components/Passenger/LiveTrack";
import { LanguageProvider } from "./context/LanguageContext";
import MobileOTP from "./Components/Passenger/MobileOTP";
import OtpScreen from "./Components/Passenger/OTPScreen";
import { auth } from "./src/config/firebase";

console.log("Firebase Connected:", auth);
const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <SafeAreaProvider>

      <NavigationContainer>
        <LanguageProvider>
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

              <Stack.Screen name="Landing" component={Landing} />
              <Stack.Screen name="Dashboard" component={DashBoard} />
              <Stack.Screen name="Trackbus" component={HomeScreen} />
              <Stack.Screen name="BusStopsNearMe" component={BusStopsNearMe} />
              <Stack.Screen name="BuyBusPass" component={BuyBusPassScreen} />
              <Stack.Screen name="BusPassForm" component={BusPassForm} />
              <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />

              <Stack.Screen name="TrackSearch" component={TrackSearch} />
              <Stack.Screen name="IdentityVerification" component={IdentityVerification} />
              <Stack.Screen name="BuyBusPassScreen" component={BuyBusPassScreen} />
              <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
              <Stack.Screen name="PaymentHistoryScreen" component={PaymentHistoryScreen} />
              <Stack.Screen name="PaymentDetailScreen" component={PaymentDetailScreen} />
              <Stack.Screen name="RegisterForm" component={RegisterForm} />
              <Stack.Screen name="QRScanner" component={QRScanner} />
              <Stack.Screen name="BusDetailsScreen" component={BusDetailsScreen} />
              <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
              <Stack.Screen name="Reward" component={RewardProgressPage} />
              <Stack.Screen name="LiveTrack" component={LiveTrack} />
              <Stack.Screen name="TacBusScreen" component={LiveTrack} />
              <Stack.Screen name="Tracking" component={LiveMapPage} />
              <Stack.Screen name="SOSScreen" component={SOSScreen} />
              <Stack.Screen name="NotificationScreen" component={NotificationsPage} />
              <Stack.Screen name="MenuScreen" component={MenuScreen} />
              <Stack.Screen name="ChangeLanguageScreen" component={ChangeLanguageScreen} />
              <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
                <Stack.Screen name="MobileOTP" component={MobileOTP} />
                   <Stack.Screen name="OTPScreen" component={OtpScreen} />
              {/* add other screens later */}
            </Stack.Navigator>

          </SafeAreaView>
        </LanguageProvider>
      </NavigationContainer>


    </SafeAreaProvider >
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
});