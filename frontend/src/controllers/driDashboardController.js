// src/controllers/driDashboardController.js

import {
  fetchBusInfo,
  checkExistingSession,
  checkLocationServices,
  startGpsSession,
  stopGpsSession,
  updateBusLocation,
  getTodaySessionCount,
} from "../services/driDashboardService";

// ✅ FIX: accepts optional qrRouteId so service uses QR's routeId for stops
export const handleFetchBusInfo = async (driverUniqueId, qrRouteId = null) => {
  try {
    const busInfo = await fetchBusInfo(driverUniqueId, qrRouteId);
    return { success: true, busInfo };
  } catch (err) {
    if (err.message === "DRIVER_NOT_FOUND")
      return { success: false, error: "Driver not found. Please login again." };
    if (err.message === "BUS_NOT_ASSIGNED")
      return { success: false, error: "No bus assigned to this driver." };
    if (err.message === "BUS_NOT_FOUND")
      return { success: false, error: "Bus not found. Contact admin." };
    console.error("fetchBusInfo error:", err);
    return { success: false, error: "Failed to load bus info." };
  }
};

export const handleCheckLocationServices = async () => {
  try {
    return await checkLocationServices();
  } catch {
    return { enabled: false };
  }
};

export const handleCheckExistingSession = async (driverUniqueId) => {
  try {
    const session = await checkExistingSession(driverUniqueId);
    return { success: true, session };
  } catch (err) {
    console.error("checkSession error:", err);
    return { success: true, session: null };
  }
};

export const handleStartGps = async (driverUniqueId, busDocId, previousSeconds) => {
  try {
    await startGpsSession(driverUniqueId, busDocId, Number(previousSeconds) || 0);
    return { success: true };
  } catch (err) {
    console.error("startGps error:", err);
    return { success: false, error: "Failed to start GPS session." };
  }
};

export const handleStopGps = async (driverUniqueId, totalSeconds) => {
  try {
    await stopGpsSession(driverUniqueId, Number(totalSeconds) || 0);
    return { success: true };
  } catch (err) {
    console.error("stopGps error:", err);
    return { success: false, error: "Failed to stop GPS session." };
  }
};

export const handleUpdateLocation = async (
  busDocId, driverUniqueId, routeId, stopsSequence
) => {
  try {
    const result = await updateBusLocation(busDocId, driverUniqueId, routeId, stopsSequence);
    return { success: true, ...result };
  } catch (err) {
    if (err.message === "LOCATION_PERMISSION_DENIED")
      return { success: false, error: "Location permission denied." };
    if (err.message === "LOCATION_SERVICES_DISABLED")
      return { success: false, error: "LOCATION_OFF" };
    console.error("updateLocation error:", err);
    return { success: false, error: "Failed to update location." };
  }
};

export const handleGetSessionCount = async (driverUniqueId) => {
  try {
    const count = await getTodaySessionCount(driverUniqueId);
    return { success: true, count };
  } catch (err) {
    console.error("sessionCount error:", err);
    return { success: false, count: 0 };
  }
};