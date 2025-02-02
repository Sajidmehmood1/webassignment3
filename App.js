// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '.assignment/frontend/App.css'; // Global styles
import '.assignment/frontend/styles/style.css'; // Component-specific styles
import ProductList from '.assignment/frontend/components/ProductList';
import Cart from '.assignment/frontend/components/Cart';
import { CartContextProvider } from '.assignment/frontend/context/CartContext';

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => console.error("There was an error fetching the products", error));
  }, []);

  const addToCart = (product) => {
    const existingProduct = cart.find(item => item.product._id === product._id);
    if (existingProduct) {
      existingProduct.quantity += 1;
      setCart([...cart]);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const productInCart = cart.find(item => item.product._id === productId);
    if (productInCart) {
      productInCart.quantity = quantity;
      setCart([...cart]);
    }
  };

  return (
    <CartContextProvider value={{ cart, setCart }}>
      <div className="App">
        <header className="App-header">
          <h1>Product Catalog</h1>
        </header>

        {/* Display products */}
        <ProductList products={products} addToCart={addToCart} />

        {/* Display Cart */}
        <Cart cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />
      </div>
    </CartContextProvider>
  );
};

export default App;
