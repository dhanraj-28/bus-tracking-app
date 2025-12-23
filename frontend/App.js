// App.js
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TrackBusScreen from "./Components/Passenger/TrackBusScreen";
import SOSScreen from "./Components/Passenger/SOSScreen";
import DriverDashboard from "./Components/Driver/DriverDashboard";

export default function App() {
  return (
    <SafeAreaProvider>
      <DriverDashboard/>
    </SafeAreaProvider>
  );
}
