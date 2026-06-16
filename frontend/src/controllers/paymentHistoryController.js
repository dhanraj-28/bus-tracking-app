import {
  subscribeUserPayments,
  subscribePaymentById,
  fetchUserPayments,
  fetchPaymentById,
  applyPaymentFilters,
  groupPaymentsByMonth,
  getFilterOptions,
  parseArrayParam,
} from "../services/paymentHistoryService";

// ——— App (React Native) ———

export const subscribePaymentHistory = (userId, onData, onError) => {
  if (!userId) {
    onError?.(new Error("User not logged in"));
    return () => {};
  }
  return subscribeUserPayments(userId, onData, onError);
};

export const subscribePaymentDetail = (paymentId, onData, onError) => {
  if (!paymentId) {
    onError?.(new Error("Payment id required"));
    return () => {};
  }
  return subscribePaymentById(paymentId, onData, onError);
};

export const getPaymentHistory = async (userId, filters = {}) => {
  if (!userId) {
    return { success: false, error: "User not logged in", payments: [] };
  }

  try {
    const all = await fetchUserPayments(userId);
    const filtered = applyPaymentFilters(all, filters);
    const grouped = groupPaymentsByMonth(filtered);
    const filterOptions = getFilterOptions(all);

    return {
      success: true,
      payments: filtered,
      grouped,
      filterOptions,
      total: filtered.length,
    };
  } catch (error) {
    console.log("Payment history error:", error);
    return {
      success: false,
      error: error.message || "Failed to load payments",
      payments: [],
    };
  }
};

export const getPaymentDetail = async (paymentId) => {
  if (!paymentId) {
    return { success: false, error: "Payment id required" };
  }

  try {
    const payment = await fetchPaymentById(paymentId);
    if (!payment) {
      return { success: false, error: "Payment not found" };
    }
    return { success: true, payment };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to load payment details",
    };
  }
};

// ——— Express API handlers ———

export async function getPaymentHistoryHandler(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const filters = {
      status: parseArrayParam(req.query.status),
      paymentMethod: parseArrayParam(req.query.paymentMethod),
      amount: parseArrayParam(req.query.amount),
      filterDate: req.query.filterDate ? new Date(req.query.filterDate) : null,
      search: req.query.search || "",
    };

    const result = await getPaymentHistory(userId, filters);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log("Payment history API error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      payments: [],
    });
  }
}

export async function getPaymentDetailHandler(req, res) {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "paymentId is required",
      });
    }

    const result = await getPaymentDetail(paymentId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export { applyPaymentFilters, groupPaymentsByMonth, getFilterOptions };
