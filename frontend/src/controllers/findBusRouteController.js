import {
  fetchRouteEndpointsService,
  getBusLocationService,
  getRouteByIdService,
  searchBusesByRouteService,
  subscribeBusLocationService,
} from "../services/findBusRouteService";

export const fetchStopSuggestionsController = async () => {
  return await fetchRouteEndpointsService();
};

export const searchBusesController = async (from, to) => {
  if (!from?.trim() || !to?.trim()) {
    return {
      success: false,
      error: "Both From and To stops are required",
    };
  }

  return await searchBusesByRouteService(from.trim(), to.trim());
};

export const getRouteDetailsController = async (routeId) => {
  if (!routeId?.trim()) {
    return {
      success: false,
      error: "Route ID is required",
    };
  }

  return await getRouteByIdService(routeId.trim());
};

export const getBusLocationController = async (busId) => {
  if (!busId?.trim()) {
    return {
      success: false,
      error: "Bus ID is required",
    };
  }

  return await getBusLocationService(busId.trim());
};

export const subscribeBusLocationController = (busId, onUpdate, onError) => {
  if (!busId?.trim()) {
    onError?.("Bus ID is required");
    return () => {};
  }

  return subscribeBusLocationService(busId.trim(), onUpdate, onError);
};
