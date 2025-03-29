import React, { useEffect, useState } from 'react';
import './Menu.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faX } from '@fortawesome/free-solid-svg-icons';

const Menu = ({ isOpen, onClose }) => {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('usuario');
        if (userData) {
          setUsuario(JSON.parse(userData));
        }
      }, []);
      
    return (
        <div className={`cont-menu ${isOpen ? 'open' : ''}`}>
            <button className="close-btn" onClick={onClose}>
                <FontAwesomeIcon id='icon-cart' icon={faX} />
            </button>
            <div className='cont-user'>
                <FontAwesomeIcon id='icon-user' icon={faUser} />
                {usuario ? (
                    <div className='info-user'>
                        <h1 id='h-user'>{usuario.nombre}</h1>
                        <a href="/logout" id='a-user'>Cerrar sesión</a>
                    </div>
                ) : (
                    <div className='login'>
                        <a href="/login" id='a-login'>Iniciar sesión</a>
                    </div>
                )}  
            </div>
        </div>
    );
};

export default Menu;
