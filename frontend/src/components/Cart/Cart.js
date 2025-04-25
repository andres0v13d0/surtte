import React, { useEffect, useState } from 'react';
import './Cart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';

const Cart = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('https://api.surtte.com/cart/count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al obtener cantidad');

        const data = await res.json();
        setCount(data);
      } catch (err) {
        console.error('Error al cargar cantidad del carrito:', err);
      }
    };

    fetchCartCount();
  }, []);

  return (
    <div className='cart' onClick={() => window.location.href = '/cart'}>
      <span id='number'>{count}</span>
      <FontAwesomeIcon id='icon-cart' icon={faCartShopping} />
    </div>
  );
};

export default Cart;
