import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../config/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import axios from 'axios';
import './Login.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import BrandLogo from '../components/BrandLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPass, setShowPass] = useState(false);
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, '');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        localStorage.setItem('registerEmail', email);
        navigate('/register');
      } else if (err.code === 'auth/missing-password' || err.code === 'auth/wrong-password') {
        setShowPasswordSection(true);
        console.log(err.code);
      } else {
        alert('Error al verificar el correo');
        console.error('Firebase auth error:', err);
      }
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
      <Header minimal={true} />

      {!showPasswordSection && (
        <div className="login-section">
          <h2 id='h-login'>Inicia sesión o crea tu cuenta</h2>

          <button className='btn-login' onClick={loginWithGoogle}>
            <BrandLogo name="google" size={20} />
            Continuar con Google
          </button>

          <button className='btn-login' onClick={loginWithGoogle}>
            <BrandLogo name="facebook" size={20} />
            Continuar con Facebook
          </button>

          <button className='btn-login' onClick={loginWithGoogle}>
            <BrandLogo name="apple" size={20} />
            Continuar con Apple
          </button>

          <div className='line-bw'>
            <div className='line'></div>
            <span>O</span>
            <div className='line'></div>
          </div>

          <p id='p-login'>Usa tu correo electrónico para iniciar sesión</p>

          <form className="data-cont" onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className='btn-login' type="submit">Continuar</button>
          </form>
        </div>
      )}

      {showPasswordSection && (
        <div className="login-password">
          <h2>Introduce tu contraseña</h2>
          <form onSubmit={loginWithEmail}>
            <input
              type="email"
              value={email}
              disabled
            />
            <div className="pass-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
              </span>
            </div>
            <button className='btn-login' type="submit">Iniciar sesión</button>
          </form>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Login;
