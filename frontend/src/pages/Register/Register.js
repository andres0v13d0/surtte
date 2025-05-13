import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const Register = () => {
  const [cities, setCities] = useState([]);
  const [setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');


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

  useEffect(() => {
    const savedEmail = localStorage.getItem('registerEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }

    if (step === 3 && cities.length === 0) {
      axios.get('https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.json')
        .then((res) => {
          const allCities = res.data.flatMap(dpto => dpto.ciudades);
          setCities(allCities);
          setFilteredCities(allCities);
        })
        .catch((err) => {
          console.error('Error al cargar ciudades:', err);
        });
    }
  }, [step, cities.length, setFilteredCities]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      await updateProfile(result.user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      await result.user.reload();
      
      const token = await result.user.getIdToken(true);

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
                <div>
                  <h1>Paso 1 de 3</h1>
                  <h2>Ingresa tu correo</h2>
                </div>
              </div>
              <label htmlFor="email">Dirección de correo electrónico</label>
              <input
                type="email"
                name="email"
                placeholder="nombre@dominio.com"
                value={formData.email}
                onChange={handleChange}
              />
              <button type="button" onClick={nextStep}>Siguiente</button>
              <span id='link-terms'>Al continuar, aceptas los <a href="/">Términos y condiciones</a></span>
              <div className='line'></div>
              <span id='link-login'>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></span>  
            </div>
          )}

          {step === 2 && (
            <div className="step slide-in">
              <div className='step-sup'>
                <button id="btn-back" type="button" onClick={prevStep}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div>
                  <h1>Paso 2 de 3</h1>
                  <h2>Crea una contraseña</h2>
                </div>
              </div>

              <label htmlFor="password">Contraseña</label>
              <div className="pass-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </span>
              </div>

              <label htmlFor="repeatPassword">Repetir contraseña</label>
              <div className="pass-wrapper">
                <input
                  type={showRepeat ? 'text' : 'password'}
                  name="repeatPassword"
                  value={formData.repeatPassword}
                  onChange={handleChange}
                />
                <span className="toggle-pass" onClick={() => setShowRepeat(!showRepeat)}>
                  <FontAwesomeIcon icon={showRepeat ? faEyeSlash : faEye} />
                </span>
              </div>

              <div className="password-checklist">
                <p className={passwordValidation.hasLetter ? 'valid' : 'invalid'}>
                  {passwordValidation.hasLetter ? ' ✔ ' : ''} Al menos 1 letra
                </p>
                <p className={passwordValidation.hasNumberOrSymbol ? 'valid' : 'invalid'}>
                  {passwordValidation.hasNumberOrSymbol ? ' ✔ ' : ''} Número o carácter especial
                </p>
                <p className={passwordValidation.hasMinLength ? 'valid' : 'invalid'}>
                  {passwordValidation.hasMinLength ? ' ✔ ' : ''} Mínimo 10 caracteres
                </p>
              </div>
              <button id="last-btn" type="button" onClick={nextStep}>Siguiente</button>

            </div>
          )}

          {step === 3 && (
            <div className="step slide-in">
              <div className='step-sup'>
                <button id="btn-back" type="button" onClick={prevStep}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div>
                  <h1>Paso 3 de 3</h1>
                  <h2>Información personal</h2>
                </div>
              </div>

              <label htmlFor="firstName">Nombre</label>
              <input
                type="text"
                name="firstName"
                placeholder="Nombre"
                value={formData.firstName}
                onChange={handleChange}
              />

              <label htmlFor="lastName">Apellido</label>
              <input
                type="text"
                name="lastName"
                placeholder="Apellido"
                value={formData.lastName}
                onChange={handleChange}
              />
              <label>Ciudad</label>
              <Select
                options={cities.map(city => ({ value: city, label: city }))}
                placeholder="Selecciona tu ciudad..."
                value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                onChange={(selected) => setSelectedCity(selected?.value || '')}
                isClearable
                classNamePrefix="select-city"
              />

              <button id="last-btn" type="submit" onClick={handleSubmit}>Registrarme</button>
            </div>
          )}
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Register;
