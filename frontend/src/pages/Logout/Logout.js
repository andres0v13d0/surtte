import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const cerrarSesion = async () => {
      try {
        await auth.signOut();

        localStorage.removeItem('usuario');
        localStorage.removeItem('token');

        navigate('/');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        navigate('/');
      }
    };

    cerrarSesion();
  }, [navigate]);

  return null;
};

export default Logout;
