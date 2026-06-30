export const extractStoppingsFromRoute = (route) => {
  if (!route) return [];

  let rawStops = [];

  // If it's already an array
  if (Array.isArray(route)) {
    rawStops = route;
  } else {
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
        rawStops = sortedKeys.map((key) => value[key]);
        break;
      } else if (value && Array.isArray(value)) {
        rawStops = value;
        break;
      }
    }
  }

  // Convert raw items into standard stop objects
  let stops = rawStops.map((stop, idx) => {
    if (typeof stop === "string") {
      return { id: `stop_${idx}`, name: stop, time: "", index: idx };
    }
    return {
      id: stop.id || String(idx),
      name: stop.name || stop.stopName || stop.station || stop.title || `Stop ${idx + 1}`,
      time: stop.time || stop.arrivalTime || stop.stopTime || "",
      latitude: stop.latitude || stop.lat || null,
      longitude: stop.longitude || stop.lng || null,
      index: typeof stop.index === "number" ? stop.index : idx,
    };
  });

  if (!Array.isArray(route)) {
    // Include startStop if present and not already at start
    const startName = (route.startStop || route.start_stop || "").trim();
    if (startName) {
      const firstStopName = (stops[0]?.name || "").trim().toLowerCase();
      if (firstStopName !== startName.toLowerCase()) {
        stops.unshift({
          id: "start_stop",
          name: startName,
          time: "",
          index: -1,
        });
      }
    }

    // Include endStop if present and not already at end
    const endName = (route.endStop || route.end_stop || "").trim();
    if (endName) {
      const lastStopName = (stops[stops.length - 1]?.name || "").trim().toLowerCase();
      if (lastStopName !== endName.toLowerCase()) {
        stops.push({
          id: "end_stop",
          name: endName,
          time: "",
          index: 999,
        });
      }
    }
  }

  return stops.map((s, idx) => ({ ...s, index: idx }));
};
