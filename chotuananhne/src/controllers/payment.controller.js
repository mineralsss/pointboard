const Order = require("../models/order.model");

// Middleware to verify SePay IP
const isSePayIP = (ip) => {
  const allowedIPs = ['103.255.238.9']; // SePay webhook IP
  return allowedIPs.includes(ip);
};

exports.sePayWebhook = async (req, res) => {
  try {
    // Verify request IP for security
    const clientIP = req.ip || req.headers['x-forwarded-for'];
    if (!isSePayIP(clientIP)) {
      console.warn(`Unauthorized webhook attempt from IP: ${clientIP}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      id, gateway, transactionDate, accountNumber,
      content, transferType, transferAmount, referenceCode
    } = req.body;

    // Only process incoming transfers
    if (transferType !== 'in') {
      return res.status(200).send('Not an incoming transfer');
    }
    
    // Extract order reference from content
    const orderRefMatch = content.match(/PointBoard-([A-Z0-9]+)/i);
    if (!orderRefMatch) {
      return res.status(200).send('No order reference found');
    }
    
    const orderRef = orderRefMatch[1];
    const order = await Order.findOne({ orderRef });
    
    if (!order) {
      return res.status(200).send('Order not found');
    }
    
    // Update order with payment information
    order.paymentStatus = 'paid';
    order.paymentDetails = {
      paymentId: id,
      gateway,
      transactionDate,
      transferAmount,
      referenceCode
    };
    
    await order.save();
    return res.status(200).send('Payment processed successfully');
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).send('Internal server error');
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderRef } = req.params;
    const order = await Order.findOne({ orderRef });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    return res.json({
      paymentVerified: order.paymentStatus === 'paid',
      paymentStatus: order.paymentStatus
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};