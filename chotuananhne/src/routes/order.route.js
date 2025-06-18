const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");

// Create new order
router.post("/", protect, orderController.createOrder);

// Get order by reference
router.get("/:orderRef", protect, orderController.getOrderByRef);

// Get payment status for order
router.get("/payment-status/:orderRef", orderController.getPaymentStatus);

// Get user's orders
router.get("/", protect, orderController.getUserOrders);

module.exports = router;