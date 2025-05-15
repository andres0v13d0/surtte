import React, { useEffect, useState } from 'react';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBasket, faReceipt, faStar, faGear, faHeadset, faRightFromBracket, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import NavInf from '../../components/NavInf/NavInf';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('usuario');
        if (userData) {
          setUsuario(JSON.parse(userData));
        }
      }, []);
      
    return (
        <>
            <Header />
            <div className='profile-container'>   
                {usuario ? (
                    <div className='user-container'>
                        <div className='user-info'>
                            ¡Bienvenido,<span className='user-name'>
                                {usuario.nombre.split(' ')[0].slice(0, 15)}
                                </span>!
                        </div>
                        <div className='user-buttons'>
                            {usuario.rol === 'proveedor' && (
                                <Link to="/my-products" className="user-button mg">
                                    <span className="icon-left">
                                        <FontAwesomeIcon icon={faShoppingBasket} />
                                    </span>
                                    <span className="text">Panel de proveedor</span>
                                    <span className="icon-right">
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </span>
                                </Link>
                            )}

                            {usuario.rol === 'admin' && (
                                <Link to="/admin" className="user-button mg">
                                    <span className="icon-left">
                                    <FontAwesomeIcon icon={faShoppingBasket} />
                                    </span>
                                    <span className="text">Panel de administrador</span>
                                    <span className="icon-right">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                    </span>
                                </Link>
                            )}

                            <Link to="/mis-pedidos" className="user-button">
                                <span className="icon-left">
                                    <FontAwesomeIcon icon={faReceipt} />
                                </span>
                                <span className="text">Mis pedidos</span>
                                <span className="icon-right">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </span>
                            </Link>

                            <Link to="/favorites" className="user-button">
                                <span className="icon-left">
                                    <FontAwesomeIcon icon={faStar} />
                                </span>
                                <span className="text">Favoritos</span>
                                <span className="icon-right">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </span>
                            </Link>

                            <Link to="/profile" className="user-button">
                                <span className="icon-left">
                                    <FontAwesomeIcon icon={faGear} />
                                </span>
                                <span className="text">Configuración</span>
                                <span className="icon-right">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </span>
                            </Link>

                            <Link to="/profile" className="user-button">
                                <span className="icon-left">
                                    <FontAwesomeIcon icon={faHeadset} />
                                </span>
                                <span className="text">Atención al cliente</span>
                                <span className="icon-right">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </span>
                            </Link>

                            <Link to="/logout" className="user-button logout">
                                <span className="icon-left">
                                    <FontAwesomeIcon icon={faRightFromBracket} />
                                </span>
                                <span className="text">Cerrar sesión</span>
                                <span className="icon-right">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className='no-user-container'>
                        <h2>No has iniciado sesión</h2>
                        <p>Para ver tu perfil, por favor inicia sesión.</p>
                        <Link to="/login" className="btn-login">Iniciar sesión</Link>
                    </div>
                )}  
            </div>
            <NavInf selected={"profile"} /> 
            <Footer />
        </>
    );
};

export default Profile;
