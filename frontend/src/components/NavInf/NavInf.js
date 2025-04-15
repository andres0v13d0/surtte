import React from 'react';
import { Link } from 'react-router-dom';
import './NavInf.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faList, faUser, faComments } from '@fortawesome/free-solid-svg-icons';

const NavInf = ({ selected }) => {
    return (
        <nav className='navInf'>
            <ul>
                <li>
                    <Link to="/" className={selected === 'home' ? 'selected' : ''}>
                        <span className='navInf-icon'>
                            <FontAwesomeIcon icon={faHouse} />
                        </span>
                        Inicio
                    </Link>
                </li>
                <li>
                    <Link to="/categories" className={selected === 'categories' ? 'selected' : ''}>
                        <span className='navInf-icon'>
                            <FontAwesomeIcon icon={faList} />
                        </span>
                        Categorías
                    </Link>
                </li>
                <li>
                    <Link to="/profile" className={selected === 'profile' ? 'selected' : ''}>
                        <span className='navInf-icon'>
                            <FontAwesomeIcon icon={faUser} />
                        </span>
                        Perfil
                    </Link>
                </li>
                <li>
                    <Link to="/messages" className={selected === 'messages' ? 'selected' : ''}>
                        <span className='navInf-icon'>
                            <FontAwesomeIcon icon={faComments} />
                        </span>
                        Mensajes
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavInf;
