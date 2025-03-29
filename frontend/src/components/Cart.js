import React from 'react';
import './Cart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';

const Cart = () => {
    return (
        <div className='cart'>
            <FontAwesomeIcon id='icon-cart' icon={faCartShopping} />
            <span id='number'>0</span>
        </div>
    );
}

export default Cart;