const express = require('express');
const router = express.Router();

// In-memory product database (replace with MongoDB in production)
const products = [
  { 
    id: 1, 
    name: 'Sony WH-1000XM5 Headphones', 
    category: 'electronics', 
    price: 399, 
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    description: 'Industry-leading noise cancellation with premium sound quality',
    stock: 50,
    rating: 4.8,
    reviews: 1250
  },
  { 
    id: 2, 
    name: 'Apple Watch Series 9', 
    category: 'electronics', 
    price: 499, 
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&q=80',
    description: 'Advanced health features with stunning display',
    stock: 35,
    rating: 4.9,
    reviews: 2100
  },
  { 
    id: 3, 
    name: 'Ray-Ban Aviator Sunglasses', 
    category: 'fashion', 
    price: 199, 
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80',
    description: 'Classic aviator style with UV protection',
    stock: 100,
    rating: 4.7,
    reviews: 850
  },
  { 
    id: 4, 
    name: 'Premium Leather Wallet', 
    category: 'accessories', 
    price: 89, 
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80',
    description: 'Handcrafted genuine leather wallet',
    stock: 75,
    rating: 4.6,
    reviews: 420
  },
  { 
    id: 5, 
    name: 'JBL Charge 5 Speaker', 
    category: 'electronics', 
    price: 179, 
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80',
    description: 'Powerful portable Bluetooth speaker',
    stock: 60,
    rating: 4.7,
    reviews: 980
  },
  { 
    id: 6, 
    name: 'Designer Leather Handbag', 
    category: 'fashion', 
    price: 799, 
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
    description: 'Luxury designer handbag with premium finish',
    stock: 25,
    rating: 4.9,
    reviews: 650
  },
  { 
    id: 7, 
    name: 'Nike Premium Backpack', 
    category: 'accessories', 
    price: 149, 
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    description: 'Durable backpack with multiple compartments',
    stock: 80,
    rating: 4.5,
    reviews: 720
  },
  { 
    id: 8, 
    name: 'Canon EOS R6 Camera', 
    category: 'electronics', 
    price: 2499, 
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
    description: 'Professional mirrorless camera',
    stock: 15,
    rating: 4.9,
    reviews: 340
  },
  { 
    id: 9, 
    name: 'Oakley Sport Sunglasses', 
    category: 'fashion', 
    price: 249, 
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80',
    description: 'High-performance sport sunglasses',
    stock: 45,
    rating: 4.6,
    reviews: 530
  },
  { 
    id: 10, 
    name: 'Wireless Earbuds Pro', 
    category: 'electronics', 
    price: 249, 
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80',
    description: 'Premium wireless earbuds with ANC',
    stock: 90,
    rating: 4.7,
    reviews: 1450
  },
  { 
    id: 11, 
    name: 'Luxury Wrist Watch', 
    category: 'accessories', 
    price: 899, 
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    description: 'Swiss-made luxury timepiece',
    stock: 20,
    rating: 4.8,
    reviews: 280
  },
  { 
    id: 12, 
    name: 'Premium Denim Jacket', 
    category: 'fashion', 
    price: 189, 
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
    description: 'Classic denim jacket with modern fit',
    stock: 55,
    rating: 4.5,
    reviews: 610
  }
];

// GET all products
router.get('/', (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort } = req.query;
    
    let filteredProducts = [...products];
    
    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    // Filter by price range
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    // Search by name
    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort products
    if (sort === 'price-asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filteredProducts.sort((a, b) => b.rating - a.rating);
    }
    
    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET single product by ID
router.get('/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET products by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const filteredProducts = products.filter(p => p.category === category);
    
    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
