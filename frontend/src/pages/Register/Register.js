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
import Alert from '../../components/Alert/Alert';

const sendEmailVerificationCode = async (email) => {
  return axios.post('https://api.surtte.com/notifications/verify', {
    channel: 'email',
    type: 'verify_email',
    email
  });
};

const confirmEmailCode = async (email, code) => {
  return axios.post('https://api.surtte.com/notifications/verify/confirm', {
    channel: 'email',
    type: 'verify_email',
    email,
    code
  });
};

const sendPhoneVerificationCode = async (phoneNumber) => {
  return axios.post('https://api.surtte.com/notifications/verify', {
    channel: 'whatsapp',
    type: 'verify_phone',
    phoneNumber,
  });
};

const confirmPhoneCode = async (phoneNumber, code) => {
  return axios.post('https://api.surtte.com/notifications/verify/confirm', {
    channel: 'whatsapp',
    type: 'verify_phone',
    phoneNumber,
    code,
  });
};



const Register = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const [alertType, setAlertType] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendInterval, setResendInterval] = useState(null);


  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    repeatPassword: '',
    firstName: '',
    lastName: '',
    cell: '',
    confirmCellCode: '',
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

  const nextStep = async () => {
    if (step === 1) {
      if (!formData.email.trim()) {
        setAlertType('error');
        setAlertMessage('Por favor ingresa tu correo.');
        setShowAlert(true);
        return;
      }

      try {
        await sendEmailVerificationCode(formData.email.trim());
        setAlertType('success');
        setAlertMessage('¡Listo! Te enviamos un código de verificación a tu correo. Revisa tu bandeja de entrada o spam.');
        setShowAlert(true);
        setStep(2);
      } catch (error) {
        setAlertType('error');
        setAlertMessage('No se pudo enviar el código de verificación.');
        setShowAlert(true);
      }
      return;
    }

    if (step === 2) {
      if (!formData.code.trim()) {
        setAlertType('error');
        setAlertMessage('Debes ingresar el código de verificación.');
        setShowAlert(true);
        return;
      }

      try {
        await confirmEmailCode(formData.email.trim(), formData.code.trim());
        setStep(3);
      } catch (error) {
        setAlertType('error');
        setAlertMessage('Código incorrecto o expirado.');
        setShowAlert(true);
      }
      return;
    }

    if (step === 3) {
      if (!formData.password.trim() || !formData.repeatPassword.trim()) {
        setAlertType('error');
        setAlertMessage('Debes completar ambos campos de contraseña.');
        setShowAlert(true);
        return;
      }

      if (formData.password !== formData.repeatPassword) {
        setAlertType('error');
        setAlertMessage('Las contraseñas no coinciden.');
        setShowAlert(true);
        return;
      }

      if (!passwordValidation.hasLetter || !passwordValidation.hasNumberOrSymbol || !passwordValidation.hasMinLength) {
        setAlertType('error');
        setAlertMessage('La contraseña no cumple con los requisitos.');
        setShowAlert(true);
        return;
      }
    }

    setStep(step + 1);
  };

  const handleSendPhoneCode = async () => {
    if (!formData.cell.trim()) {
      setAlertType('error');
      setAlertMessage('Debes ingresar tu número de celular con + y código de país.');
      setShowAlert(true);
      return;
    }

    try {
      await sendPhoneVerificationCode(formData.cell.trim());
      setAlertType('success');
      setAlertMessage('Te enviamos un código a WhatsApp. Revísalo y escríbelo aquí.');
      setShowAlert(true);

      setResendCooldown(60); // inicia en 60 segundos
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setResendInterval(interval);

    } catch (err) {
      setAlertType('error');
      setAlertMessage('No se pudo enviar el código por WhatsApp.');
      setShowAlert(true);
    }
  };


  useEffect(() => {
    return () => {
      if (resendInterval) clearInterval(resendInterval);
    };
  }, [resendInterval]);


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
        setAlertType('error');
        setAlertMessage('Intentelo de nuevo.');
        setShowAlert(true);
      } else {
        setAlertType('error');
        setAlertMessage('No se pudo autenticar con el servidor');
        setShowAlert(true);
      }
    }
  };

  const completeUserProfile = async (token) => {
    try {
      await axios.post(
        'https://api.surtte.com/users/complete-profile',
        {
          nombre: `${formData.firstName} ${formData.lastName}`,
          telefono: formData.cell,
          departamento: selectedDepartment,
          ciudad: selectedCity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('✅ Perfil completado');
    } catch (error) {
      console.error('Error al completar el perfil:', error);
    }
  };


  useEffect(() => {
    const savedEmail = localStorage.getItem('registerEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }

    if (step === 4 && departments.length === 0) {
      axios.get('https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.json')
        .then((res) => {
          setDepartments(res.data);
        })
        .catch((err) => {
          console.error('Error al cargar ciudades:', err);
        });
    }
  }, [step, departments.length]);

  const handleDepartmentChange = (selected) => {
    const dept = selected?.value;
    setSelectedDepartment(dept);
    setSelectedCity(null);

    const selectedDept = departments.find((d) => d.departamento === dept);
    if (selectedDept) {
      setFilteredCities(selectedDept.ciudades.map(c => ({ value: c, label: c })));
    } else {
      setFilteredCities([]);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.cell.trim() ||
      !formData.confirmCellCode.trim() ||
      !selectedDepartment ||
      !selectedCity
    ) {
      setAlertType('error');
      setAlertMessage('Todos los campos son obligatorios. Por favor completa todos los datos.');
      setShowAlert(true);
      return;
    }

    if (!/^\+\d{6,15}$/.test(formData.cell.trim())) {
      setAlertType('error');
      setAlertMessage('El número de celular debe comenzar con "+" seguido del código del país. Ej: +573001112233');
      setShowAlert(true);
      return;
    }

    try {
      await confirmPhoneCode(formData.cell.trim(), formData.confirmCellCode.trim());
    } catch (err) {
      setAlertType('error');
      setAlertMessage('El código de verificación del celular es incorrecto o ha expirado.');
      setShowAlert(true);
      return;
    }


    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      await updateProfile(result.user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      await result.user.reload();

      const token = await result.user.getIdToken(true);

      await sendTokenToBackend(token);
      await completeUserProfile(token);
      setAlertType('success');
      setAlertMessage('Registro existoso.');
      setShowAlert(true);
    } catch (err) {
      console.error('Error al registrar:', err);
      setAlertType('error');
      setAlertMessage('Hubo un error al registrar el usuario');
      setShowAlert(true);
    }
  };


  return (
    <>
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      <Header minimal={true} />
      <div className="register-container">
        <h2 id="r-title">Crea una nueva cuenta</h2>
        <form className={`step-wrapper step-${step}`}>
          {step === 1 && (
            <div className="step slide-in">
              <div className='step-sup'>
                <div>
                  <h1>Paso 1 de 4</h1>
                  <h2>Ingresa tu correo</h2>
                </div>
              </div>
              <label className='label-register' htmlFor="email">Dirección de correo electrónico</label>
              <input
                type="email"
                name="email"
                placeholder="Ej.: nombre@dominio.com"
                value={formData.email}
                onChange={handleChange}
                className='input-register'
              />
              <button type="button" onClick={nextStep}>Siguiente</button>
              <span id='link-terms'>Al continuar, aceptas los <a href="/condiciones">Términos y condiciones</a></span>
              <div className='line'></div>
              <span id='link-login'>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></span>
            </div>
          )}

          {
            step === 2 && (
              <div className="step slide-in">
                <div className='step-sup'>
                  <button id="btn-back" type="button" onClick={prevStep}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <div>
                    <h1>Paso 2 de 4</h1>
                    <h2>Confirma tu correo electrónico</h2>
                  </div>
                </div>

                <label className='label-register' htmlFor="password">Ingresa el código de confirmación</label>
                <div className="pass-wrapper">
                  <input
                    type='text'
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder='Ej.: 123456'
                  />
                </div>

                <button className='send-code' type="button" onClick={nextStep}>Volver a enviar código</button>

                <button id="last-btn" type="button" onClick={nextStep}>Siguiente</button>

              </div>
            )
          }

          {step === 3 && (
            <div className="step slide-in">
              <div className='step-sup'>
                <button id="btn-back" type="button" onClick={prevStep}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div>
                  <h1>Paso 3 de 4</h1>
                  <h2>Crea una contraseña</h2>
                </div>
              </div>

              <label className='label-register' htmlFor="password">Contraseña</label>
              <div className="pass-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='Ingrese la contraseña'
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
                  placeholder='Repita la contraseña'
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

          {step === 4 && (
            <div className="step slide-in">
              <div className='step-sup'>
                <button id="btn-back" type="button" onClick={prevStep}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div>
                  <h1>Paso 4 de 4</h1>
                  <h2>Información personal</h2>
                </div>
              </div>

              <label className='label-register' htmlFor="firstName">Nombre</label>
              <input
                type="text"
                name="firstName"
                placeholder="Ej.: Juan"
                value={formData.firstName}
                onChange={handleChange}
                className='input-register'
              />

              <label htmlFor="lastName">Apellido</label>
              <input
                type="text"
                name="lastName"
                placeholder="Ej.: Pérez"
                value={formData.lastName}
                onChange={handleChange}
                className='input-register last-name'
              />

              <label className='label-register' htmlFor="cell">Número de celular</label>
              <input
                type="text"
                name="cell"
                placeholder="Ej.: +573101234567"
                value={formData.cell}
                onChange={handleChange}
                className='input-register'
              />

              <button
                className='send-code'
                type="button"
                onClick={handleSendPhoneCode}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Enviar código de confirmación'}
              </button>


              <label className='label-register' htmlFor="cell">Código de confirmación de celular</label>
              <input
                type="text"
                name="confirmCellCode"
                placeholder="Ej.: 123456"
                value={formData.confirmCellCode}
                onChange={handleChange}
                className='input-register last-name'
              />


              <div className='address-cont'>
                <label className='label-register address' htmlFor="department">Departamento</label>
                <Select
                  options={departments.map(dep => ({ value: dep.departamento, label: dep.departamento }))}
                  placeholder="Selecciona tu departamento..."
                  value={selectedDepartment ? { value: selectedDepartment, label: selectedDepartment } : null}
                  onChange={handleDepartmentChange}
                  isClearable
                  classNamePrefix="mi"
                  name='departamento'
                />

                <div className='blank'></div>

                <label className='city address' htmlFor="city">Ciudad</label>
                <Select
                  options={filteredCities}
                  placeholder="Selecciona tu ciudad..."
                  value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                  onChange={(selected) => setSelectedCity(selected?.value || null)}
                  isClearable
                  classNamePrefix="mi"
                  name='city'
                />
              </div>

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
