import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../src/context/CartContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error(error));
  }, []);

  const handleAddToCart = (productId) => {
    const quantity = 1;  // Example quantity, you can change it
    addToCart(productId, quantity);
  };

  return (
    <div>
      {products.map(product => (
        <div key={product._id}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p>{product.price}</p>
          <button onClick={() => handleAddToCart(product._id)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
