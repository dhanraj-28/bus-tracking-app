const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const SEARCH_RADIUS_METERS = 2000;
const MAX_STOPS = 15;

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

function getStopName(tags = {}) {
  return (
    tags.name ||
    tags["name:en"] ||
    tags["name:ta"] ||
    tags.ref ||
    tags["stop_name"] ||
    null
  );
}

function buildOverpassQuery(lat, lng) {
  return `
    [out:json][timeout:25];
    (
      node["highway"="bus_stop"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      node["public_transport"="platform"]["bus"="yes"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      node["public_transport"="stop_position"]["bus"="yes"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      node["amenity"="bus_station"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
    );
    out body;
  `;
}

const fetchNearbyBusStops = async (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  let data = null;
  let lastError = null;

  for (const url of OVERPASS_URLS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(buildOverpassQuery(lat, lng))}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass request failed (${response.status})`);
      }

      data = await response.json();
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!data) {
    throw lastError || new Error("Failed to fetch nearby bus stops");
  }
  const elements = data.elements || [];

  const stops = elements
    .filter((el) => el.type === "node" && el.lat != null && el.lon != null)
    .map((el) => {
      const distance = getDistanceMeters(lat, lng, el.lat, el.lon);
      const name = getStopName(el.tags);
      return {
        id: String(el.id),
        name: name || `Bus stop (${Math.round(distance)} m away)`,
        latitude: el.lat,
        longitude: el.lon,
        distance: Math.round(distance),
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_STOPS);

  const seen = new Set();
  return stops.filter((stop) => {
    const key = `${stop.name}-${stop.latitude.toFixed(5)}-${stop.longitude.toFixed(5)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

module.exports = {
  fetchNearbyBusStops,
};
