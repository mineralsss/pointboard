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
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
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
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
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

// Create virtual for full name
orderSchema.virtual('shippingInfo.fullName').get(function() {
  return `${this.shippingInfo.firstName} ${this.shippingInfo.lastName}`;
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;