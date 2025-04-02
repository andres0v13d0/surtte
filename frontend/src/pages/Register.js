import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    repeatPassword: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('registerEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordValidation = {
    hasLetter: /[a-zA-Z]/.test(formData.password),
    hasNumberOrSymbol: /[\d\W]/.test(formData.password),
    hasMinLength: formData.password.length >= 10,
  };

  const nextStep = () => {
    if (step === 1 && !formData.email) {
      alert('Por favor ingresa tu correo');
      return;
    }
    if (step === 2 && formData.password !== formData.repeatPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

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
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const token = await result.user.getIdToken();
      await sendTokenToBackend(token);
    } catch (err) {
      console.error('Error al registrar:', err);
      alert('Hubo un error al registrar el usuario');
    }
  };
  

  return (
    <>
      <Header minimal={true} />
      <div className="register-container">
        <h2 id="r-title">Crea una nueva cuenta</h2>
        <form className={`step-wrapper step-${step}`}>
          {step === 1 && (
            <div className="step slide-in">
              <div className='step-sup'>
                <h1>Paso 1 de 3</h1>
                <h2>Ingresa tu correo</h2>
              </div>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
              />
              <button type="button" onClick={nextStep}>Siguiente</button>
            </div>
          )}

          {step === 2 && (
            <div className="step slide-in">
              <h2>Paso 2: Crea una contraseña</h2>

              <div className="pass-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </span>
              </div>

              <div className="pass-wrapper">
                <input
                  type={showRepeat ? 'text' : 'password'}
                  name="repeatPassword"
                  placeholder="Repetir contraseña"
                  value={formData.repeatPassword}
                  onChange={handleChange}
                />
                <span className="toggle-pass" onClick={() => setShowRepeat(!showRepeat)}>
                  <FontAwesomeIcon icon={showRepeat ? faEyeSlash : faEye} />
                </span>
              </div>

              <div className="password-checklist">
                <p className={passwordValidation.hasLetter ? 'valid' : ''}>
                  {passwordValidation.hasLetter ? '●' : '◯'} Al menos 1 letra
                </p>
                <p className={passwordValidation.hasNumberOrSymbol ? 'valid' : ''}>
                  {passwordValidation.hasNumberOrSymbol ? '●' : '◯'} Número o carácter especial
                </p>
                <p className={passwordValidation.hasMinLength ? 'valid' : ''}>
                  {passwordValidation.hasMinLength ? '●' : '◯'} Mínimo 10 caracteres
                </p>
              </div>

              <div className="buttons">
                <button type="button" onClick={prevStep}>
                  <FontAwesomeIcon icon={faChevronLeft} /> Atrás
                </button>
                <button type="button" onClick={nextStep}>Siguiente</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step slide-in">
              <h2>Paso 3: Información personal</h2>
              <input
                type="text"
                name="firstName"
                placeholder="Nombre"
                value={formData.firstName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Apellido"
                value={formData.lastName}
                onChange={handleChange}
              />
              <div className="buttons">
                <button type="button" onClick={prevStep}>
                  <FontAwesomeIcon icon={faChevronLeft} /> Atrás
                </button>
                <button type="submit" onClick={handleSubmit}>Registrarme</button>
              </div>
            </div>
          )}
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Register;
