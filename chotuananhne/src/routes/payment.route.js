const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// SePay webhook endpoint - no auth needed
router.post("/webhook/sepay", paymentController.sePayWebhook);

// Payment status verification
router.get("/verify/:orderRef", paymentController.verifyPayment);

// Transaction history (add auth later when middleware is fixed)
router.get("/transactions", paymentController.getTransactionHistory);

module.exports = router;