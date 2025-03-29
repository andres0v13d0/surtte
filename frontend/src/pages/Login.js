import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../config/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword
} from 'firebase/auth';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Login.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const sendTokenToBackend = async (token) => {
    try {
      const response = await axios.post(
        'https://api.surtte.com/auth/login',
        { token }
      );

      const userData = response.data;

      localStorage.setItem('usuario', JSON.stringify(userData));
      localStorage.setItem('token', token);

      console.log('Usuario autenticado:', userData);
      navigate('/');
    } catch (error) {
      console.error('Error desde el backend:', error);
      if (error.response?.status === 401) {
        alert('Token inválido o usuario no autorizado');
      } else {
        alert('No se pudo autenticar con el servidor');
      }
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
    <>
      <Header minimal={true}/>
      <div className="login-section">
        <h2 id='h-login'>Iniciar sesión</h2>

        <button className='btn-google'
          onClick={loginWithGoogle}
        >
          <FontAwesomeIcon icon={faGoogle} />
          Iniciar con Google
        </button>

        <form className="data-cont" onSubmit={loginWithEmail}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className='btn-send'
            type="submit"
          >
            <FontAwesomeIcon icon={faEnvelope} />
            Iniciar con Correo
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Login;
