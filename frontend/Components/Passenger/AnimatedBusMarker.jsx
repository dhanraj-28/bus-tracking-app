import React, { useEffect, useRef, memo } from "react";
import { Marker, AnimatedRegion } from "react-native-maps";
import BusMarker from "./BusMarker";

function AnimatedBusMarker({ latitude, longitude, title, isMoving = false, size = 42, heading = null }) {
  const regionRef = useRef(null);

  if (latitude != null && longitude != null && !regionRef.current) {
    regionRef.current = new AnimatedRegion({
      latitude,
      longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    });
  }

  useEffect(() => {
    if (latitude == null || longitude == null || !regionRef.current) return;

    regionRef.current
      .timing({
        latitude,
        longitude,
        duration: 1200,
        useNativeDriver: false,
      })
      .start();
  }, [latitude, longitude]);

  if (!regionRef.current || latitude == null) return null;

  return (
    <Marker.Animated
      coordinate={regionRef.current}
      title={title}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
      zIndex={999}
    >
      <BusMarker size={size} isMoving={isMoving} heading={heading} />
    </Marker.Animated>
  );
}

export default memo(AnimatedBusMarker);
