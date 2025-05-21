import React, { useEffect, useState } from 'react';
import './Cart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { secureFetch } from '../../utils/secureFetch';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase'; // ajusta ruta si es necesario

const Cart = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await secureFetch('https://api.surtte.com/cart/count');
        if (!res.ok) throw new Error('Error al obtener cantidad');

        const data = await res.json();
        setCount(data);
      } catch (err) {
        console.error('Error al cargar cantidad del carrito:', err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCartCount();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className='cart'>
      <span id='number'>{count}</span>
      <FontAwesomeIcon id='icon-cart' icon={faCartShopping} />
    </div>
  );
};

export default Cart;
