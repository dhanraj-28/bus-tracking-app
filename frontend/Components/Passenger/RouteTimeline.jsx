import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

function RouteTimeline({ stops = [], currentStopIndex = 0, busStatus = "inactive" }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const ITEM_HEIGHT = isLandscape ? 76 : Math.max(84, height * 0.105);
  const railLeft = 22;
  const dotSize = isLandscape ? 22 : 26;
  const busSize = isLandscape ? 34 : 40;
  const fontScale = width < 360 ? 0.9 : 1;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
    >
      <View style={[styles.rail, { left: railLeft - 5, height: stops.length * ITEM_HEIGHT }]} />
      <View
        style={[
          styles.railFill,
          {
            left: railLeft - 5,
            height: Math.max(0, currentStopIndex * ITEM_HEIGHT + ITEM_HEIGHT / 2),
          },
        ]}
      />

      {stops.map((stop, index) => {
        const passed = index < currentStopIndex;
        const active = index === currentStopIndex;
        return (
          <View key={`${stop.id}-${index}`} style={[styles.stopRow, { height: ITEM_HEIGHT }]}>
            <View
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  left: railLeft - dotSize / 2,
                },
                passed && styles.passedDot,
                active && styles.activeDot,
              ]}
            >
              {passed && <Ionicons name="checkmark" size={dotSize * 0.55} color="#fff" />}
              {active && busStatus === "active" && (
                <Text style={{ fontSize: dotSize * 0.45 }}>🚌</Text>
              )}
            </View>
            <View style={[styles.stopTextWrap, { marginLeft: railLeft + dotSize / 2 + 8 }]}>
              <Text
                style={[
                  styles.stopName,
                  { fontSize: 14.5 * fontScale },
                  active && styles.stopNameActive,
                ]}
                numberOfLines={2}
              >
                {stop.name}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

export default memo(RouteTimeline);

const styles = StyleSheet.create({
  rail: {
    position: "absolute",
    top: 6,
    width: 4,
    backgroundColor: "#EDE9F7",
    borderRadius: 4,
  },
  railFill: {
    position: "absolute",
    top: 6,
    width: 4,
    backgroundColor: "#7E57C2",
    borderRadius: 4,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    position: "absolute",
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#D8D0EC",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 2 },
    }),
  },
  passedDot: {
    backgroundColor: "#7E57C2",
    borderColor: "#7E57C2",
  },
  activeDot: {
    backgroundColor: "#fff",
    borderColor: "#7E57C2",
    borderWidth: 4,
  },
  stopTextWrap: {
    flex: 1,
    justifyContent: "center",
  },
  stopName: {
    fontWeight: "700",
    color: "#2B2B2B",
  },
  stopNameActive: {
    color: "#7E57C2",
    fontWeight: "800",
  },
});
