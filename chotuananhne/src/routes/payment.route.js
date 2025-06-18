const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// SePay webhook endpoint
router.post("/webhook/sepay", paymentController.sePayWebhook);

// Payment status verification
router.get("/verify/:orderRef", paymentController.verifyPayment);

module.exports = router;