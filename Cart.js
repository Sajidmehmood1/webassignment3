import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { CartContext } from '../src/context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity } = useContext(CartContext);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const calculateTotal = () => {
      let totalPrice = 0;
      cart.forEach(item => {
        totalPrice += item.productId.price * item.quantity;
      });
      setTotal(totalPrice);
    };
    calculateTotal();
  }, [cart]);

  return (
    <div>
      {cart.map(item => (
        <div key={item.productId._id}>
          <h4>{item.productId.name}</h4>
          <p>Price: {item.productId.price}</p>
          <p>Quantity: {item.quantity}</p>
          <button onClick={() => removeFromCart(item.productId._id)}>Remove</button>
          <button onClick={() => updateCartQuantity(item.productId._id, item.quantity + 1)}>Increase Quantity</button>
        </div>
      ))}
      <h3>Total: {total}</h3>
    </div>
  );
};

export default Cart;
