import React, { memo } from "react";
import { View, Image, StyleSheet } from "react-native";

function BusMarker({ size = 44, isMoving = false, heading = 0 }) {
  const rotation = heading != null ? `${heading}deg` : "0deg";
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        { transform: [{ rotate: rotation }] },
        isMoving ? styles.moving : styles.stopped,
      ]}
    >
      {isMoving && <View style={[styles.movingRing, { borderRadius: size / 2 }]} />}
      <Image
        source={require("../../assets/Untitled2.png")}
        style={{ width: size * 0.55, height: size * 0.55 }}
        resizeMode="contain"
      />
    </View>
  );
}

export default memo(BusMarker);

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 6,
    shadowColor: "#7E57C2",
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  moving: {
    backgroundColor: "#22C55E",
    shadowColor: "#22C55E",
  },
  stopped: {
    backgroundColor: "#7E57C2",
  },
  movingRing: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderWidth: 2,
    borderColor: "rgba(34,197,94,0.5)",
  },
});
