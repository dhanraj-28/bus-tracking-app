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

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
          >
            {stops.map((stop, index) => {
              const active = index === currentStopIndex;
              return (
                <View key={index} style={styles.stopRow}>
                  <View
                    style={[
                      styles.dot,
                      active && styles.activeDot,
                    ]}
                  />
                  <View>
                    <Text style={styles.stopName}>{stop.name}</Text>
                    <Text style={styles.time}>{stop.time}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <Animated.View style={[styles.bus, { top: busY }]}>
            <Text style={styles.busIcon}><Image
              source={require("../../assets/Untitled2.png")}
              style={{ width: 20, height: 20 ,marginTop:1}}
              resizeMode="contain"
            /></Text>
          </Animated.View>
        </View>
      </View>

      {/* RIGHT */}
      <View style={styles.right}>
        <TouchableOpacity style={styles.liveBtn}>
          <Text style={styles.liveText}>LIVE MAP</Text>
        </TouchableOpacity>

        
      </View>

      {/* STATUS */}
      
      <View style={styles.status}>
        <TouchableOpacity style={styles.refresh} onPress={onRefresh}>
          <Text style={{ fontSize: 18 }}>⟳</Text>
        </TouchableOpacity>
        
        
        <Text style={styles.statusText}>
          {currentStopIndex === 0
            ? `Bus not started from ${stops[0].name}`
            : `Bus at ${stops[currentStopIndex].name}`}
        </Text>
        <Text style={styles.updated}>Updated few seconds ago</Text>
        
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
    top:-30
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
    paddingLeft: 8,
    top:-20
  },
  rail: {
    position: "absolute",
    left: 10,
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
    marginRight: 9,
    marginTop:-10
  },
  activeDot: {
    backgroundColor: "#7E57C2",
  },
  stopName: { fontWeight: "800", fontSize: 14,left:10 },
  time: { color: "#666", marginTop: 4,left:10 },

  bus: {
    position: "absolute",
    right:219,
    
    width:40,
    height: 40,
    backgroundColor: "#7E57C2",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },


  liveBtn: {
    backgroundColor: "#7E57C2",
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 16,
    bottom:10
  },
  liveText: { color: "#fff", fontWeight: "800" },
  refresh: {
   bottom:-35,
    width: 44,
    height: 44,
    left :300,
    backgroundColor: "#eee",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  status: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#6e42a6",
    alignItems:"flex-start",
    padding: 20,
  },
  statusText: { color: "#fff", fontWeight: "800",fontSize:20 },
  updated: { color: "#ddd", marginTop: 4, fontSize: 13 },
});
