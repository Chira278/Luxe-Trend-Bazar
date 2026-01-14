const express = require('express');
const router = express.Router();
const { generateInvoice } = require('../services/invoiceGenerator');
const path = require('path');
const fs = require('fs');

// In-memory orders storage (use database in production)
const orders = [];
let orderIdCounter = 1000;

// Simulate payment processing
function processPayment(paymentMethod, amount, paymentDetails) {
  // Simulate payment gateway processing
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 95% success rate
      if (Math.random() > 0.05) {
        resolve({
          success: true,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          amount,
          paymentMethod,
          processedAt: new Date().toISOString()
        });
      } else {
        reject(new Error('Payment processing failed'));
      }
    }, 1500); // Simulate processing delay
  });
}

// POST create new order with payment processing
router.post('/', async (req, res) => {
  try {
    const { 
      sessionId, 
      items, 
      customerInfo, 
      paymentMethod,
      paymentDetails,
      shippingAddress,
      billingAddress,
      couponCode
    } = req.body;
    
    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    if (!customerInfo || !customerInfo.email || !customerInfo.name) {
      return res.status(400).json({
        success: false,
        message: 'Customer information is required'
      });
    }
    
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }
    
    // Calculate pricing
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 500 ? 0 : 15;
    
    // Apply coupon discount
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = validateCoupon(couponCode, subtotal);
      if (coupon.valid) {
        discount = coupon.discount;
        appliedCoupon = coupon;
      }
    }
    
    const total = subtotal + tax + shipping - discount;
    
    // Process payment
    let paymentResult;
    try {
      paymentResult = await processPayment(paymentMethod, total, paymentDetails);
    } catch (error) {
      return res.status(402).json({
        success: false,
        message: 'Payment processing failed. Please try again.',
        error: error.message
      });
    }
    
    // Create order
    const order = {
      orderId: `ORD-${orderIdCounter++}`,
      sessionId,
      items,
      customerInfo,
      paymentMethod: paymentMethod || 'card',
      paymentDetails: {
        transactionId: paymentResult.transactionId,
        processedAt: paymentResult.processedAt,
        status: 'completed'
      },
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      pricing: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      },
      coupon: appliedCoupon,
      status: 'confirmed',
      paymentStatus: 'paid',
      trackingNumber: generateTrackingNumber(),
      statusHistory: [
        {
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          message: 'Order confirmed and payment received'
        }
      ],
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    orders.push(order);
    
    // Generate invoice PDF
    try {
      const invoice = await generateInvoice(order);
      order.invoice = invoice;
      console.log(`📄 Invoice generated: ${invoice.fileName}`);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
    
    // Send confirmation email (simulated)
    sendOrderConfirmationEmail(order);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET all orders (for admin or user)
router.get('/', (req, res) => {
  try {
    const { sessionId, email } = req.query;
    
    let filteredOrders = orders;
    
    if (sessionId) {
      filteredOrders = orders.filter(o => o.sessionId === sessionId);
    }
    
    if (email) {
      filteredOrders = orders.filter(o => o.customerInfo.email === email);
    }
    
    res.json({
      success: true,
      count: filteredOrders.length,
      data: filteredOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET single order by ID
router.get('/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT update order status
router.put('/:orderId/status', (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, message } = req.body;
    
    const validStatuses = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    // Add to status history
    orders[orderIndex].statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      message: message || getStatusMessage(status)
    });
    
    // Send notification email
    sendStatusUpdateEmail(orders[orderIndex]);
    
    res.json({
      success: true,
      message: 'Order status updated',
      data: orders[orderIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST cancel order
router.post('/:orderId/cancel', (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[orderIndex];
    
    // Check if order can be cancelled
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }
    
    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      message: `Order cancelled: ${reason}`
    });
    
    // Process refund
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      order.refundDetails = {
        amount: order.pricing.total,
        processedAt: new Date().toISOString(),
        transactionId: `REF-${Date.now()}`
      };
    }
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET track order
router.get('/:orderId/track', (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        statusHistory: order.statusHistory,
        currentLocation: getCurrentLocation(order.status)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST apply coupon
router.post('/validate-coupon', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    
    const coupon = validateCoupon(code, subtotal);
    
    if (!coupon.valid) {
      return res.status(400).json({
        success: false,
        message: coupon.message
      });
    }
    
    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper functions
function generateTrackingNumber() {
  return `TRK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function validateCoupon(code, subtotal) {
  const coupons = {
    'WELCOME10': { type: 'percentage', value: 10, minOrder: 50 },
    'SAVE20': { type: 'percentage', value: 20, minOrder: 100 },
    'FLAT50': { type: 'fixed', value: 50, minOrder: 200 },
    'FREESHIP': { type: 'shipping', value: 0, minOrder: 0 }
  };
  
  const coupon = coupons[code.toUpperCase()];
  
  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }
  
  if (subtotal < coupon.minOrder) {
    return { 
      valid: false, 
      message: `Minimum order of $${coupon.minOrder} required` 
    };
  }
  
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  }
  
  return {
    valid: true,
    code: code.toUpperCase(),
    type: coupon.type,
    discount: parseFloat(discount.toFixed(2)),
    message: `Coupon applied successfully!`
  };
}

function getStatusMessage(status) {
  const messages = {
    'confirmed': 'Order confirmed and payment received',
    'processing': 'Order is being processed',
    'shipped': 'Order has been shipped',
    'out_for_delivery': 'Order is out for delivery',
    'delivered': 'Order has been delivered',
    'cancelled': 'Order has been cancelled',
    'refunded': 'Refund has been processed'
  };
  return messages[status] || 'Status updated';
}

function getCurrentLocation(status) {
  const locations = {
    'confirmed': 'Order Processing Center',
    'processing': 'Warehouse - Packaging',
    'shipped': 'In Transit',
    'out_for_delivery': 'Local Distribution Center',
    'delivered': 'Delivered to Customer',
    'cancelled': 'Order Cancelled'
  };
  return locations[status] || 'Unknown';
}

function sendOrderConfirmationEmail(order) {
  // Simulate email sending
  console.log(`📧 Order confirmation email sent to ${order.customerInfo.email}`);
  console.log(`Order ID: ${order.orderId}`);
  console.log(`Total: $${order.pricing.total}`);
}

function sendStatusUpdateEmail(order) {
  // Simulate email sending
  console.log(`📧 Status update email sent to ${order.customerInfo.email}`);
  console.log(`Order ID: ${order.orderId}`);
  console.log(`New Status: ${order.status}`);
}

// GET download invoice
router.get('/:orderId/invoice', (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (!order.invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not available'
      });
    }
    
    const filePath = order.invoice.filePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Invoice file not found'
      });
    }
    
    res.download(filePath, order.invoice.fileName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
