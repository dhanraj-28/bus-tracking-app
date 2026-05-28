// src/controllers/BusDetailController.js

import { saveBusSession } from "../services/BusDetailService";

/**
 * Controller for PROCEED button in BusDetailsScreen.
 * Validates data → saves to Firestore → returns result.
 *
 * @param {string} driverUniqueId - from navigation params
 * @param {Object} busData        - scanned QR data
 * @returns {Object} { success: bool, error? }
 */
export const handleProceed = async (driverUniqueId, busData) => {
  try {
    // --- Validation ---
    if (!driverUniqueId || !driverUniqueId.trim()) {
      return { success: false, error: "Driver ID is missing. Please login again." };
    }

    if (!busData) {
      return { success: false, error: "Bus data is missing. Please scan again." };
    }

    if (!busData.busName || !busData.routeNumber) {
      return { success: false, error: "Invalid bus data. Please scan again." };
    }

    // --- Save to Firestore ---
    await saveBusSession(driverUniqueId, busData);

    return { success: true };

  } catch (err) {
    if (err.message === "DRIVER_ID_MISSING") {
      return { success: false, error: "Driver ID is missing. Please login again." };
    }
    if (err.message === "BUS_DATA_INVALID") {
      return { success: false, error: "Invalid bus data. Please scan again." };
    }

    console.error("Proceed error:", err);
    return { success: false, error: "Something went wrong. Check your connection." };
  }
};