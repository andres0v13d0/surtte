import React, { useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword
} from 'firebase/auth';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const sendTokenToBackend = async (token) => {
    try {
      const response = await axios.post(
        'https://api.surtte.com/auth/login',
        { token }
      );

      const userData = response.data;
      console.log('Usuario autenticado:', userData);
      alert(`Bienvenido, ${userData.nombre}`);

      localStorage.setItem('usuario', JSON.stringify(userData));

    } catch (error) {
      console.error('Error desde el backend:', error);
      alert('No se pudo autenticar con el servidor');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await sendTokenToBackend(token);
    } catch (err) {
      console.error('Error con Google:', err);
      alert('Error al iniciar sesión con Google');
    }
  };

  const loginWithEmail = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      await sendTokenToBackend(token);
    } catch (err) {
      console.error('Error con email/password:', err);
      alert('Correo o contraseña incorrectos');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center' }}>Iniciar sesión</h2>

      <button
        onClick={loginWithGoogle}
        style={{
          width: '100%',
          padding: '0.5rem',
          marginBottom: '1rem',
          backgroundColor: '#4285F4',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <FontAwesomeIcon icon="fa-brands fa-google" />
        Iniciar con Google
      </button>

      <form onSubmit={loginWithEmail}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <FontAwesomeIcon icon="fa-solid fa-envelope" />
          Iniciar con Correo
        </button>
      </form>
    </div>
  );
};

export default Login;