import React from "react";
import { View, StyleSheet } from "react-native";

  //import RegisterForm from "./Components/Driver/RegisterForm";
 //import BusPassForm from "./Components/Passenger/Buspass/BusPassForm";
 import IdentityVerification from "./Components/Passenger/IdentityVerification/IdentityVerification";

export default function App() {
  return (
    <View style={styles.container}>
      <IdentityVerification/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
