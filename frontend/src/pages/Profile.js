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
                        ¡Bienvenido , <span className='user-name'>{usuario.nombre}</span>!
                        <div className='user-buttons'>
                            <Link to="/profile" className='user-button'>
                                <FontAwesomeIcon icon={faMessage} />
                                    Mensajes
                                <FontAwesomeIcon icon={faChevronRight} id='' />
                            </Link>
                            <Link to="/profile" className='user-button'>
                                <FontAwesomeIcon icon={faReceipt} /> Mis pedidos
                            </Link>
                            <Link to="/profile" className='user-button'>
                                <FontAwesomeIcon icon={faStar} /> Favoritos
                            </Link>
                            <Link to="/profile" className='user-button'>
                                <FontAwesomeIcon icon={faGear} /> Configuración
                            </Link>
                            <Link to="/profile" className='user-button'>
                                <FontAwesomeIcon icon={faHeadset} /> Atención al cliente
                            </Link>
                            <Link to="/logout" className='user-button'>
                                <FontAwesomeIcon icon={faRightFromBracket} /> Cerrar sesión
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
