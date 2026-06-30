// ============================================================
//  trackController.js  —  TEAMMATE'S FILE + NEW ADDITIONS
//  ADDED at bottom (teammate's code untouched above):
//   - subscribeBusLocation()  ← new export for LiveTrack.jsx
// ============================================================

import {
  getAllRoutesService,
  getStoppingsByRouteIdService,
  searchBusesService,
  subscribeToBusLocationByRoute,
  getCurrentBusLocationByRoute,    // ← new import
  getStopCoordinatesService,      // ← new import
} from "../services/trackBusService";

// ── TEAMMATE'S ORIGINAL CODE — NOT TOUCHED ───────────────────

export const getAllRoutes = async () => {
  return await getAllRoutesService();
};

export const getRouteStoppingsById = async (routeId) => {
  return await getStoppingsByRouteIdService(routeId);
};

export const searchBusesController = async (
  searchText,
  setFilteredBuses,
  setLoading
) => {
  try {
    setLoading(true);
    const response = await searchBusesService(searchText);
    if (response.success) {
      setFilteredBuses(response.data);
    } else {
      setFilteredBuses([]);
    }
  } catch (error) {
    console.log("Controller Error:", error);
    setFilteredBuses([]);
  } finally {
    setLoading(false);
  }
};

// ── NEW ADDITIONS ─────────────────────────────────────────────

export const getCompleteRoute = async (routeId) => {
  const result = await getRouteStoppingsById(routeId);
  if (result && result.stoppings) {
    return result.stoppings;
  }
  return [];
};

export const getCurrentBusLocation = async (routeId) => {
  const result = await getCurrentBusLocationByRoute(routeId);
  if (result.success) {
    return result.busLocation;
  }
  return null;
};

export const getStopCoordinates = async () => {
  const result = await getStopCoordinatesService();
  if (result.success) {
    return result.coordinates;
  }
  return {};
};

// ─────────────────────────────────────────────
//  Subscribe to live bus location for a route.
//  Called from LiveTrack.jsx after stops are loaded.
//
//  Matches currentStopName from busLocations against
//  the stops array to get currentStopIndex for animation.
//
//  @param {string}   routeId   - e.g. "ROUTE101"
//  @param {Array}    stops     - array of { name, time } from getRouteStoppingsById
//                                used to find index by matching stop name
//  @param {function} onStopIndexChange - called with (index, busData)
//                                        index → passed to LiveBarTrack as currentStopIndex
//  @param {function} onBusInactive    - called when no driver is active on route
//  @param {function} onError          - called with error string
//  @returns {function}                - unsubscribe function (call on unmount)
// ─────────────────────────────────────────────
export const subscribeBusLocation = (
  routeId,
  stops,
  onStopIndexChange,
  onBusInactive,
  onError
) => {
  const unsubscribe = subscribeToBusLocationByRoute(
    routeId,
    (busData) => {
      if (!busData.isActive || !busData.currentStopName) {
        // Driver hasn't started or went offline
        onBusInactive();
        return;
      }

      // Match currentStopName from Firestore → index in stops array
      // Case-insensitive + trimmed for safety
      const currentName = busData.currentStopName.toLowerCase().trim();

      const index = stops.findIndex(
        (stop) => stop.name?.toLowerCase().trim() === currentName
      );

      // If name not found in stops list, keep current position (don't jump to -1)
      const safeIndex = index >= 0 ? index : 0;

      console.log(
        `[BusLocation] currentStopName: "${busData.currentStopName}" → index: ${safeIndex}`
      );

      // Fire callback with index + full busData
      // LiveTrack sets currentStopIndex → LiveBarTrack animates automatically
      onStopIndexChange(safeIndex, busData);
    },
    onError
  );

  return unsubscribe;
};