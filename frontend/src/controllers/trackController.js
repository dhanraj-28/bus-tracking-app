// controllers/trackController.js

import {
  getAllRoutesService,
  getStoppingsByRouteIdService,
  searchBusesService,
} from "../services/trackBusService";
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