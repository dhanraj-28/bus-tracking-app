import { submitFeedbackService } from "../services/fbService";

export const submitFeedbackController = async ({
  userId,
  rating,
  locationAccuracy,
  message,
}) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to submit feedback",
      };
    }

    if (rating == null || rating < 1 || rating > 5) {
      return {
        success: false,
        error: "Please select a rating",
      };
    }

    if (typeof locationAccuracy !== "boolean") {
      return {
        success: false,
        error: "Please answer the bus location accuracy question",
      };
    }

    if (!message || !message.trim()) {
      return {
        success: false,
        error: "Please write your feedback",
      };
    }

    return await submitFeedbackService({
      userId,
      rating,
      locationAccuracy,
      message: message.trim(),
    });
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
