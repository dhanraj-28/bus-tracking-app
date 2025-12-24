// LandingScreen.jsx
import {React }from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";



const { width } = Dimensions.get("window");

const Landing = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Illustration */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/bus-tracking.png")} // put the image here
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <MaskedView
  maskElement={
    <Text style={[styles.title, { backgroundColor: "transparent" }]}>
      WHERE IS MY BUS?
    </Text>
  }
>
  <LinearGradient
    colors={["#211C84", "#7770CE"]}
    start={{ x: 0, y: 1 }}
    end={{ x: 1, y:0}}
  >
    <Text style={[styles.title, { opacity: 0 }]}>
      WHERE IS MY BUS?
    </Text>
  </LinearGradient>
</MaskedView>

      {/* Subtitle */}
      
      <Text style={styles.subtitle}>
        “No more waiting in the dark, Track your{"\n"}bus, save your time”
      </Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={["#211C84", "#7770CE"]}
            start={{ x: 0, y: 1}}
            end={{ x: 1, y:0}}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Passanger portal</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={["#211C84", "#7770CE"]}
            start={{ x: 0, y: 1}}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Driver portal</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Landing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  imageContainer: {
    marginTop: 30,
    marginBottom: 10,
  },
  image: {
    width: width * 1,
    height: width * 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2D2A8C",
    marginTop: 10,
  },
  titleLight: {
    fontWeight: "300",
    color: "#B6B4E6",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 19,
    color: "#27228A",
    marginTop: 12,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: width * 0.75,
    paddingVertical: 16,
    borderRadius: 30,
    marginVertical: 12,
    alignItems: "center",
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
});
