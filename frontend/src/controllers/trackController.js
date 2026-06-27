// ============================================================
//  trackController.js — wires UI to route + bus location services
// ============================================================

import { searchBusByNumber, getCompleteRoute } from "../services/routeService";
import { getAllRoutesService } from "../services/trackBusService";
import { subscribeLiveTracking } from "./liveMapController";

export const getAllRoutes = async () => {
  return getAllRoutesService();
};

export const getRouteStoppingsById = async (routeId) => {
  const { route, stops } = await getCompleteRoute(routeId);
  return { route, stoppings: stops };
};

export const searchBusesController = async (searchText, setFilteredBuses, setLoading) => {
  try {
    setLoading(true);
    const data = await searchBusByNumber(searchText);
    setFilteredBuses(data);
  } catch (error) {
    console.log("Controller Error:", error);
    setFilteredBuses([]);
  } finally {
    setLoading(false);
  }
};

export const subscribeBusLocation = (
  routeId,
  stops,
  onStopIndexChange,
  onBusInactive,
  onError
) => {
  const busNumber = null;

  return subscribeLiveTracking(routeId, busNumber, stops, {
    onUpdate: (data) => {
      onStopIndexChange(data.currentIndex, {
        currentStopName: data.currentStopName,
        nextStopName: data.nextStopName,
        speed: data.location?.speed ?? 0,
        updatedAt: data.location?.updatedAt,
        latitude: data.location?.latitude,
        longitude: data.location?.longitude,
        distanceToStop: data.location?.distanceToStop,
        isActive: true,
      });
    },
    onInactive: () => onBusInactive?.(),
    onError: (msg) => onError?.(msg),
  });
};
