export const extractStoppingsFromRoute = (route) => {
  if (!route) return [];

  // If it's already an array, return it
  if (Array.isArray(route)) {
    return normalizeStops(route);
  }

  // Check for map format (e.g. STOPS: { stop1: "Polytechnic...", stop2: "..." })
  const possibleFields = ["STOPS", "stops", "stoppings", "Stoppings", "stopping"];
  for (const field of possibleFields) {
    const value = route[field];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const keys = Object.keys(value);
      const sortedKeys = keys.sort((a, b) => {
        const numA = parseInt(a.replace(/^\D+/g, ""), 10) || 0;
        const numB = parseInt(b.replace(/^\D+/g, ""), 10) || 0;
        return numA - numB;
      });
      return sortedKeys.map((key, idx) => ({
        id: key,
        name: value[key],
        time: "",
        index: idx,
      }));
    }
  }

  // Check common array fields in the route object
  for (const field of possibleFields) {
    if (route[field] && Array.isArray(route[field])) {
      return normalizeStops(route[field]);
    }
  }

  return [];
};

const normalizeStops = (stopsArray) => {
  return stopsArray
    .map((stop, idx) => ({
      id: stop.id || String(idx),
      name: stop.name || stop.stopName || stop.station || stop.title || `Stop ${idx + 1}`,
      time: stop.time || stop.arrivalTime || stop.stopTime || "",
      latitude: stop.latitude || stop.lat || null,
      longitude: stop.longitude || stop.lng || null,
      index: typeof stop.index === "number" ? stop.index : idx,
    }))
    .sort((a, b) => a.index - b.index);
};
