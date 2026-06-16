const express = require("express");

const router = express.Router();

router.get("/history", async (req, res) => {
  const { getPaymentHistoryHandler } = await import(
    "../controllers/paymentHistoryController.js"
  );
  return getPaymentHistoryHandler(req, res);
});

router.get("/detail/:paymentId", async (req, res) => {
  const { getPaymentDetailHandler } = await import(
    "../controllers/paymentHistoryController.js"
  );
  return getPaymentDetailHandler(req, res);
});

module.exports = router;
