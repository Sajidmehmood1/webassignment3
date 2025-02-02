const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// GET /products: Fetch all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /cart: Add a product to the cart
router.post('/cart', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    const productIndex = cart.products.findIndex(p => p.productId == productId);
    if (productIndex >= 0) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /cart: Update quantity
router.put('/cart', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const product = cart.products.find(p => p.productId == productId);
    if (product) {
      product.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /cart: Remove product
router.delete('/cart', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.products = cart.products.filter(p => p.productId != productId);

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /cart: Fetch user cart
router.get('/cart', async (req, res) => {
  const { userId } = req.query;
  try {
    const cart = await Cart.findOne({ userId }).populate('products.productId');
    if (!cart) return res.json({ products: [], totalPrice: 0 });

    const totalPrice = cart.products.reduce((acc, item) => {
      return acc + item.productId.price * item.quantity;
    }, 0);

    res.json({ products: cart.products, totalPrice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
