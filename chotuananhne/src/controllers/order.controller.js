const path = require('path');
const Order = require(path.join(__dirname, '..', 'models', 'order.model'));

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, paymentMethod, total, orderRef } = req.body;
    
    const newOrder = new Order({
      orderRef,
      user: req.user?._id,
      items,
      shippingInfo,
      paymentMethod,
      total,
      paymentStatus: 'pending'
    });
    
    await newOrder.save();
    
    return res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderRef } = req.params;
    const order = await Order.findOne({ orderRef });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    return res.json({
      success: true,
      status: order.paymentStatus,
      paymentVerified: order.paymentStatus === 'paid'
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check payment status"
    });
  }
};

exports.getOrderByRef = async (req, res) => {
  try {
    const { orderRef } = req.params;
    const order = await Order.findOne({ orderRef });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    return res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error finding order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to find order"
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    
    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get orders"
    });
  }
};