import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

const ITEM_HEIGHT = 100; // space per stop

export default function LiveBarTrack({
  stops = [],
  currentStopIndex = 0,
  onRefresh = () => {},
}) {
  const busY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    const targetY = currentStopIndex * ITEM_HEIGHT + 30;

    Animated.timing(busY, {
      toValue: targetY,
      duration: 300,
      useNativeDriver: false,
    }).start();

    scrollRef.current?.scrollTo({
      y: Math.max(0, targetY - 150),
      animated: true,
    });
  }, [currentStopIndex]);

  return (
    <View style={styles.container}>
      {/* LEFT */}
      <View style={styles.left}>
        <Text style={styles.busNo}>5E</Text>
        <Text style={styles.to}>To Amritsar</Text>

        <View style={styles.track}>
          
          <View style={styles.rail} />
          

          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
            
            {stops.map((stop, index) => {
              const active = index === currentStopIndex;
              return (
                <View key={index} style={styles.stopRow}>
                  
                  <View style={[styles.dot, active && styles.activeDot]} />
                  
                  <View>
                    <Text style={styles.stopName}>{stop.name}</Text>
                    <Text style={styles.time}>{stop.time}</Text>
                  </View>
                </View>
              );
            })}<Animated.View style={[styles.bus, { top: busY }]}>
              <Text style={styles.busIcon}>
                <Image
                  source={require("../../assets/Untitled2.png")}
                  style={{ width: 20, height: 20, marginTop: 1 }}
                  resizeMode="contain"
                />
              </Text>
            </Animated.View>
            
          </ScrollView>
        </View>
      </View>

      {/* RIGHT */}
      {/* STATUS BAR */}

      <View style={styles.status}>
        {/* LEFT TEXT */}
        <View style={styles.statusLeft}>
          <Text style={styles.statusText}>
            {currentStopIndex === 0
              ? `Bus not started from ${stops[0].name}`
              : `Bus at ${stops[currentStopIndex].name}`}
          </Text>
          <Text style={styles.updated}>Updated few seconds ago</Text>
        </View>

        {/* RIGHT BUTTONS */}
        <View style={styles.statusRight}>
          <TouchableOpacity style={styles.liveBtn}>
            <Text style={styles.liveText}>LIVE MAP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refresh} onPress={onRefresh}>
            <Text style={styles.refreshText}>⟳</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  left: {
    flex: 3,
    padding: 20,
    top: -30,
   
  },
  right: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 100,
  },
  busNo: { fontWeight: "800", fontSize: 32 },
  to: { fontSize: 18, color: "#666", marginBottom: 10 },

  track: {
    flex: 1,
    position: "relative",
    paddingLeft: 19,
    top: -20,
  },
  rail: {
    position: "absolute",
    left: 30,
    top: 35,
    bottom: 10,
    width: 20,
    backgroundColor: "#E1D9F1",
    borderRadius: 6,
  },
  stopRow: {
    height: ITEM_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 50,
    backgroundColor: "#C8BEE0",
    marginLeft: 9,
    marginRight: 10,

    marginTop: -10,
  },
  activeDot: {
    backgroundColor: "#7E57C2",
    
  },
  stopName: { fontWeight: "800", fontSize: 14, left: 10 },
  time: { color: "#666", marginTop: 4, left: 10 },

  bus: {
    position: "absolute",
    left: 3, // aligns bus with dot
    width: 35,
    height: 35,
    backgroundColor: "#7E57C2",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  status: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#6e42a6",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusLeft: {
    flex: 1,
  },

  statusText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  updated: {
    color: "#ddd",
    marginTop: 6,
    fontSize: 13,
  },

  statusRight: {
    width: 150,

    flexDirection: "row",
    alignItems: "flex-start",

    height: 70,
  },

  liveBtn: {
    backgroundColor: "#7E57C2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    bottom: 70,
    flex: 1,
    left: 50,

    elevation: 4,
  },

  liveText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },

  refresh: {
    marginTop: 9,
    width: 50,
    height: 50,
    backgroundColor: "#eee",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  refreshText: {
    fontSize: 18,
    color: "#333",
  },
});
