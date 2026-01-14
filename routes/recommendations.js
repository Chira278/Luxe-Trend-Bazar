const express = require('express');
const router = express.Router();

// Sample products for recommendations (in production, fetch from database)
const products = [
  { id: 1, name: 'Sony WH-1000XM5 Headphones', category: 'electronics', price: 399 },
  { id: 2, name: 'Apple Watch Series 9', category: 'electronics', price: 499 },
  { id: 3, name: 'Ray-Ban Aviator Sunglasses', category: 'fashion', price: 199 },
  { id: 4, name: 'Premium Leather Wallet', category: 'accessories', price: 89 },
  { id: 5, name: 'JBL Charge 5 Speaker', category: 'electronics', price: 179 },
  { id: 6, name: 'Designer Leather Handbag', category: 'fashion', price: 799 },
  { id: 7, name: 'Nike Premium Backpack', category: 'accessories', price: 149 },
  { id: 8, name: 'Canon EOS R6 Camera', category: 'electronics', price: 2499 },
  { id: 9, name: 'Oakley Sport Sunglasses', category: 'fashion', price: 249 },
  { id: 10, name: 'Wireless Earbuds Pro', category: 'electronics', price: 249 },
  { id: 11, name: 'Luxury Wrist Watch', category: 'accessories', price: 899 },
  { id: 12, name: 'Premium Denim Jacket', category: 'fashion', price: 189 }
];

// POST get recommendations based on viewed products
router.post('/similar', (req, res) => {
  try {
    const { viewedProductIds, limit = 4 } = req.body;
    
    if (!viewedProductIds || viewedProductIds.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Get the last viewed product
    const lastViewedId = viewedProductIds[viewedProductIds.length - 1];
    const lastViewedProduct = products.find(p => p.id === lastViewedId);
    
    if (!lastViewedProduct) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Find similar products (same category, different product)
    const recommendations = products
      .filter(p => 
        p.category === lastViewedProduct.category && 
        p.id !== lastViewedProduct.id &&
        !viewedProductIds.includes(p.id)
      )
      .slice(0, limit);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST get recommendations based on cart items
router.post('/cart-based', (req, res) => {
  try {
    const { cartItems, limit = 4 } = req.body;
    
    if (!cartItems || cartItems.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Get categories from cart items
    const cartProductIds = cartItems.map(item => item.productId);
    const cartProducts = products.filter(p => cartProductIds.includes(p.id));
    const cartCategories = [...new Set(cartProducts.map(p => p.category))];
    
    // Find complementary products
    const recommendations = products
      .filter(p => 
        cartCategories.includes(p.category) && 
        !cartProductIds.includes(p.id)
      )
      .sort((a, b) => b.price - a.price)
      .slice(0, limit);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET trending products
router.get('/trending', (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // Simulate trending products (in production, based on sales data)
    const trending = [...products]
      .sort(() => Math.random() - 0.5)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET personalized recommendations
router.get('/personalized/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 6 } = req.query;
    
    // In production, use user's purchase history and preferences
    const personalized = [...products]
      .sort(() => Math.random() - 0.5)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: personalized
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
