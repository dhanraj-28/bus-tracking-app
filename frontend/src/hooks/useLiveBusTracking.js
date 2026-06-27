import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadLiveMapData,
  subscribeLiveTracking,
} from "../controllers/liveMapController";

const initialLive = {
  busLocation: null,
  currentIndex: 0,
  currentStopName: "",
  nextStopName: "",
  distances: { totalKm: 0, coveredKm: 0, remainingKm: 0 },
  etaMinutes: 0,
  timeToNext: null,
  nearbyStops: [],
  isMoving: false,
  updatedText: "",
  busStatus: "loading",
};

export const useLiveBusTracking = (routeId, busNumber) => {
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [polyline, setPolyline] = useState([]);
  const [region, setRegion] = useState(null);
  const [live, setLive] = useState(initialLive);
  const [error, setError] = useState(null);

  const stopsRef = useRef([]);
  const unsubRef = useRef(null);

  const applyLiveUpdate = useCallback((data) => {
    setLive({
      busLocation: data.location,
      currentIndex: data.currentIndex,
      currentStopName: data.currentStopName || "",
      nextStopName: data.nextStopName || "",
      distances: data.distances,
      etaMinutes: data.etaMinutes,
      timeToNext: data.timeToNext,
      nearbyStops: data.nearbyStops || [],
      isMoving: data.isMoving,
      updatedText: data.updatedText,
      busStatus: "active",
      heading: data.heading ?? null,
    });
  }, []);

  const startSubscription = useCallback(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    unsubRef.current = subscribeLiveTracking(
      routeId,
      busNumber,
      stopsRef.current,
      {
        onUpdate: applyLiveUpdate,
        onInactive: () => {
          setLive((prev) => ({ ...prev, busStatus: "inactive", isMoving: false }));
        },
        onError: (msg) => {
          setError(msg);
          setLive((prev) => ({ ...prev, busStatus: "inactive", isMoving: false }));
        },
      }
    );
  }, [routeId, busNumber, applyLiveUpdate]);

  useEffect(() => {
    if (!routeId) {
      setLoading(false);
      setError("No route selected");
      return undefined;
    }

    let mounted = true;

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadLiveMapData(routeId);
        if (!mounted) return;

        setRoute(data.route);
        setStops(data.stops);
        stopsRef.current = data.stops;
        setPolyline(data.polyline);
        setRegion(data.region);

        if (data.route?.distance) {
          setLive((prev) => ({
            ...prev,
            distances: {
              totalKm: data.route.distance,
              coveredKm: 0,
              remainingKm: data.route.distance,
            },
          }));
        }

        startSubscription();
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load route");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [routeId, busNumber, startSubscription]);

  return {
    loading,
    route,
    stops,
    polyline,
    region,
    error,
    ...live,
    busStatus: live.busStatus,
  };
};
