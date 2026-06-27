import { getCompleteRoute, searchBusByNumber } from "../services/routeService";
import {
  subscribeToBusLocation,
  calculateNearestStop,
  calculateRemainingDistance,
  calculateEta,
} from "../services/busLocationService";
import { buildPolylineCoordinates, getMapRegion } from "../services/mapService";
import {
  formatLastUpdated,
  isBusMoving,
  computeTimeToStop,
  computeNearbyStops,
  bearingBetween,
} from "../utils/geoUtils";

const routeCache = new Map();
const ROUTE_CACHE_TTL = 5 * 60 * 1000;

export const loadLiveMapData = async (routeId) => {
  const cached = routeCache.get(routeId);
  if (cached && Date.now() - cached.ts < ROUTE_CACHE_TTL) {
    return cached.data;
  }

  const { route, stops, polylineStops } = await getCompleteRoute(routeId);
  const polyline = buildPolylineCoordinates(polylineStops);
  const region = getMapRegion(polyline);

  const data = {
    route,
    stops,
    polyline,
    region,
    totalDistanceKm: route?.distance ?? null,
  };

  routeCache.set(routeId, { ts: Date.now(), data });
  return data;
};

export const searchBusesForTrack = async (searchText) => {
  const buses = await searchBusByNumber(searchText);
  return { success: true, data: buses };
};

const buildTrackingSnapshot = (location, stops, prevCoord) => {
  let currentIndex = 0;
  let currentStopName = location.currentStopName;
  let nextStopName = location.nextStopName;

  if (location.latitude != null && location.longitude != null && stops?.length) {
    const nearest = calculateNearestStop(
      location.latitude,
      location.longitude,
      stops
    );
    currentIndex = nearest.index;
    currentStopName = nearest.stop?.name || currentStopName;
    nextStopName = nearest.nextStop?.name || nextStopName;
  } else if (currentStopName && stops?.length) {
    const idx = stops.findIndex(
      (s) => s.name?.toLowerCase().trim() === currentStopName.toLowerCase().trim()
    );
    currentIndex = idx >= 0 ? idx : 0;
    nextStopName = nextStopName || stops[currentIndex + 1]?.name || null;
  }

  const currCoord =
    location.latitude != null
      ? { latitude: location.latitude, longitude: location.longitude }
      : null;

  const moving = isBusMoving(location.speed, prevCoord, currCoord);

  const nextStopObj = stops[currentIndex + 1] || stops.find((s) => s.name === nextStopName);
  const timeToNext = computeTimeToStop(
    location.latitude,
    location.longitude,
    nextStopObj,
    location.speed
  );

  const distances = calculateRemainingDistance(
    location.latitude,
    location.longitude,
    stops,
    currentIndex
  );

  const etaMinutes = calculateEta(distances.remainingKm, location.speed);
  const nearbyStops = computeNearbyStops(
    location.latitude,
    location.longitude,
    stops,
    currentIndex,
    location.speed,
    6
  );

  // compute heading (bearing) using previous coordinate when available
  let heading = null;
  if (prevCoord && currCoord) {
    heading = bearingBetween(prevCoord.latitude, prevCoord.longitude, currCoord.latitude, currCoord.longitude);
  } else if (location.heading != null) {
    heading = Number(location.heading);
  }

  return {
    location,
    currentIndex,
    currentStopName,
    nextStopName,
    distances,
    etaMinutes,
    timeToNext,
    nearbyStops,
    isMoving: moving,
    updatedText: formatLastUpdated(location.updatedAt),
    isActive: true,
    coord: currCoord,
    heading,
  };
};

export const subscribeLiveTracking = (routeId, busNumber, stops, callbacks) => {
  const { onUpdate, onInactive, onError } = callbacks;
  let prevCoord = null;

  const unsubscribe = subscribeToBusLocation(
    routeId,
    busNumber,
    (location) => {
      if (!location.isActive || (location.latitude == null && !location.currentStopName)) {
        onInactive?.(location);
        return;
      }

      const snapshot = buildTrackingSnapshot(location, stops, prevCoord);
      if (snapshot.coord) prevCoord = snapshot.coord;
      onUpdate(snapshot);
    },
    onError
  );

  return unsubscribe;
};
