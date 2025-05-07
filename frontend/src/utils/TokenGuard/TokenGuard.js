import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TokenGuard = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');

    const tokenValido = '7d4f1e93-927b-4817-89d1-b27a8ea96347';
    const duracionMaxima = 10 * 60 * 1000;

    const tokenGuardado = localStorage.getItem('surtte_token');
    const timestampGuardado = localStorage.getItem('surtte_token_time');

    const ahora = Date.now();

    if (tokenFromUrl === tokenValido) {
      localStorage.setItem('surtte_token', tokenFromUrl);
      localStorage.setItem('surtte_token_time', ahora.toString());
      return;
    }

    if (
      !tokenGuardado ||
      tokenGuardado !== tokenValido ||
      !timestampGuardado ||
      ahora - parseInt(timestampGuardado, 10) > duracionMaxima
    ) {
      localStorage.removeItem('surtte_token');
      localStorage.removeItem('surtte_token_time');
      window.location.href = 'https://surtte.com';
    }
  }, [location.search]);

  return children;
};

export default TokenGuard;
