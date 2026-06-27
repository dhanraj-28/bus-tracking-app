const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_M = 6371000;

export const normalizeStopName = (name) =>
  (name || "").trim().toLowerCase().replace(/\s+/g, " ");

export const haversineKm = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some((v) => v == null || Number.isNaN(Number(v)))) {
    return null;
  }
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const haversineMeters = (lat1, lon1, lat2, lon2) => {
  const km = haversineKm(lat1, lon1, lat2, lon2);
  return km == null ? null : km * 1000;
};

export const extractLatLng = (data) => {
  if (!data) return null;

  if (typeof data.latitude === "number" && typeof data.longitude === "number") {
    return { latitude: data.latitude, longitude: data.longitude };
  }

  const geo = data.location;
  if (geo && typeof geo.latitude === "number") {
    return { latitude: geo.latitude, longitude: geo.longitude };
  }
  if (geo && typeof geo.lat === "number") {
    return { latitude: geo.lat, longitude: geo.lng };
  }

  if (typeof data.lat === "number" && typeof data.lng === "number") {
    return { latitude: data.lat, longitude: data.lng };
  }

  return null;
};

export const getNearestStop = (busLat, busLng, stops) => {
  if (!stops?.length || busLat == null || busLng == null) {
    return {
      index: 0,
      stop: stops?.[0] || null,
      nextStop: stops?.[1] || null,
      distanceMeters: null,
    };
  }

  let nearestIndex = 0;
  let minDistance = Infinity;

  stops.forEach((stop, index) => {
    const lat = stop.latitude ?? stop.lat;
    const lng = stop.longitude ?? stop.lng;
    if (lat == null || lng == null) return;

    const dist = haversineMeters(busLat, busLng, lat, lng);
    if (dist != null && dist < minDistance) {
      minDistance = dist;
      nearestIndex = index;
    }
  });

  return {
    index: nearestIndex,
    stop: stops[nearestIndex] || null,
    nextStop: stops[nearestIndex + 1] || null,
    distanceMeters: minDistance === Infinity ? null : Math.round(minDistance),
  };
};

export const sumRouteDistanceKm = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < coordinates.length; i += 1) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    const segment = haversineKm(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );
    if (segment != null) total += segment;
  }
  return total;
};

export const calculateEtaMinutes = (distanceKm, speedKmh) => {
  const speed = speedKmh > 5 ? speedKmh : 25;
  if (!distanceKm || distanceKm <= 0) return 0;
  return Math.max(1, Math.round((distanceKm / speed) * 60));
};

export const formatLastUpdated = (timestamp) => {
  if (!timestamp) return "Updated just now";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return "Updated just now";
    if (seconds < 60) return `Updated ${seconds}s ago`;
    if (seconds < 120) return "Updated 1 min ago";
    return `Updated ${Math.floor(seconds / 60)} mins ago`;
  } catch {
    return "Updated just now";
  }
};

export const isBusMoving = (speed, prevCoord, currCoord) => {
  if (speed >= 5) return true;
  if (!prevCoord || !currCoord) return false;
  const moved = haversineMeters(
    prevCoord.latitude,
    prevCoord.longitude,
    currCoord.latitude,
    currCoord.longitude
  );
  return moved != null && moved > 15;
};

// Calculate bearing (heading) from coord A to B in degrees (0-360, 0 = north)
export const bearingBetween = (fromLat, fromLng, toLat, toLng) => {
  if ([fromLat, fromLng, toLat, toLng].some((v) => v == null)) return null;
  const fromLatRad = (fromLat * Math.PI) / 180;
  const fromLngRad = (fromLng * Math.PI) / 180;
  const toLatRad = (toLat * Math.PI) / 180;
  const toLngRad = (toLng * Math.PI) / 180;
  const dLon = toLngRad - fromLngRad;
  const y = Math.sin(dLon) * Math.cos(toLatRad);
  const x =
    Math.cos(fromLatRad) * Math.sin(toLatRad) -
    Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

export const computeTimeToStop = (busLat, busLng, stop, speedKmh) => {
  if (!stop || stop.latitude == null || busLat == null) return null;
  const km = haversineKm(busLat, busLng, stop.latitude, stop.longitude);
  if (km == null) return null;
  return {
    distanceKm: km,
    etaMinutes: calculateEtaMinutes(km, speedKmh),
  };
};

export const computeNearbyStops = (busLat, busLng, stops, currentIndex, speedKmh, limit = 5) => {
  if (!stops?.length || busLat == null) return [];

  const startIdx = Math.max(0, currentIndex);
  return stops.slice(startIdx, startIdx + limit).map((stop, offset) => {
    const timeInfo =
      stop.latitude != null
        ? computeTimeToStop(busLat, busLng, stop, speedKmh)
        : null;
    return {
      name: stop.name,
      index: startIdx + offset,
      isCurrent: offset === 0 && startIdx === currentIndex,
      isNext: offset === 1 || (offset === 0 && startIdx > currentIndex),
      distanceKm: timeInfo?.distanceKm ?? null,
      etaMinutes: timeInfo?.etaMinutes ?? null,
    };
  });
};
