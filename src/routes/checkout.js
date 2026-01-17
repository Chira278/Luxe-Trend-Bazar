const express = require('express');
const router = express.Router();

// POST validate checkout data
router.post('/validate', (req, res) => {
  try {
    const { cart, customerInfo, shippingAddress, billingAddress } = req.body;
    
    const errors = [];
    
    // Validate cart
    if (!cart || cart.length === 0) {
      errors.push({ field: 'cart', message: 'Cart is empty' });
    }
    
    // Validate customer info
    if (!customerInfo) {
      errors.push({ field: 'customerInfo', message: 'Customer information is required' });
    } else {
      if (!customerInfo.name || customerInfo.name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Valid name is required' });
      }
      if (!customerInfo.email || !isValidEmail(customerInfo.email)) {
        errors.push({ field: 'email', message: 'Valid email is required' });
      }
      if (!customerInfo.phone || !isValidPhone(customerInfo.phone)) {
        errors.push({ field: 'phone', message: 'Valid phone number is required' });
      }
    }
    
    // Validate shipping address
    if (!shippingAddress) {
      errors.push({ field: 'shippingAddress', message: 'Shipping address is required' });
    } else {
      if (!shippingAddress.street) errors.push({ field: 'street', message: 'Street address is required' });
      if (!shippingAddress.city) errors.push({ field: 'city', message: 'City is required' });
      if (!shippingAddress.state) errors.push({ field: 'state', message: 'State is required' });
      if (!shippingAddress.zip) errors.push({ field: 'zip', message: 'ZIP code is required' });
      if (!shippingAddress.country) errors.push({ field: 'country', message: 'Country is required' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.json({
      success: true,
      message: 'Validation successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST calculate shipping
router.post('/calculate-shipping', (req, res) => {
  try {
    const { items, shippingAddress, shippingMethod } = req.body;
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const weight = items.reduce((sum, item) => sum + (item.quantity * 1), 0); // Assume 1lb per item
    
    const shippingOptions = [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: '5-7 business days',
        price: subtotal > 500 ? 0 : 15,
        estimatedDays: 7
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: '2-3 business days',
        price: 25,
        estimatedDays: 3
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        description: 'Next business day',
        price: 45,
        estimatedDays: 1
      }
    ];
    
    // International shipping
    if (shippingAddress && shippingAddress.country !== 'USA') {
      shippingOptions.forEach(option => {
        option.price += 30;
        option.estimatedDays += 5;
      });
    }
    
    res.json({
      success: true,
      data: {
        options: shippingOptions,
        freeShippingThreshold: 500,
        currentSubtotal: subtotal
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST calculate tax
router.post('/calculate-tax', (req, res) => {
  try {
    const { subtotal, shippingAddress } = req.body;
    
    // Tax rates by state (simplified)
    const taxRates = {
      'CA': 0.0725,
      'NY': 0.08,
      'TX': 0.0625,
      'FL': 0.06,
      'IL': 0.0625,
      'PA': 0.06,
      'OH': 0.0575,
      'default': 0.07
    };
    
    const state = shippingAddress?.state || 'default';
    const taxRate = taxRates[state] || taxRates['default'];
    const taxAmount = subtotal * taxRate;
    
    res.json({
      success: true,
      data: {
        taxRate: taxRate * 100,
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        state
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST process payment
router.post('/process-payment', async (req, res) => {
  try {
    const { paymentMethod, paymentDetails, amount } = req.body;
    
    // Validate payment details
    if (paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
        return res.status(400).json({
          success: false,
          message: 'Complete card details are required'
        });
      }
      
      // Validate card number (basic Luhn algorithm)
      if (!isValidCardNumber(paymentDetails.cardNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid card number'
        });
      }
    }
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 95% success rate
    if (Math.random() > 0.05) {
      res.json({
        success: true,
        data: {
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          amount,
          paymentMethod,
          status: 'completed',
          processedAt: new Date().toISOString()
        }
      });
    } else {
      res.status(402).json({
        success: false,
        message: 'Payment declined. Please try another payment method.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET payment methods
router.get('/payment-methods', (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: '💳',
        description: 'Visa, Mastercard, American Express',
        enabled: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: '🅿️',
        description: 'Pay with your PayPal account',
        enabled: true
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        icon: '🍎',
        description: 'Pay with Apple Pay',
        enabled: true
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        icon: '🔵',
        description: 'Pay with Google Pay',
        enabled: true
      },
      {
        id: 'crypto',
        name: 'Cryptocurrency',
        icon: '₿',
        description: 'Bitcoin, Ethereum',
        enabled: false
      }
    ];
    
    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function isValidCardNumber(cardNumber) {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s\-]/g, '');
  
  // Check if it's all digits and has valid length
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

module.exports = router;
