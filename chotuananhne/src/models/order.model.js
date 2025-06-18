const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderRef: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Make optional for guest checkout
    },
    items: [{
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }],
    shippingInfo: {
      firstName: String,
      lastName: String,
      address: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String
    },
    total: {
      type: Number,
      required: true
    },
    subtotal: Number,
    tax: Number,
    shipping: Number,
    paymentMethod: {
      type: String,
      enum: ['vietqr', 'cash'],
      default: 'vietqr'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paymentDetails: {
      paymentId: String,
      gateway: String,
      transactionDate: String,
      transferAmount: Number,
      referenceCode: String
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;