import React, { memo } from "react";
import { Marker, Polyline } from "react-native-maps";

const STOP_COLOR = "#6A5ACD";
const START_COLOR = "#22C55E";
const END_COLOR = "#EF4444";

function RouteMapLayer({ polyline, stops, route, currentIndex }) {
  const startCoord =
    polyline[0] ||
    (stops[0]?.latitude != null
      ? { latitude: stops[0].latitude, longitude: stops[0].longitude }
      : null);
  const endCoord =
    polyline[polyline.length - 1] ||
    (stops[stops.length - 1]?.latitude != null
      ? {
          latitude: stops[stops.length - 1].latitude,
          longitude: stops[stops.length - 1].longitude,
        }
      : null);

  return (
    <>
      {polyline.length > 1 && (
        <Polyline
          coordinates={polyline}
          strokeColor="#6e42a6"
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {startCoord && (
        <Marker
          coordinate={startCoord}
          title={route?.startStop || "Start"}
          pinColor={START_COLOR}
          tracksViewChanges={false}
          zIndex={1}
        />
      )}

      {stops.map((stop, idx) => {
        if (stop.latitude == null || stop.longitude == null) return null;
        if (idx === 0 || idx === stops.length - 1) return null;

        const isPassed = idx < currentIndex;
        const isNext = idx === currentIndex + 1;

        return (
          <Marker
            key={`route-stop-${idx}`}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
            description={isNext ? "Next stop" : isPassed ? "Passed" : "Upcoming"}
            pinColor={isNext ? "#F59E0B" : isPassed ? "#CBD5E1" : STOP_COLOR}
            tracksViewChanges={false}
            zIndex={isNext ? 10 : 2}
          />
        );
      })}

      {endCoord && polyline.length > 1 && (
        <Marker
          coordinate={endCoord}
          title={route?.endStop || "Destination"}
          pinColor={END_COLOR}
          tracksViewChanges={false}
          zIndex={1}
        />
      )}
    </>
  );
}

export default memo(RouteMapLayer);
