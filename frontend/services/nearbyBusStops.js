import { GOOGLE_MAPS_API_KEY } from "../constants/maps";

export const SEARCH_RADIUS_METERS = 5000;
export const MAX_STOPS = 50;
const FAST_TIMEOUT_MS = 8000;
const FULL_TIMEOUT_MS = 15000;

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function dedupeAndSort(stops, lat, lng) {
  const seen = new Set();
  return stops
    .map((stop) => ({
      ...stop,
      distance: Math.round(
        getDistanceMeters(lat, lng, stop.latitude, stop.longitude)
      ),
    }))
    .filter((stop) => stop.distance <= SEARCH_RADIUS_METERS)
    .sort((a, b) => a.distance - b.distance)
    .filter((stop) => {
      const key = `${stop.latitude.toFixed(5)}-${stop.longitude.toFixed(5)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_STOPS);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = FULL_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function parsePhotonFeatures(features) {
  return features
    .map((feature, index) => {
      const [featureLng, featureLat] = feature.geometry?.coordinates || [];
      if (featureLat == null || featureLng == null) return null;

      const props = feature.properties || {};
      const name =
        props.name ||
        props["name:en"] ||
        props.street ||
        (props.osm_value === "bus_stop" ? "Bus stop" : null) ||
        (props.osm_key === "amenity" ? "Bus station" : null);

      return {
        id: String(props.osm_id || `p-${index}-${featureLat}-${featureLng}`),
        name: name || "Bus stop",
        latitude: featureLat,
        longitude: featureLng,
      };
    })
    .filter(Boolean);
}

async function fetchPhotonQuery(query, lat, lng) {
  const url =
    `https://photon.komoot.io/api/?` +
    `q=${encodeURIComponent(query)}&lat=${lat}&lon=${lng}&limit=50`;

  const response = await fetchWithTimeout(url, {}, FAST_TIMEOUT_MS);
  if (!response.ok) {
    throw new Error(`Photon request failed (${response.status})`);
  }

  const data = await response.json();
  return parsePhotonFeatures(data.features || []);
}

export async function fetchFromPhoton(lat, lng) {
  const queries = [
    "bus stop",
    "bus station",
    "bus stand",
    "public transport",
  ];

  const results = await Promise.allSettled(
    queries.map((q) => fetchPhotonQuery(q, lat, lng))
  );

  const merged = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      merged.push(...result.value);
    }
  }
  return merged;
}

async function fetchFromGooglePlaces(lat, lng) {
  const base = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: String(SEARCH_RADIUS_METERS),
    key: GOOGLE_MAPS_API_KEY,
  });

  const queries = [
    `${base}?${params}&type=bus_station`,
    `${base}?${params}&keyword=bus%20stop`,
    `${base}?${params}&keyword=bus%20stand`,
  ];

  const all = [];

  for (const url of queries) {
    try {
      const response = await fetchWithTimeout(url, {}, FAST_TIMEOUT_MS);
      const data = await response.json();

      if (data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST") {
        break;
      }

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        continue;
      }

      for (const place of data.results || []) {
        const placeLat = place.geometry?.location?.lat;
        const placeLng = place.geometry?.location?.lng;
        if (placeLat == null || placeLng == null) continue;

        all.push({
          id: place.place_id || `g-${placeLat}-${placeLng}`,
          name: place.name,
          latitude: placeLat,
          longitude: placeLng,
        });
      }
    } catch {
      // try next query
    }
  }

  return all;
}

async function fetchFromOverpass(lat, lng) {
  const r = SEARCH_RADIUS_METERS;
  const query = `
    [out:json][timeout:15];
    (
      node["highway"="bus_stop"](around:${r},${lat},${lng});
      node["public_transport"="platform"]["bus"="yes"](around:${r},${lat},${lng});
      node["public_transport"="stop_position"]["bus"="yes"](around:${r},${lat},${lng});
      node["public_transport"="platform"](around:${r},${lat},${lng});
      node["amenity"="bus_station"](around:${r},${lat},${lng});
    );
    out body;
  `;

  const urls = [
    `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`,
    "https://overpass-api.de/api/interpreter",
  ];

  let data = null;

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(
        url,
        url.includes("?")
          ? { method: "GET" }
          : {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `data=${encodeURIComponent(query)}`,
            },
        FULL_TIMEOUT_MS
      );

      if (!response.ok) continue;
      data = await response.json();
      break;
    } catch {
      // try next server
    }
  }

  if (!data) {
    throw new Error("Overpass unavailable");
  }

  return (data.elements || [])
    .filter((el) => el.type === "node" && el.lat != null && el.lon != null)
    .map((el) => ({
      id: String(el.id),
      name:
        el.tags?.name ||
        el.tags?.["name:en"] ||
        el.tags?.["name:ta"] ||
        el.tags?.ref ||
        el.tags?.["stop_name"] ||
        "Bus stop",
      latitude: el.lat,
      longitude: el.lon,
    }));
}

async function trySource(fetchFn, lat, lng) {
  const raw = await fetchFn();
  return dedupeAndSort(raw, lat, lng);
}

/**
 * Fetches nearby bus stops from all sources and merges them.
 * onResults is called when the first batch is ready, then again with the full list.
 */
export async function fetchNearbyBusStops(latitude, longitude, { onResults } = {}) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const showPartial = (stops) => {
    if (stops.length > 0 && onResults) {
      onResults(stops);
    }
  };

  // Quick first batch from fastest Photon query
  fetchPhotonQuery("bus stop", lat, lng)
    .then((raw) => showPartial(dedupeAndSort(raw, lat, lng)))
    .catch(() => {});

  const sources = [
    () => fetchFromPhoton(lat, lng),
    () => fetchFromOverpass(lat, lng),
    () => fetchFromGooglePlaces(lat, lng),
  ];

  const results = await Promise.allSettled(
    sources.map((fn) => trySource(fn, lat, lng))
  );

  const merged = [];

  for (const result of results) {
    if (result.status === "fulfilled" && result.value?.length) {
      merged.push(...result.value);
    }
  }

  const stops = dedupeAndSort(merged, lat, lng);

  if (stops.length > 0) {
    if (onResults) onResults(stops);
    return stops;
  }

  throw new Error("No bus stops found nearby. Tap Retry.");
}
