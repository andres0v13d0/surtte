import React, { useEffect, useState } from 'react';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faReceipt, faStar, faGear, faHeadset, faRightFromBracket, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavInf from '../components/NavInf';
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
                            ¡Bienvenido,<span className='user-name'>{usuario.nombre}</span>!
                        </div>
                        <div className='user-buttons'>
                            <Link to="/profile" className="user-button mg">
                                <span className="icon-left">
                                    <FontAwesomeIcon icon={faMessage} />
                                </span>
                                <span className="text">Mensajes</span>
                                <span className="icon-right">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </span>
                            </Link>

                            <Link to="/profile" className="user-button">
                                <span className="icon-left">
                                    <FontAwesomeIcon icon={faReceipt} />
                                </span>
                                <span className="text">Mis pedidos</span>
                                <span className="icon-right">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </span>
                            </Link>

                            <Link to="/profile" className="user-button">
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
