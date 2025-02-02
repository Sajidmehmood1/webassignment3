// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB (replace with your own connection string)
mongoose.connect('mongodb://localhost:27017/cartapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
});

const Product = mongoose.model('Product', productSchema);

// Cart Schema
const cartSchema = new mongoose.Schema({
    userId: String,
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number,
        },
    ],
});

const Cart = mongoose.model('Cart', cartSchema);

// Routes

// GET /products - Fetch all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// POST /cart - Add a product to the cart
app.post('/cart', async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create a new cart if it doesn't exist
            cart = new Cart({ userId, products: [{ productId, quantity }] });
        } else {
            // Update the existing cart
            const productInCart = cart.products.find((item) => item.productId.toString() === productId);
            if (productInCart) {
                // If product exists, update its quantity
                productInCart.quantity += quantity;
            } else {
                // Add new product to cart
                cart.products.push({ productId, quantity });
            }
        }

        await cart.save();
        res.status(200).json({ message: 'Product added to cart successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error });
    }
});

// PUT /cart - Update the quantity of a product in the cart
app.put('/cart', async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const productInCart = cart.products.find((item) => item.productId.toString() === productId);

        if (!productInCart) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Update quantity
        productInCart.quantity = quantity;

        await cart.save();
        res.status(200).json({ message: 'Cart updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error });
    }
});

// DELETE /cart - Remove a product from the cart
app.delete('/cart', async (req, res) => {
    const { userId, productId } = req.body;

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Remove product from cart
        cart.products.splice(productIndex, 1);
        await cart.save();

        res.status(200).json({ message: 'Product removed from cart successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing product from cart', error });
    }
});

// GET /cart - Fetch the current cart for a user, including total price
app.get('/cart', async (req, res) => {
    const { userId } = req.query;

    try {
        const cart = await Cart.findOne({ userId }).populate('products.productId');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Calculate total price
        let totalPrice = 0;
        cart.products.forEach((item) => {
            totalPrice += item.quantity * item.productId.price;
        });

        res.status(200).json({ cart: cart.products, totalPrice });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
