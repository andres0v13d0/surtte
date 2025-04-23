import React from 'react';
import './Cart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';

const Cart = () => {
    return (
        <div className='cart' onClick={() => window.location.href = '/cart'}>
            <span id='number'>0</span>
            <FontAwesomeIcon id='icon-cart' icon={faCartShopping} />
        </div>
    );
}

export default Cart;