import React from 'react';
import { Link } from 'react-router-dom';
import './NavInf.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faList, faUser } from '@fortawesome/free-solid-svg-icons';
import Cart from '../Cart/Cart';

const NavInf = ({ selected }) => {
    return (
        <nav className='navInf'>
            <ul>
                <li>
                    <Link to="/" className={selected === 'home' ? 'selected' : ''}>
                        <span className='navInf-icon'>
                            <FontAwesomeIcon id='icon-ul' icon={faHouse} />
                        </span>
                        Inicio
                    </Link>
                </li>
                <li>
                    <Link to="/categories" className={selected === 'categories' ? 'selected' : ''}>
                        <span className='navInf-icon'>
                            <FontAwesomeIcon id='icon-ul' icon={faList} />
                        </span>
                        Categorías
                    </Link>
                </li>
                <li>
                    <Link to="/profile" className={selected === 'profile' ? 'selected' : ''}>
                        <span className='navInf-icon'>
                            <FontAwesomeIcon id='icon-ul' icon={faUser} />
                        </span>
                        Perfil
                    </Link>
                </li>
                <li>
                    <Link to="/cart" className={selected === 'cart' ? 'selected' : ''}>
                        <span className='navInf-icon'>
                            <Cart />                        
                        </span>
                        Carrito
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavInf;
