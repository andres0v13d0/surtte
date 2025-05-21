import { useEffect } from 'react';
import { onIdTokenChanged, signOut, getIdToken } from 'firebase/auth';
import { auth } from '../config/firebase';

const useSessionManager = () => {
  useEffect(() => {
    const hoy = new Date().toDateString();
    const fechaGuardada = localStorage.getItem('fecha_sesion');

    if (fechaGuardada && fechaGuardada !== hoy) {
      console.log('⏰ Sesión expirada, cerrando sesión');
      signOut(auth).then(() => {
        localStorage.removeItem('fecha_sesion');
        window.location.reload();
      });
    } else {
      localStorage.setItem('fecha_sesion', hoy);
    }

    // 🔄 Se activa siempre que el token cambie
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      if (user) {
        const fechaSesion = localStorage.getItem('fecha_sesion');
        const hoy = new Date().toDateString();

        if (fechaSesion !== hoy) {
          console.log('🧹 Cerrando sesión porque es otro día');
          signOut(auth).then(() => {
            localStorage.removeItem('fecha_sesion');
            window.location.reload();
          });
        } else {
          console.log('✅ Usuario activo y token actualizado');
        }
      }
    });

    // 🔁 Forzar renovación cada 50 minutos
    const intervalId = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          await getIdToken(user, true);
          console.log('🔁 Token forzado a renovarse');
        } catch (err) {
          console.error('❌ Error forzando renovación de token:', err);
        }
      } else {
        console.warn('⚠️ No hay usuario para renovar token');
      }
    }, 1000 * 60 * 50); // 50 minutos

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);
};

export default useSessionManager;
