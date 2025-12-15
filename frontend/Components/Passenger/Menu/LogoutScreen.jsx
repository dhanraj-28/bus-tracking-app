import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const LogoutScreen = ({ navigation }) => {

  const handleLogout = () => {
    // If you are using JWT / async storage, clear user token here
    // Example:
    // await AsyncStorage.removeItem('userToken');

    Alert.alert(
      "Logged Out",
      "You have been successfully logged out.",
      [
        {
          text: "OK",
          onPress: () => navigation.replace("Login") // Go to login screen
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Are you sure you want to log out?</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LogoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    width: "70%",
    padding: 15,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});
