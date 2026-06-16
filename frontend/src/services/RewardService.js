// src/services/rewardService.js

import {
  collection, query, where, getDocs, orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Points calculation: 1 point per minute of GPS on
const POINTS_PER_MINUTE = 1;
const INCENTIVE_THRESHOLD = 500; // points needed for incentive
const INCENTIVE_AMOUNT = 500;    // rupees

/**
 * Fetch all completed GPS sessions for a driver
 * Returns sessions with date, duration, points
 */
export const fetchDriverSessions = async (driverUniqueId) => {
  const q = query(
    collection(db, "driverSessions"),
    where("driverUniqueId", "==", driverUniqueId),
    where("gpsActive", "==", false) // only completed sessions
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return [];

  const sessions = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const totalSeconds = Number(data.totalDuration) || 0;
      const totalMinutes = Math.floor(totalSeconds / 60);
      const points = totalMinutes * POINTS_PER_MINUTE;

      // Format date
      let dateStr = "-";
      if (data.sessionStartedAt) {
        const date = data.sessionStartedAt.toDate();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        dateStr = `${day}/${month}/${year}`;
      }

      // Format duration
      const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      const secs = String(totalSeconds % 60).padStart(2, "0");
      const durationStr = `${hrs}:${mins}:${secs}`;

      return {
        id: doc.id,
        date: dateStr,
        duration: durationStr,
        points,
        totalSeconds,
        timestamp: data.sessionStartedAt?.toDate() || new Date(0),
      };
    })
    .filter((s) => s.totalSeconds > 0) // skip 0-second sessions
    .sort((a, b) => b.timestamp - a.timestamp); // latest first

  return sessions;
};

/**
 * Calculate total points and incentive
 */
export const calculateRewards = (sessions) => {
  const totalPoints = sessions.reduce((sum, s) => sum + s.points, 0);
  const earnedIncentive = totalPoints >= INCENTIVE_THRESHOLD ? INCENTIVE_AMOUNT : 0;
  const pointsToNextIncentive = Math.max(0, INCENTIVE_THRESHOLD - totalPoints);

  return { totalPoints, earnedIncentive, pointsToNextIncentive };
};