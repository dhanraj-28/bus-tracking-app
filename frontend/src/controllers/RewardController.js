// src/controllers/rewardController.js

import { fetchDriverSessions, calculateRewards } from "../services/RewardService";

export const handleFetchRewards = async (driverUniqueId) => {
  try {
    if (!driverUniqueId) {
      return { success: false, error: "Driver ID missing." };
    }

    const sessions = await fetchDriverSessions(driverUniqueId);
    const rewards = calculateRewards(sessions);

    return {
      success: true,
      sessions,
      totalPoints: rewards.totalPoints,
      earnedIncentive: rewards.earnedIncentive,
      pointsToNextIncentive: rewards.pointsToNextIncentive,
    };
  } catch (err) {
    console.error("fetchRewards error:", err);
    return { success: false, error: "Failed to load reward data." };
  }
};