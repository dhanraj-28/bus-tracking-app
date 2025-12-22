import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import FeedbackScreen from './Components/Passenger/feedback/FeedbackSreen';


export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <FeedbackScreen/>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


