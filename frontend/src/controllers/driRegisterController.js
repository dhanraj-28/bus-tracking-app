// src/controllers/driverController.js

import { verifyDriver } from "../services/driService";
/**
 * Validates the form input and checks against Firestore data.
 * If correct → returns driver data so UI can navigate forward.
 *
 * @param {string} uid      - Unique ID entered in form
 * @param {string} password - Password entered in form
 * @returns {Object} - { success: bool, driver?, error? }
 */
export const handleDriverLogin = async (uid, password) => {
  try {
    // --- Basic validation ---
    if (!uid || !uid.trim()) {
      return { success: false, error: "Please enter your Unique ID." };
    }

    if (!password || !password.trim()) {
      return { success: false, error: "Please enter your password." };
    }

    // --- Verify against Firestore ---
    const result = await verifyDriver(uid, password);

    return { success: true, driver: result.driver };

  } catch (err) {
    if (err.message === "DRIVER_NOT_FOUND") {
      return {
        success: false,
        error: "No driver found with this Unique ID.",
      };
    }

    if (err.message === "WRONG_PASSWORD") {
      return {
        success: false,
        error: "Incorrect password. Please try again.",
      };
    }

    console.error("Login error:", err);
    return {
      success: false,
      error: "Something went wrong. Check your connection and try again.",
    };
  }
};