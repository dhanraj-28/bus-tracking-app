import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { extractLatLng } from "../utils/geoUtils";

const STOP_COORDS_COLLECTION = "stopCoordinates";
const CACHE_TTL_MS = 30 * 60 * 1000;
const coordsCache = new Map();

const getCachedEntry = (key) => {
  const entry = coordsCache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    coordsCache.delete(key);
    return undefined;
  }
  return entry.value;
};

const setCache = (key, value) => {
  coordsCache.set(key, { ts: Date.now(), value });
};

export const clearStopCoordinatesCache = () => coordsCache.clear();

const parseStopDoc = (stopName, data) => {
  if (!data) return null;

  const fromGeo = extractLatLng(data);
  if (fromGeo) {
    return { stopName, ...fromGeo };
  }

  if (typeof data.stopName === "string") {
    return parseStopDoc(data.stopName, {
      latitude: data.latitude,
      longitude: data.longitude,
      location: data.location,
    });
  }

  return null;
};

export const getStopCoordinates = async (stopName) => {
  const trimmed = (stopName || "").trim();
  if (!trimmed) return null;

  const cached = getCachedEntry(trimmed);
  if (cached !== undefined) return cached;

  try {
    let snap = await getDoc(doc(db, STOP_COORDS_COLLECTION, trimmed));
    if (!snap.exists()) {
      const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      snap = await getDoc(doc(db, STOP_COORDS_COLLECTION, capitalized));
    }
    if (!snap.exists()) {
      setCache(trimmed, null);
      return null;
    }
    const parsed = parseStopDoc(trimmed, snap.data());
    setCache(trimmed, parsed);
    return parsed;
  } catch (error) {
    console.warn("[mapService] getStopCoordinates:", stopName, error.message);
    return null;
  }
};

export const getStopCoordinatesBatch = async (stopNames = []) => {
  const unique = [...new Set(stopNames.map((n) => n?.trim()).filter(Boolean))];
  const map = {};
  const toFetch = [];

  unique.forEach((name) => {
    const cached = getCachedEntry(name);
    if (cached !== undefined) {
      if (cached) map[name] = cached;
    } else {
      toFetch.push(name);
    }
  });

  if (toFetch.length) {
    await Promise.all(
      toFetch.map(async (name) => {
        const coords = await getStopCoordinates(name);
        if (coords) map[name] = coords;
      })
    );
  }

  return map;
};

export const generateRouteCoordinates = (stopsWithCoords) =>
  (stopsWithCoords || [])
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      latitude: s.latitude,
      longitude: s.longitude,
    }));

export const buildPolylineCoordinates = (stops) =>
  generateRouteCoordinates(stops);

export const getMapRegion = (coordinates, padding = 1.4) => {
  const valid = (coordinates || []).filter(
    (c) => c?.latitude != null && c?.longitude != null
  );
  if (!valid.length) {
    return {
      latitude: 12.9,
      longitude: 79.1,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };
  }

  if (valid.length === 1) {
    return {
      latitude: valid[0].latitude,
      longitude: valid[0].longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  let minLat = valid[0].latitude;
  let maxLat = valid[0].latitude;
  let minLng = valid[0].longitude;
  let maxLng = valid[0].longitude;

  valid.forEach(({ latitude, longitude }) => {
    minLat = Math.min(minLat, latitude);
    maxLat = Math.max(maxLat, latitude);
    minLng = Math.min(minLng, longitude);
    maxLng = Math.max(maxLng, longitude);
  });

  const latDelta = Math.max((maxLat - minLat) * padding, 0.03);
  const lngDelta = Math.max((maxLng - minLng) * padding, 0.03);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
};
