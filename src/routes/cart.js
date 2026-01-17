const express = require('express');
const router = express.Router();

// In-memory cart storage (use Redis or database in production)
const carts = new Map();

// GET cart by session ID
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const cart = carts.get(sessionId) || [];
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    res.json({
      success: true,
      data: {
        items: cart,
        summary: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST add item to cart
router.post('/:sessionId/add', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId, name, price, image, quantity = 1 } = req.body;
    
    if (!productId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    let cart = carts.get(sessionId) || [];
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        productId,
        name,
        price,
        image,
        quantity
      });
    }
    
    carts.set(sessionId, cart);
    
    res.json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT update cart item quantity
router.put('/:sessionId/update/:productId', (req, res) => {
  try {
    const { sessionId, productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    let cart = carts.get(sessionId) || [];
    const itemIndex = cart.findIndex(item => item.productId === parseInt(productId));
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    cart[itemIndex].quantity = quantity;
    carts.set(sessionId, cart);
    
    res.json({
      success: true,
      message: 'Cart updated',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE remove item from cart
router.delete('/:sessionId/remove/:productId', (req, res) => {
  try {
    const { sessionId, productId } = req.params;
    
    let cart = carts.get(sessionId) || [];
    cart = cart.filter(item => item.productId !== parseInt(productId));
    carts.set(sessionId, cart);
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE clear entire cart
router.delete('/:sessionId/clear', (req, res) => {
  try {
    const { sessionId } = req.params;
    carts.delete(sessionId);
    
    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
