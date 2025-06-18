const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// Temporary fix: Remove auth middleware for now
// const { protect } = require("../middlewares/auth.middleware");

// Create new order - removed auth temporarily
router.post("/", orderController.createOrder);

// Get order by reference - removed auth temporarily
router.get("/:orderRef", orderController.getOrderByRef);

// Get payment status for order
router.get("/payment-status/:orderRef", orderController.getPaymentStatus);

// Get user's orders - removed auth temporarily
router.get("/", orderController.getUserOrders);

module.exports = router;