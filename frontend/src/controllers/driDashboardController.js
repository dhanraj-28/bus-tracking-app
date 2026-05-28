// src/controllers/DashboardController.js

import {
  fetchBusInfo,
  startGpsSession,
  stopGpsSession,
  updateBusLocation,
  getTodaySessionCount,
} from "../services/driDashboardService";

// ─────────────────────────────────────────
// FETCH BUS INFO
// ─────────────────────────────────────────
export const handleFetchBusInfo = async (driverUniqueId) => {
  try {
    const busInfo = await fetchBusInfo(driverUniqueId);
    return { success: true, busInfo };
  } catch (err) {
    if (err.message === "BUS_INFO_NOT_FOUND") {
      return { success: false, error: "No bus assigned. Please scan QR again." };
    }
    console.error("fetchBusInfo error:", err);
    return { success: false, error: "Failed to load bus info." };
  }
};

// ─────────────────────────────────────────
// TOGGLE GPS ON
// ─────────────────────────────────────────
export const handleStartGps = async (driverUniqueId, busId) => {
  try {
    await startGpsSession(driverUniqueId, busId);
    return { success: true };
  } catch (err) {
    console.error("startGps error:", err);
    return { success: false, error: "Failed to start GPS session." };
  }
};

// ─────────────────────────────────────────
// TOGGLE GPS OFF
// ─────────────────────────────────────────
export const handleStopGps = async (driverUniqueId, totalSeconds) => {
  try {
    await stopGpsSession(driverUniqueId, totalSeconds);
    return { success: true };
  } catch (err) {
    console.error("stopGps error:", err);
    return { success: false, error: "Failed to stop GPS session." };
  }
};

// ─────────────────────────────────────────
// UPDATE LIVE LOCATION
// ─────────────────────────────────────────
export const handleUpdateLocation = async (busId, driverUniqueId) => {
  try {
    const coords = await updateBusLocation(busId, driverUniqueId);
    return { success: true, coords };
  } catch (err) {
    if (err.message === "LOCATION_PERMISSION_DENIED") {
      return { success: false, error: "Location permission denied." };
    }
    console.error("updateLocation error:", err);
    return { success: false, error: "Failed to update location." };
  }
};

// ─────────────────────────────────────────
// GET TODAY SESSION COUNT
// ─────────────────────────────────────────
export const handleGetSessionCount = async (driverUniqueId) => {
  try {
    const count = await getTodaySessionCount(driverUniqueId);
    return { success: true, count };
  } catch (err) {
    console.error("sessionCount error:", err);
    return { success: false, count: 0 };
  }
};