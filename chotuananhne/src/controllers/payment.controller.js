const Order = require("../models/order.model");
const Transaction = require("../models/transaction.model");

// Middleware to verify SePay IP
const isSePayIP = (ip) => {
  const allowedIPs = ['103.255.238.9']; // SePay webhook IP
  return allowedIPs.includes(ip) || process.env.NODE_ENV === 'development';
};

exports.sePayWebhook = async (req, res) => {
  try {
    const clientIP = req.ip || req.headers['x-forwarded-for'];
    
    // Save all incoming webhook requests regardless of IP or content
    const transaction = new Transaction({
      transactionId: req.body.id || null,
      orderRef: null, // Will be updated if found
      gateway: req.body.gateway || 'unknown',
      amount: req.body.transferAmount || 0,
      content: req.body.content || '',
      referenceCode: req.body.referenceCode || null,
      status: 'pending',
      rawData: req.body,
      requestIP: clientIP
    });
    
    // For unauthenticated requests (not from SePay IP), save the record but don't process
    if (!isSePayIP(clientIP)) {
      transaction.status = 'failed';
      await transaction.save();
      
      // Return success response even for unauthenticated requests
      return res.status(200).json({ 
        success: true, 
        message: 'Transaction logged but not processed'
      });
    }

    // Extract data from SePay webhook
    const {
      id, gateway, transactionDate, accountNumber,
      content, transferType, transferAmount, referenceCode
    } = req.body;

    // Only process incoming transfers
    if (transferType !== 'in') {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(200).json({ 
        success: true, 
        message: 'Transaction logged but not processed - not an incoming transfer' 
      });
    }
    
    // Extract order reference from content
    const orderRefMatch = content.match(/PointBoard-([A-Z0-9]+)/i);
    if (!orderRefMatch) {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(200).json({ 
        success: true, 
        message: 'Transaction logged but not processed - no order reference found' 
      });
    }
    
    const orderRef = orderRefMatch[1];
    transaction.orderRef = orderRef;
    
    const order = await Order.findOne({ orderRef });
    if (!order) {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(200).json({ 
        success: true, 
        message: 'Transaction logged but not processed - order not found' 
      });
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
    
    // Update transaction record as successful
    transaction.status = 'success';
    await transaction.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Payment processed successfully' 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Try to save error information if possible
    try {
      new Transaction({
        status: 'failed',
        rawData: req.body,
        requestIP: req.ip || req.headers['x-forwarded-for'],
        content: 'Error processing: ' + error.message
      }).save();
    } catch (saveError) {
      console.error('Could not save error transaction:', saveError);
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Error occurred but recorded' 
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderRef } = req.params;
    const order = await Order.findOne({ orderRef });
    
    if (!order) {
      return res.status(200).json({ 
        success: true, 
        verified: false,
        message: 'Order not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      verified: order.paymentStatus === 'paid',
      status: order.paymentStatus
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(200).json({ 
      success: true, 
      verified: false,
      message: 'Error verifying payment'
    });
  }
};

// Add endpoint to view transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort('-createdAt').limit(100);
    
    return res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(200).json({
      success: true,
      transactions: [],
      message: 'Error fetching transactions'
    });
  }
};